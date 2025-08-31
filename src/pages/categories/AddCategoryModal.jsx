import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import { categoryService } from "../../api";

const AddCategoryModal = ({ isOpen, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user types
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Category name is required";
		} else if (formData.name.length > 100) {
			newErrors.name = "Category name must be less than 100 characters";
		}

		if (formData.description && formData.description.length > 255) {
			newErrors.description = "Description must be less than 255 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const newCategory = await categoryService.createCategory(formData);

			// Reset form
			setFormData({
				name: "",
				description: "",
			});

			// Call success callback
			onSuccess(newCategory);
		} catch (error) {
			toastUtils.patterns.crud.category.addFailed(toast, error.message || "An error occurred while adding the category.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		// Reset form and errors when closing
		setFormData({
			name: "",
			description: "",
		});
		setErrors({});
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Category</DialogTitle>
					<DialogDescription>
						Create a new category for organizing products.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="text-right">
							Category Name <span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Enter category name"
							className={errors.name ? "border-red-500" : ""}
						/>
						{errors.name && (
							<p className="text-red-500 text-sm">{errors.name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description" className="text-right">
							Description
						</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Enter category description (optional)"
							className={errors.description ? "border-red-500" : ""}
							rows={4}
						/>
						{errors.description && (
							<p className="text-red-500 text-sm">{errors.description}</p>
						)}
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Adding..." : "Add Category"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddCategoryModal;
