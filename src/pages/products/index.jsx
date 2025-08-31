import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Plus, Box } from "lucide-react";
import { Button } from "../../components/ui/button";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SearchContainer from "../../components/ui/SearchContainer.jsx";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import SearchableSelect from "../../components/ui/SearchableSelect.jsx";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../api";
import { categoryService } from "../../api";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx"; // Import ConfirmDialog
import ExportButton from "../../components/ui/ExportButton.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { 
	PRODUCT_STATUS, 
} from "../../constants/product";

import AddNewProductPopup from "./AddNewProductPopup.jsx"; // Import the new component
import SellStockModal from "./SellStockModal.jsx";
import EditProductModal from "./EditProductModal.jsx";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DEFAULT_SORT_DIRECTION } from "../../constants/pagination.js";

const ProductsPage = () => {
	const { toast } = useToast();
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stockOutLoading, setStockOutLoading] = useState(false); // Add this line
	const [isAddProductOpen, setIsAddProductOpen] = useState(false);
	const [isSellModalOpen, setIsSellModalOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [sellQuantity, setSellQuantity] = useState(1);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [productToAdjust, setProductToAdjust] = useState(null);
	const [isEditProductOpen, setIsEditProductOpen] = useState(false);
	const [productToEdit, setProductToEdit] = useState(null);

	// Pagination and sorting state
	const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [sortBy, setSortBy] = useState('name');
	const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);

	// Search and filter state - initialize from URL params
	const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
	const [selectedCategory, setSelectedCategory] = useState(null);

	// Effect to handle URL search parameter changes
	useEffect(() => {
		const urlSearchTerm = searchParams.get('search');
		if (urlSearchTerm && urlSearchTerm !== searchTerm) {
			setSearchTerm(urlSearchTerm);
			setPageNumber(0); // Reset to first page when search changes
			
			// Clear the URL parameter after processing to avoid conflicts
			const newSearchParams = new URLSearchParams(searchParams);
			newSearchParams.delete('search');
			setSearchParams(newSearchParams, { replace: true });
		}
	}, [location.search, searchParams, setSearchParams, searchTerm]);


	// Fetch products with pagination, sorting, and filtering
	const fetchProducts = useCallback(async () => {
		try {
			setLoading(true);
			const response = await productService.getProducts(
				pageNumber, // 0-based
				pageSize,
				sortBy,
				sortDirection,
				searchTerm,
				selectedCategory || 'All'
			);
			setProducts(response.content || []);
			setTotalPages(response.totalPages || 0);
			setTotalElements(response.totalElements || 0);
		} catch (error) {
			console.error('Error fetching products:', error);
			toastUtils.patterns.crud.product.loadFailed(toast);
		} finally {
			setLoading(false);
		}
	}, [pageNumber, pageSize, sortBy, sortDirection, searchTerm, selectedCategory]);

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

	// Define table columns
	const columns = [
		{
			header: 'Name',
			accessor: 'name',
			sortable: true,
			sortKey: 'name',
		},
		{
			header: 'SKU',
			accessor: 'sku',
			sortable: true,
			sortKey: 'sku',
		},
		{
			header: 'Category',
			accessor: 'categoryName',
			sortable: true,
			sortKey: 'category.name',
		},
		{
			header: 'Price',
			accessor: (product) => `$${product.unitPrice?.toFixed(2) || '0.00'}`,
			sortable: true,
			sortKey: 'unitPrice',
		},
		{
			header: 'Quantity',
			accessor: (product) => product.quantity || 0,
			sortable: true,
			sortKey: 'quantity',
		},
		{
			header: 'Min Stock',
			accessor: (product) => product.reorderLevel || 0,
			sortable: true,
			sortKey: 'reorderLevel',
		},
		{
			header: 'Status',
			accessor: (product) => {
				const quantity = product.quantity || 0;
				const minStock = product.reorderLevel || 0;
				let status = 'In Stock';
				
				if (quantity === 0) {
					status = 'Out of Stock';
				} else if (quantity <= minStock) {
					status = 'Low Stock';
				}
				
				const statusVariant = {
					'In Stock': 'success',
					'Low Stock': 'warning',
					'Out of Stock': 'destructive'
				};
				
				return (
					<StatusBadge
						key={`status-${product.id}`}
						status={statusVariant[status] || 'default'}
						text={status}
					/>
				);
			}
		},
		{
			header: '',
			accessor: (product) => {
				// For STAFF Users: Show only Sell button
				if (user?.role !== 'ADMIN') {
					return (
						<Button 
							key={`sell-${product.id}`}
							variant="outline" 
							size="sm"
							onClick={() => handleSellProduct(product)}
							disabled={product.quantity <= 0}
							className="border-blue-500 text-blue-600 hover:bg-blue-50 py-1"
						>
							Sell
						</Button>
					);
				}
				
				// For ADMIN Users: Show Sell, Edit, and Delete buttons
				return (
					<div key={`actions-${product.id}`} className="flex items-center space-x-1 justify-center">
						<Button 
							key={`sell-${product.id}`}
							variant="outline" 
							size="sm"
							onClick={() => handleSellProduct(product)}
							disabled={product.quantity <= 0}
							className="border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
						>
							Sell
						</Button>
						<Button 
							key={`edit-${product.id}`}
							variant="outline" 
							size="sm"
							onClick={() => handleEditClick(product)}
							className="border-green-500 text-green-600 hover:bg-green-50 px-2 py-1 text-xs"
						>
							Edit
						</Button>
						<Button 
							key={`delete-${product.id}`}
							variant="outline" 
							size="sm"
							onClick={() => handleDeleteProduct(product)}
							className="border-red-500 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
						>
							Delete
						</Button>
					</div>
				);
			}
		},
	];

	// On mount: Fetch products with current pagination/sorting/filtering
	useEffect(() => {
		fetchProducts();
	}, [pageNumber, pageSize, sortBy, sortDirection, searchTerm, selectedCategory, fetchProducts]);

	// Handle sort change
	const handleSort = (newSortBy, newDirection) => {
		let newSortDirection = newDirection;
		if (!newDirection) {
			newSortDirection = 'asc';
			if (sortBy === newSortBy) {
				newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			}
		}
		
		setSortBy(newSortBy);
		setSortDirection(newSortDirection);
		setPageNumber(0); // Reset to first page (0-based) when sorting changes
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPageNumber(newPage); // 0-based
	};

	// Handle page size change
	const handlePageSizeChange = (size) => {
		setPageSize(size);
		setPageNumber(0); // Reset to first page (0-based)
	};

	// Handle search
	const handleSearch = useCallback((value) => {
		setSearchTerm(value);
		if (value.trim() !== '') {
			setPageNumber(0); // Reset to first page (0-based) only if search query is non-empty
		}
	}, []);

	// Handle sell product
	const handleSellProduct = (product) => {
		setSelectedProduct(product);
		setSellQuantity(1);
		setIsSellModalOpen(true);
	};

	// Handle quantity change for sell modal
	const handleQuantityChange = (e) => {
		const value = e.target.value;
		// Allow empty string to show empty input
		if (value === '') {
			setSellQuantity('');
			return;
		}
		
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue)) {
			setSellQuantity(Math.max(1, Math.min(numValue, selectedProduct?.quantity || 1)));
		}
	};

	// Handle increment quantity
	const incrementQuantity = () => {
		const currentQuantity = sellQuantity === '' ? 0 : parseInt(sellQuantity, 10) || 0;
		const maxQuantity = selectedProduct?.quantity || 1;
		if (currentQuantity < maxQuantity) {
			setSellQuantity(currentQuantity + 1);
		}
	};

	// Handle decrement quantity
	const decrementQuantity = () => {
		const currentQuantity = sellQuantity === '' ? 0 : parseInt(sellQuantity, 10) || 0;
		if (currentQuantity > 1) {
			setSellQuantity(currentQuantity - 1);
		} else if (currentQuantity === 0) {
			setSellQuantity(1);
		}
	};

	// Handle confirm sell
	const handleConfirmSell = async () => {
		if (!selectedProduct) return;
		
		const quantity = sellQuantity === '' ? 0 : parseInt(sellQuantity, 10);
		if(isNaN(quantity) || quantity <= 0) {
			toastUtils.patterns.validation.quantityInvalid(toast);
			return;
		}

		try {
			setStockOutLoading(true);
			
			// Use the new sellProduct endpoint which works for both ADMIN and STAFF
			await productService.sellProduct(selectedProduct.id, quantity, `Sold ${quantity} units`);
			
			// Fetch the updated product data
			const updatedProduct = await productService.getProductById(selectedProduct.id);
			
			// Update the products list with the updated product
			setProducts(prevProducts => 
				prevProducts.map(p => 
					p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p
				)
			);
			
			toastUtils.patterns.crud.product.sold(toast, quantity, selectedProduct.name);
			
			setIsSellModalOpen(false);
			setSelectedProduct(null);
			setSellQuantity(1);
		} catch (error) {
			console.error('Error selling product:', error);
			toast({
				title: "Error",
				description: error.message || "Failed to sell product",
				variant: "destructive",
			});
		} finally {
			setStockOutLoading(false);
		}
	};

	// Handle clear sell
	const handleClearSell = () => {
		setIsSellModalOpen(false);
		setSelectedProduct(null);
		setSellQuantity(1);
	};

	const handleEditClick = async (product) => {
		try {
			const productData = await productService.getProductById(product.id);
			setProductToEdit(productData);
			setIsEditProductOpen(true);
		} catch (error) {
			console.error('Error fetching product for edit:', error);
			toast({
				title: "Error",
				description: "Failed to fetch product details.",
				variant: "destructive",
			});
		}
	};

	// Handle edit product
	const handleEditProduct = async (updatedProduct) => {
		try {
			// Fetch the latest product data to ensure we have the most up-to-date information
			const latestProduct = await productService.getProductById(updatedProduct.id);
			
			// Update the products list with the updated product
			setProducts(prevProducts => 
				prevProducts.map(p => 
					p.id === updatedProduct.id ? { ...p, ...latestProduct } : p
				)
			);
			
			toast({
				title: "Success",
				description: "Product updated successfully",
			});
		} catch (error) {
			console.error('Error fetching updated product:', error);
			// Fallback to refreshing the entire list if there's an error
			fetchProducts();
		} finally {
			setIsEditProductOpen(false);
			setProductToEdit(null);
		}
	};

	// Handle delete product (mark as inactive)
	const handleDeleteProduct = (product) => {
		setProductToAdjust(product);
		setIsConfirmDialogOpen(true);
	};

	// Function to confirm stock adjustment (delete)
	const confirmStockAdjustment = async () => {
		if (!productToAdjust) return;

		try {
			await productService.deleteProduct(productToAdjust.id);
			toast({
				title: "Success",
				description: "Product marked as inactive successfully",
			});
			fetchProducts(); // Refresh the product list
		} catch (error) {
			console.error('Error deleting product:', error);
			toast({
				title: "Error",
				description: "Failed to mark product as inactive",
				variant: "destructive",
			});
		} finally {
			setIsConfirmDialogOpen(false);
			setProductToAdjust(null);
		}
	};

	// Handle product added from AddNewProductPopup
	const handleProductAdded = () => {
		fetchProducts(); // Refresh the product list
		setIsAddProductOpen(false);
	};

	// Format products data for Excel export
	const formatProductsForExport = (productsData) => {
		return productsData.map(product => {
			// Calculate the proper status based on the same logic as the table
			let status;
			if (!product.isActive) {
				status = PRODUCT_STATUS.INACTIVE;
			} else if (product.quantity === 0) {
				status = PRODUCT_STATUS.OUT_OF_STOCK;
			} else if (product.quantity <= product.reorderLevel) {
				status = PRODUCT_STATUS.LOW_STOCK;
			} else {
				status = PRODUCT_STATUS.ACTIVE;
			}
			
			return {
				"Product Name": product.name,
				"SKU": product.sku,
				"Category": product.categoryName,
				"Price": typeof product.unitPrice === 'number' ? `$${product.unitPrice.toFixed(2)}` : '$0.00',
				"Stock": product.quantity,
				"Status": status,
			};
		});
	};

	// Column widths for Excel export
	const productExportColumnWidths = [
		{ wch: 25 }, // Product Name
		{ wch: 15 }, // SKU
		{ wch: 20 }, // Category
		{ wch: 12 }, // Price
		{ wch: 10 }, // Stock
		{ wch: 12 }, // Status
	];

	return (
		<div 
			className="flex flex-col h-[100%]"
		>
			{/* Header */}
			<div 
				className="sticky top-0 z-10 flex items-center justify-between mb-4 h-min"
			>
				<PageHeader
					title="Products"
					description="Manage your inventory"
					icon={<Box />}
					iconBgColor="bg-blue-100"
					iconColor="text-blue-600"
				/>
				<div className="action-buttons-container">
					<div className="action-button-search">
						<SearchContainer
							placeholder="Search products..."
							onSearch={handleSearch}
							initialValue={searchTerm}
							delay={500}
							useThrottling={true}
						/>
					</div>
					<div className="w-48">
						<SearchableSelect
							fetchOptions={fetchCategories}
							onSelect={(category) => {
								setSelectedCategory(category ? category.id : null);
								setPageNumber(0);
							}}
							placeholder="Filter by category"
							value={selectedCategory}
						/>
					</div>
					<ExportButton
						data={products}
						formatData={formatProductsForExport}
						columnWidths={productExportColumnWidths}
						sheetName="Products"
						fileName="Products"
						variant="outline"
						size="sm"
						className="action-button-export"
					/>
					{/* Add New Product Button */}
					<Button
						className="action-button-add"
						onClick={() => setIsAddProductOpen(true)} // Open the popup
					>
						<Plus className="mr-2 h-4 w-4" /> Add Product
					</Button>
				</div>
			</div>

			<div className="relative flex-grow min-h-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.10)]">
					<DataTable
						columns={columns}
						data={products}
						keyField="id"
						onSort={handleSort}
						sortBy={sortBy}
						sortDirection={sortDirection}
						loading={loading}
						styles={{tableMaxHeight: 'max-h-[calc(100vh-64px-56px-52px)]'}}
					/>
				</div>
			<Pagination
				pageNumber={pageNumber}
				pageSize={pageSize}
				totalPages={totalPages}
				totalElements={totalElements}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
			/>

			<AddNewProductPopup
				isOpen={isAddProductOpen}
				onOpenChange={setIsAddProductOpen}
				onProductAdded={handleProductAdded}
			/>

			<SellStockModal
				isSellModalOpen={isSellModalOpen}
				setIsSellModalOpen={setIsSellModalOpen}
				selectedProduct={selectedProduct}
				sellQuantity={sellQuantity}
				handleQuantityChange={handleQuantityChange}
				handleConfirmSell={handleConfirmSell}
				handleClearSell={handleClearSell}
				incrementQuantity={incrementQuantity}
				decrementQuantity={decrementQuantity}
				stockOutLoading={stockOutLoading}
				getProductLoading={false}
			/>

			<EditProductModal
				isOpen={isEditProductOpen}
				onOpenChange={setIsEditProductOpen}
				onProductEdited={handleEditProduct}
				productToEdit={productToEdit}
			/>

			<ConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				title={`Are you sure you want to mark "${productToAdjust?.name}" as inactive?`}
				description="This will hide it from the active product list."
				onConfirm={confirmStockAdjustment}
				onCancel={() => {
					setIsConfirmDialogOpen(false);
					setProductToAdjust(null);
				}}
				confirmText="Mark Inactive"
			/>
		</div>
	);
};

export default ProductsPage;
