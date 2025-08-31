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
import { Switch } from "../../components/ui/switch";

const EditProductModal = ({ isOpen, onOpenChange, onProductEdited, productToEdit }) => {
	const [editProduct, setEditProduct] = useState({
		name: "",
		sku: "",
		categoryId: "",
		unitPrice: "",
		costPrice: "",
		quantity: "",
		reorderLevel: "",
		description: "",
		isActive: true,
	});

	const { toast } = useToast();
	const { user, isAdmin } = useAuth();

	const [editProductLoading, setEditProductLoading] = useState(false);
	const [editProductError, setEditProductError] = useState(null);
	const [originalQuantity, setOriginalQuantity] = useState(0);

	// Initialize form with product data when productToEdit changes
	useEffect(() => {
		if (productToEdit) {
			setEditProduct({
				name: productToEdit.name || "",
				sku: productToEdit.sku || "",
				categoryId: productToEdit.categoryId || "",
				unitPrice: productToEdit.unitPrice?.toString() || "",
				costPrice: productToEdit.costPrice?.toString() || "",
				quantity: productToEdit.quantity?.toString() || "",
				reorderLevel: productToEdit.reorderLevel?.toString() || "",
				description: productToEdit.description || "",
				isActive: productToEdit.isActive !== false,
			});
			setOriginalQuantity(productToEdit.quantity || 0);
		}
	}, [productToEdit]);

	const updateProductApi = async (productData) => {
		setEditProductLoading(true);
		setEditProductError(null);
		try {
			// Use admin update method which handles quantity changes and ADJUSTMENT transactions
			const result = await productService.updateProduct(productToEdit.id, productData);
			return result;
		} catch (err) {
			setEditProductError(err.response?.data?.message || err.message);
			throw err;
		} finally {
			setEditProductLoading(false);
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
		setEditProduct((prev) => ({ ...prev, [id]: value }));
	};

	const handleSwitchChange = (checked) => {
		setEditProduct((prev) => ({
			...prev,
			isActive: checked,
			quantity: checked ? (prev.quantity === '0' ? originalQuantity.toString() : prev.quantity) : '0' // Restore original quantity when reactivating
		}));
	};

	const handleEditProduct = async (e) => {
		e.preventDefault();

		if (!user || !user.id) {
			toastUtils.patterns.auth.userNotAvailable(toast);
			return;
		}

		// Validation
		if (isNaN(parseInt(editProduct.reorderLevel))) {
			toastUtils.patterns.validation.integerRequired(toast, "Reorder Level");
			return;
		}

		if (isNaN(parseInt(editProduct.quantity))) {
			toastUtils.patterns.validation.integerRequired(toast, "Quantity");
			return;
		}

		if (isNaN(parseFloat(editProduct.unitPrice))) {
			toastUtils.patterns.validation.numberRequired(toast, "Unit Price");
			return;
		}

		if (isNaN(parseFloat(editProduct.costPrice))) {
			toastUtils.patterns.validation.numberRequired(toast, "Cost Price");
			return;
		}

		if (parseFloat(editProduct.costPrice) >= parseFloat(editProduct.unitPrice)) {
			toastUtils.patterns.validation.costPriceTooHigh(toast);
			return;
		}

		try {
			// Update the product (backend will handle ADJUSTMENT transaction automatically if quantity changed)
			const updated = await updateProductApi(editProduct);

			toastUtils.patterns.crud.updateSuccess(toast, "Product");
			onProductEdited(updated);
			onOpenChange(false);
		} catch (error) {
			toastUtils.patterns.crud.product.updateFailed(toast, editProductError || "Failed to update product");
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
		isActive,
	} = editProduct;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Product</DialogTitle>
					<DialogDescription>
						Update the product details. {isAdmin ? "As an admin, you can edit all fields including quantity and status." : ""}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleEditProduct} className="space-y-4">
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
							<div className="relative">
								<SearchableSelect
									fetchOptions={fetchCategories}
									onSelect={(category) =>
										setEditProduct((prev) => ({
											...prev,
											categoryId: category ? category.id : "",
										}))
									}
									placeholder="Select a category"
									value={categoryId}
									clearable={true}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="unitPrice">Unit Price</Label>
							<Input
								id="unitPrice"
								type="number"
								step="0.01"
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
								step="0.01"
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
							{originalQuantity !== parseInt(quantity || 0) && (
								<p className="text-xs text-amber-600">
									Quantity change will be logged as an ADJUSTMENT transaction
								</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
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
						{isAdmin && (
							<div className="space-y-2">
								<Label htmlFor="isActive">Active Status</Label>
								<div className="flex items-center space-x-2">
									<Switch
										id="isActive"
										checked={isActive}
										onCheckedChange={handleSwitchChange}
									/>
									<Label htmlFor="isActive" className="text-sm">
										{isActive ? "Active" : "Inactive"}
									</Label>
								</div>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button type="submit" disabled={editProductLoading}>
							{editProductLoading ? "Updating..." : "Update Product"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditProductModal;