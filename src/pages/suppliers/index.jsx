import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Truck } from "lucide-react";
import { Button } from "../../components/ui/button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchContainer from "../../components/ui/SearchContainer.jsx";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { supplierService } from "../../api";
import ExportButton from "../../components/ui/ExportButton.jsx";
import { useIsMobile } from "../../hooks/useMobile.jsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "../../components/ui/card.jsx";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../../components/ui/collapsible.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import AddSupplierModal from "./AddSupplierModal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, DEFAULT_SORT_DIRECTION } from "../../constants/pagination.js";

const Suppliers = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
	const [suppliers, setSuppliers] = useState([]);
	const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [sortBy, setSortBy] = useState(null);
	const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);
	const [isLoading, setIsLoading] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [supplierToEdit, setSupplierToEdit] = useState(null);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [supplierToDelete, setSupplierToDelete] = useState(null);

	const { toast } = useToast();
	const { user, isAdmin } = useAuth();
	const isMobile = useIsMobile();

	// Effect to handle URL search parameter changes
	useEffect(() => {
		const urlSearchTerm = searchParams.get('search');
		if (urlSearchTerm) {
			setSearchQuery(urlSearchTerm);
			setPageNumber(0); // Reset to first page when search changes
			
			// Clear the URL parameter after processing to avoid conflicts
			const newSearchParams = new URLSearchParams(searchParams);
			newSearchParams.delete('search');
			setSearchParams(newSearchParams, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	// Handle search with the SearchContainer component
	const handleSearch = useCallback((value) => {
		setSearchQuery(value);
		if (value.trim() !== "") {
			setPageNumber(0); // Reset to first page only if search query is non-empty
		}
	}, []);

	// Fetch suppliers when dependencies change
	useEffect(() => {
		fetchSuppliers();
	}, [pageNumber, pageSize, searchQuery, sortBy, sortDirection]);

	const fetchSuppliers = async () => {
		setIsLoading(true);
		try {
			let data;
			if (searchQuery.trim() !== "") {
				const response = await supplierService.searchSupplierByName(
					searchQuery
				);
				data = {
					content: response || [],
					totalPages: 1,
					totalElements: response?.length || 0,
				};
			} else {
				const response = await supplierService.getSuppliers(
					pageNumber,
					pageSize,
					sortBy,
					sortDirection
				);
				data = response;
			}
			setSuppliers(data.content || []);
			setTotalPages(data.totalPages || 1);
			setTotalElements(data.totalElements || data.content?.length || 0);
		} catch (error) {
			console.error("Error fetching suppliers:", error);
			
			// Extract the error message from the response if available
			let errorMessage = "Failed to fetch suppliers";
			
			if (error.response && error.response.data) {
				errorMessage = error.response.data.message || errorMessage;
			}
			
			toastUtils.patterns.crud.supplier.loadFailed(toast, errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePageChange = (newPage) => {
		setPageNumber(newPage);
	};

	const handlePageSizeChange = (newPageSize) => {
		setPageSize(newPageSize);
		setPageNumber(0); // Reset to first page when page size changes
	};

	const handleSort = (newSortBy, newDirection) => {
		let newSortDirection = newDirection;
		if (!newDirection) {
			newSortDirection = "asc";
			if (sortBy === newSortBy) {
				newSortDirection = sortDirection === "asc" ? "desc" : "asc";
			}
		}
		setSortBy(newSortBy);
		setSortDirection(newSortDirection);
		setPageNumber(0); // Reset to first page on new sort
	};

	// Format suppliers data for Excel export
	const formatSuppliersForExport = (suppliersData) => {
		return suppliersData.map((supplier) => ({
			"Supplier Name": supplier.name || "",
			"Contact Person": supplier.contactPerson || "",
			Email: supplier.email || "",
			Phone: supplier.phone || "",
			Address: supplier.address || "",
		}));
	};

	// Column widths for Excel export
	const supplierExportColumnWidths = [
		{ wch: 20 }, // Supplier Name
		{ wch: 20 }, // Contact Person
		{ wch: 25 }, // Email
		{ wch: 15 }, // Phone
		{ wch: 30 }, // Address
	];

	const handleEditSupplier = (supplier) => {
		setSupplierToEdit(supplier);
		setIsAddModalOpen(true);
	};

	const handleDeleteSupplier = (supplier) => {
		setSupplierToDelete(supplier);
		setIsConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!supplierToDelete) return;
		try {
			await supplierService.deleteSupplier(supplierToDelete.id);
			toastUtils.patterns.crud.deleteSuccess(toast, "Supplier");
			fetchSuppliers();
		} catch (error) {
			// Extract the error message from the response if available
			let errorMessage = "Unable to delete supplier.";
			
			if (error.response && error.response.data) {
				// Use the message from the API response if available
				errorMessage = error.response.data.message || errorMessage;
			}
			
			toastUtils.patterns.crud.supplier.deleteFailed(toast, errorMessage);
		} finally {
			setIsConfirmDialogOpen(false);
			setSupplierToDelete(null);
		}
	};

	// Define columns for the suppliers table
	const columns = [
		{
			header: "Supplier Name",
			accessor: "name",
			sortable: true,
			sortBy: "name",
		},
		{
			header: "Contact Person",
			accessor: "contactPerson",
			sortable: true,
			sortBy: "contactPerson",
		},
		{
			header: "Email",
			accessor: "email",
			sortable: true,
			sortBy: "email",
		},
		{
			header: "Phone",
			accessor: "phone",
			sortable: true,
			sortBy: "phone",
		},
		{
			header: "Address",
			accessor: "address",
		},
		// Conditionally include the Actions column based on user role
		...(isAdmin
			? [
					{
						header: "",
						accessor: (supplier) => (
							<div className="flex items-center space-x-1 justify-center">
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => handleEditSupplier(supplier)}
									className="border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
								>
									Edit
								</Button>
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => handleDeleteSupplier(supplier)}
									className="border-red-500 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
								>
									Delete
								</Button>
							</div>
						),
					},
			  ]
			: []),
	];

	return (
		<div 
			className="flex flex-col h-[100%]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
		>
			{/* Header */}
			<div 
				className="sticky top-0 z-10 flex items-center justify-between mb-4 h-min"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<PageHeader
					title="Suppliers"
					description="Manage your suppliers"
					icon={<Truck />}
					iconBgColor="bg-orange-100"
					iconColor="text-orange-600"
				/>
				<div className="action-buttons-container">
					<div className="action-button-search">
						<SearchContainer
							placeholder="Search suppliers..."
							onSearch={handleSearch}
							initialValue={searchQuery}
							delay={500}
							useThrottling={true}
						/>
					</div>
					<ExportButton
						data={suppliers}
						formatData={formatSuppliersForExport}
						columnWidths={supplierExportColumnWidths}
						sheetName="Suppliers"
						fileName="Suppliers"
						variant="outline"
						size="sm"
						className="action-button-export"
					/>
					<div className="action-button-add">
						<AddSupplierModal
							isOpen={isAddModalOpen}
							onOpenChange={setIsAddModalOpen}
							supplierToEdit={supplierToEdit}
							onSupplierAdded={fetchSuppliers}
						/>
					</div>
				</div>
			</div>

			{/* Table or Cards based on screen size */}
			{isMobile ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{isLoading ? (
						<p>Loading suppliers...</p>
					) : (
						suppliers.map((supplier) => (
							<Card key={supplier.id} className="w-full">
								<CardHeader>
									<CardTitle>{supplier.name}</CardTitle>
									<CardDescription>
										Contact: {supplier.contactPerson || "N/A"}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p>Email: {supplier.email || "N/A"}</p>
									<p>Phone: {supplier.phone || "N/A"}</p>
									<Collapsible>
										<CollapsibleTrigger asChild>
											<Button
												variant="link"
												className="w-full text-left p-0 justify-start h-auto mt-2"
											>
												See More
											</Button>
										</CollapsibleTrigger>
										<CollapsibleContent className="space-y-2 mt-2">
											<p>Address: {supplier.address || "N/A"}</p>
										</CollapsibleContent>
									</Collapsible>
								</CardContent>
								{isAdmin && (
									<CardFooter className="flex justify-end gap-2">
										<Button onClick={() => handleEditSupplier(supplier)}>
											Edit
										</Button>
										<Button
											variant="destructive"
											onClick={() => handleDeleteSupplier(supplier)}
										>
											Delete
										</Button>
									</CardFooter>
								)}
							</Card>
						))
					)}
				</div>
			) : (
				<div className="relative flex-grow min-h-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.10)]">
					<DataTable
						columns={columns}
						data={suppliers}
						keyField="id"
						onSort={handleSort}
						sortBy={sortBy}
						sortDirection={sortDirection}
						loading={isLoading}
						styles={{ tableMaxHeight: "max-h-[calc(100vh-64px-56px-52px)]" }}
					/>
				</div>
			)}

			{/* Pagination */}
			<Pagination
				pageNumber={pageNumber}
				pageSize={pageSize}
				totalPages={totalPages}
				totalElements={totalElements}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				title={`Are you sure you want to delete ${supplierToDelete?.name}?`}
				description="This action cannot be undone. The supplier will be permanently deleted."
				onConfirm={handleConfirmDelete}
				onCancel={() => {
					setIsConfirmDialogOpen(false);
					setSupplierToDelete(null);
				}}
				confirmText="Delete"
				isConfirming={false}
			/>
		</div>
	);
};

export default Suppliers;
