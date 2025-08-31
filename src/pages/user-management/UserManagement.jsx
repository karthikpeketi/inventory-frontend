import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getUserState, USER_STATUS } from "../../constants/userStatus";
import { userManagementService } from "../../api";
import { Button } from "../../components/ui/button";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import { UserPlus, Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import SearchContainer from "../../components/ui/SearchContainer";
import Pagination from "../../components/ui/Pagination";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import UserTable from "./UserTable";
import {
	CreateUserDialog,
	DeactivateUserDialog,
	ReactivateUserDialog,
} from "./UserDialogs";
import UserApprovalDialog from "./UserApprovalDialog";

const UserManagement = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
	const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
	const [pageNumber, setPageNumber] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [sortBy, setSortBy] = useState("firstName");
	const [sortDirection, setSortDirection] = useState("asc");
	const [showInactiveUsers, setShowInactiveUsers] = useState(false);
	const [showPendingApproval, setShowPendingApproval] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		role: "STAFF",
		isActive: false, // Set to false for admin-created users
		statusReason: USER_STATUS.PENDING_ACTIVATION // For admin-created users
	});
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [operationLoading, setOperationLoading] = useState(false);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const { toast } = useToast();

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

	// Fetch users with pagination, sorting, and filtering
	const fetchUsers = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			// Determine active status filter based on UI toggles
			let activeStatus = showInactiveUsers ? null : true;
			let pendingApproval = showPendingApproval;

				// If showing pending approval users, we need to show inactive users as well
				if (pendingApproval) {
					activeStatus = false;
				}
			
			const data = await userManagementService.getUsers(
				pageNumber,
				pageSize,
				sortBy,
				sortDirection,
				searchQuery,
				"firstName,lastName,email",
				activeStatus,
				pendingApproval
			);

			// If the API returns paginated data
			if (data.content) {
				setUsers(data.content);
				setTotalPages(data.totalPages);
				setTotalElements(data.totalElements);
			} else {
				// Fallback for backward compatibility
				let filteredData = data;

				// Filter by active status if not showing inactive users
				if (!showInactiveUsers) {
					filteredData = data.filter((user) => user.isActive !== false);
				}

				// Filter users based on search term
				const filteredUsers = filteredData.filter((user) => {
					const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
					return (
						fullName.includes(searchQuery.toLowerCase()) ||
						user.email.toLowerCase().includes(searchQuery.toLowerCase())
					);
				});

				setUsers(filteredUsers);

				// Calculate pagination values
				setTotalElements(filteredUsers.length);
				setTotalPages(Math.ceil(filteredUsers.length / pageSize));
			}
		} catch (err) {
			setError(err.message || "Failed to load users");
			toastUtils.patterns.crud.user.loadFailed(toast, err.message || "Unknown error");
		} finally {
			setIsLoading(false);
		}
	}, [
		pageNumber,
		pageSize,
		sortBy,
		sortDirection,
		searchQuery,
		showInactiveUsers,
		showPendingApproval,
		toast,
	]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	// Handle search with the SearchContainer component
	const handleSearch = useCallback((value) => {
		setSearchQuery(value);
		setPageNumber(0); // Reset to first page on search change
	}, []);

	// Handle sorting
	const handleSort = (newSortBy, newDirection) => {
		// If newDirection is provided, use it; otherwise, toggle the direction
		let newSortDirection = newDirection;
		if (!newDirection) {
			newSortDirection = "asc";
			if (sortBy === newSortBy) {
				newSortDirection = sortDirection === "asc" ? "desc" : "asc";
			}
		}

		// Find the column with the matching sortKey or accessor to get the correct backend field name
		const column = UserTable({
			users: [],
			sortBy,
			sortDirection,
			isLoading: false,
			onSort: () => {},
			onDelete: () => {},
		}).props.columns.find(
			(col) =>
				col.sortKey === newSortBy ||
				col.accessor === newSortBy ||
				(typeof col.accessor === "string" && col.accessor === newSortBy)
		);

		// Use the column's sortKey if available, otherwise use the newSortBy value
		const backendSortField = column?.sortKey || newSortBy;

		setSortBy(backendSortField);
		setSortDirection(newSortDirection);
		setPageNumber(0); // Reset to first page on new sort
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPageNumber(newPage);
	};

	// Handle page size change
	const handlePageSizeChange = (newPageSize) => {
		setPageSize(parseInt(newPageSize));
		setPageNumber(0); // Reset to first page when page size changes
	};

	// Create user function
	const createUser = async (userData) => {
		setOperationLoading(true);
		try {
			// Generate a username from email if not provided
			if (!userData.username) {
				userData.username = userData.email;
			}
			
			await userManagementService.createUser(userData);
			// Refresh the user list instead of manually updating state
			fetchUsers();
			setIsCreateDialogOpen(false);
			resetForm();
			toastUtils.success(toast, "User invitation sent", "An activation email has been sent to the user with instructions to set their password.");
		} catch (error) {
			toastUtils.patterns.crud.user.actionFailed(toast, error.message || "Something went wrong");
		} finally {
			setOperationLoading(false);
		}
	};

	// Update user function - kept for reference but not used in this component
	// This function might be used by other components, so we're keeping it in the userManagementService
	// but removing it from this component

	// Deactivate user function (instead of deleting)
	const deactivateUser = async (id) => {
		setOperationLoading(true);
		try {
			await userManagementService.deactivateUser(id);
			// Refresh the user list
			fetchUsers();
			setIsDeleteDialogOpen(false);
			setSelectedUser(null);
			toastUtils.success(toast, "User deactivated", "The user has been deactivated successfully.");
		} catch (error) {
			toastUtils.patterns.crud.user.actionFailed(toast, error.message || "Something went wrong");
		} finally {
			setOperationLoading(false);
		}
	};

	// Handle input changes
	const handleChange = (key, value) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	// Reset form
	const resetForm = () => {
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			role: "STAFF",
			isActive: false, // Set to false for admin-created users
			statusReason: USER_STATUS.PENDING_ACTIVATION // For admin-created users
		});
	};

	// Handle reactivation request
	const handleReactivationRequest = (user) => {
		setSelectedUser(user);
		setIsReactivateDialogOpen(true);
	};

	// Handle reactivation confirmation
	const handleReactivateConfirm = async () => {
		try {
			setOperationLoading(true);
			await userManagementService.reactivateUser(selectedUser.id);

			// Refresh the user list
			await fetchUsers();
			setIsReactivateDialogOpen(false);
			setSelectedUser(null);

			toastUtils.success(toast, "User reactivated", "The user has been reactivated successfully.");
		} catch (error) {
			toastUtils.patterns.crud.user.actionFailed(toast, error.message || "Something went wrong");
			setIsReactivateDialogOpen(false);
		} finally {
			setOperationLoading(false);
		}
	};

	// Handle approval request
	const handleApproveRequest = (user) => {
		setSelectedUser(user);
		setIsApprovalDialogOpen(true);
	};

	// Handle approval confirmation
	const handleApproveConfirm = async () => {
		try {
			setOperationLoading(true);
			await userManagementService.approveUser(selectedUser.id);

			// Refresh the user list
			await fetchUsers();
			setIsApprovalDialogOpen(false);
			setSelectedUser(null);

			toastUtils.success(toast, "User approved", "The user has been approved successfully.");
		} catch (error) {
			toastUtils.patterns.crud.user.actionFailed(toast, error.message || "Something went wrong");
			setIsApprovalDialogOpen(false);
		} finally {
			setOperationLoading(false);
		}
	};

	// Handle approval rejection
	const handleApproveReject = async () => {
		try {
			setOperationLoading(true);
			await userManagementService.rejectUser(selectedUser.id);

			// Refresh the user list
			await fetchUsers();
			setIsApprovalDialogOpen(false);
			setSelectedUser(null);

			toastUtils.success(toast, "User rejected", "The user registration has been rejected.");
		} catch (error) {
			toastUtils.patterns.crud.user.actionFailed(toast, error.message || "Something went wrong");
			setIsApprovalDialogOpen(false);
		} finally {
			setOperationLoading(false);
		}
	};
	
	// Handle sending activation email
	const handleSendActivation = async (user) => {
		try {
			setOperationLoading(true);
			await userManagementService.sendActivationEmail(user.id);
			
			toastUtils.success(toast, "Activation email sent", "An activation email has been sent to the user.");
		} catch (error) {
			toastUtils.patterns.crud.user.actionFailed(toast, error.message || "Something went wrong");
		} finally {
			setOperationLoading(false);
		}
	};

	// Handle delete (deactivate) or reject user
	const handleDelete = (user) => {
		// Handle rejection for pending approval users
		const userState = getUserState(user);
		if (userState === "PENDING_APPROVAL") {
			setSelectedUser(user);
			handleApproveReject();
			return;
		}

		// Additional safeguard to prevent deletion of admin users
		if (user.role === "ADMIN") {
			toastUtils.patterns.crud.user.cannotDeleteAdmin(toast);
			return;
		}

		// Don't allow deactivation of already inactive users
		if (!user.isActive) {
			toastUtils.patterns.crud.user.alreadyInactive(toast);
			return;
		}

		setSelectedUser(user);
		setIsDeleteDialogOpen(true);
	};

	// Handle create form submission
	const handleCreateSubmit = (e) => {
		e.preventDefault();
		createUser(formData);
	};

	// Edit functionality has been removed

	// Handle delete confirmation (deactivate)
	const handleDeleteConfirm = () => {
		deactivateUser(selectedUser.id);
	};

	// Handle toggle for showing inactive users
	const handleToggleInactiveUsers = (checked) => {
		setShowInactiveUsers(checked);
		setPageNumber(0); // Reset to first page when toggling
	};
	
	// Handle toggle for showing pending approval users
	const handleTogglePendingApproval = (checked) => {
		setShowPendingApproval(checked);
		setPageNumber(0); // Reset to first page when toggling
	};

	if (error && !users.length) {
		return (
			<div className="text-center text-red-500">
				Failed to load users: {error || "Unknown error"}
			</div>
		);
	}

	return (
		<div 
			className="flex flex-col h-[100%] space-y-4"
		>
			{/* Header */}
			<div 
				className="sticky top-0 z-10 flex items-center justify-between h-min"
			>
				<PageHeader
					title="User Management"
					description="Manage system users and permissions"
					icon={<Users />}
					iconBgColor="bg-blue-100"
					iconColor="text-blue-600"
				/>

				{/* Action Buttons */}
				<div className="action-buttons-container">
					<div className="action-button-search">
						<SearchContainer
							placeholder="Search by name or email..."
							onSearch={handleSearch}
							initialValue={searchQuery}
							delay={300}
						/>
					</div>

					{/* Toggle for showing inactive users */}
					<div className="flex items-center space-x-2 action-button h-12">
						<Switch
							id="show-inactive"
							checked={showInactiveUsers}
							onCheckedChange={handleToggleInactiveUsers}
						/>
						<Label htmlFor="show-inactive" className="cursor-pointer whitespace-nowrap">
							Show inactive users
						</Label>
					</div>

					{/* Add User Button */}
					<Button
						className="action-button-add bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md"
						onClick={() => setIsCreateDialogOpen(true)}
					>
						<UserPlus className="mr-2 h-4 w-4" />
						Add User
					</Button>
				</div>
			</div>

			{/* Users Table and Pagination Container */}
			<div className="flex flex-col flex-grow min-h-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.10)]">
				{/* Users Table */}
				<div className="relative flex-grow overflow-hidden">
						<UserTable
						users={users}
						sortBy={sortBy}
						sortDirection={sortDirection}
						isLoading={isLoading}
						onSort={handleSort}
						onDelete={handleDelete}
						onApprove={handleApproveRequest}
						onReactivate={handleReactivationRequest}
						onSendActivation={handleSendActivation}
					/>
				</div>

				{/* Pagination */}
				<Pagination
					pageNumber={pageNumber}
					pageSize={pageSize}
					totalPages={totalPages}
					totalElements={totalElements}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>

			{/* Dialogs */}
			<CreateUserDialog
				isOpen={isCreateDialogOpen}
				setIsOpen={setIsCreateDialogOpen}
				formData={formData}
				handleChange={handleChange}
				handleSubmit={handleCreateSubmit}
				operationLoading={operationLoading}
			/>

			<DeactivateUserDialog
				isOpen={isDeleteDialogOpen}
				setIsOpen={setIsDeleteDialogOpen}
				selectedUser={selectedUser}
				handleConfirm={handleDeleteConfirm}
				operationLoading={operationLoading}
			/>

			<ReactivateUserDialog
				isOpen={isReactivateDialogOpen}
				setIsOpen={setIsReactivateDialogOpen}
				selectedUser={selectedUser}
				handleConfirm={handleReactivateConfirm}
				operationLoading={operationLoading}
			/>
			<UserApprovalDialog
				isOpen={isApprovalDialogOpen}
				setIsOpen={setIsApprovalDialogOpen}
				selectedUser={selectedUser}
				handleConfirm={handleApproveConfirm}
				handleReject={handleApproveReject}
				operationLoading={operationLoading}
			/>
		</div>
	);
};

export default UserManagement;
