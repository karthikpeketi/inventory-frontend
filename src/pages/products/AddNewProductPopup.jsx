import { useState, useCallback, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import SearchableSelect from "../../components/ui/SearchableSelect.jsx";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../api";
import { categoryService } from "../../api";
import { Input } from "../../components/ui/input";

const AddNewProductPopup = ({ isOpen, onOpenChange, onProductAdded }) => {
	const [newProduct, setNewProduct] = useState({
		name: "",
		sku: "",
		categoryId: "",
		unitPrice: "",
		costPrice: "",
		quantity: "",
		reorderLevel: "10",
		description: "",
	});

	const { toast } = useToast();
	const { user } = useAuth();

	const [addProductLoading, setAddProductLoading] = useState(false);
	const [addProductError, setAddProductError] = useState(null);

	const createProductApi = async (productData, userId) => {
		setAddProductLoading(true);
		setAddProductError(null);
		try {
			const result = await productService.createProduct(productData, userId);
			return result;
		} catch (err) {
			setAddProductError(err.response?.data?.message || err.message);
			throw err;
		} finally {
			setAddProductLoading(false);
		}
	};

	const fetchCategories = async (searchTerm, page, limit) => {
		try {
			const data = await categoryService.getCategories(page - 1, limit, 'name', 'asc', searchTerm);
			return data.content || [];
		} catch (error) {
			console.error("Error fetching categories:", error);
			toastUtils.patterns.crud.category.loadFailed(toast);
			return [];
		}
	};

	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setNewProduct((prev) => ({ ...prev, [id]: value }));
	};

	const handleAddProduct = async (e) => {
		e.preventDefault();

		if (!user || !user.id) {
			toastUtils.patterns.auth.userNotAvailable(toast);
			return;
		}

		if (isNaN(parseInt(newProduct.reorderLevel))) {
			toastUtils.patterns.validation.integerRequired(toast, "Reorder Level");
			return;
		}

		if (isNaN(parseInt(newProduct.quantity))) {
			toastUtils.patterns.validation.integerRequired(toast, "Quantity");
			return;
		}

		if (isNaN(parseFloat(newProduct.unitPrice))) {
			toastUtils.patterns.validation.numberRequired(toast, "Unit Price");
			return;
		}

		if (isNaN(parseFloat(newProduct.costPrice))) {
			toastUtils.patterns.validation.numberRequired(toast, "Cost Price");
			return;
		}

		if (parseFloat(newProduct.costPrice) >= parseFloat(newProduct.unitPrice)) {
			toastUtils.patterns.validation.costPriceTooHigh(toast);
			return;
		}

		const productData = {
			...newProduct,
			reorderLevel: newProduct.reorderLevel || "10",
		};

		try {
			const created = await createProductApi(productData, user.id);
			toastUtils.patterns.crud.createSuccess(toast, "Product");
			onProductAdded(created);
			onOpenChange(false);
		} catch (error) {
			toastUtils.patterns.crud.product.createFailed(toast);
		} finally {
			setNewProduct({
				name: "",
				sku: "",
				categoryId: "",
				unitPrice: "",
				costPrice: "",
				quantity: "",
				reorderLevel: "10",
				description: "",
			});
		}
	};

	const {
		name,
		sku,
		categoryId,
		unitPrice,
		costPrice,
		quantity,
		reorderLevel,
		description,
	} = newProduct;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Product</DialogTitle>
					<DialogDescription>
						Fill in the details to add a new product to your inventory.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleAddProduct} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Product Name</Label>
							<Input
								id="name"
								value={name}
								onChange={handleInputChange}
								required
								maxLength={255}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="sku">SKU</Label>
							<Input
								id="sku"
								value={sku}
								onChange={handleInputChange}
								required
								maxLength={15}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={handleInputChange}
							className="w-full"
							maxLength={225}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="categoryId">Category</Label>
							<div className="relative"> {/* Added relative div */}
								<SearchableSelect
									fetchOptions={fetchCategories}
									onSelect={(category) =>
										setNewProduct((prev) => ({
											...prev,
											categoryId: category.id,
										}))
									}
									placeholder="Select a category"
									value={categoryId}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="unitPrice">Unit Price</Label>
							<Input
								id="unitPrice"
								type="number"
								value={unitPrice}
								onChange={handleInputChange}
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="costPrice">Cost Price</Label>
							<Input
								id="costPrice"
								type="number"
								value={costPrice}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="quantity">Quantity</Label>
							<Input
								id="quantity"
								type="number"
								value={quantity}
								onChange={handleInputChange}
								required
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="reorderLevel">Reorder Level</Label>
						<Input
							id="reorderLevel"
							type="number"
							value={reorderLevel}
							onChange={handleInputChange}
							required
						/>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={addProductLoading}>
							{addProductLoading ? "Adding..." : "Add Product"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddNewProductPopup;
