import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronRight, Plus, Edit, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.jsx";
import { useToast, toastUtils } from '../../components/ui/use-toast';
import { orderService } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, isValidDate } from '../../lib/utils.js';
import SearchContainer from '../../components/ui/SearchContainer.jsx';
import AddOrderModel from './AddOrderModel.jsx';
import ExportButton from '../../components/ui/ExportButton.jsx';
import { formatExcelDate, formatExcelCurrency } from '../../utils/exportUtils.js';
import { useIsMobile } from "../../hooks/useMobile.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import Pagination from '../../components/ui/Pagination.jsx';
import { ORDER_STATUSES, ORDER_STATUS_VARIANT } from '../../constants/order.js';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, DEFAULT_SORT_DIRECTION } from '../../constants/pagination.js';

// Statuses for filtering - ensure consistency with backend

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [orders, setOrders] = useState([]);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle search with the new SearchInput component
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (value.trim() !== '') {
      setPageNumber(0); // Reset to first page only if search query is non-empty
    }
  }, []);

  // Fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [pageNumber, pageSize, selectedStatus, searchQuery, sortBy, sortDirection]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Define search fields to enhance search capabilities
      const searchFields = [
        'orderNumber',
        'createdByName',
        'orderDate',
        'expectedDeliveryDate'
      ].join(',');
      
      const data = await orderService.getAllOrders(
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchQuery,
        selectedStatus,
        searchFields
      );
      
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toastUtils.error(toast, "Error", "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(parseInt(newPageSize));
    setPageNumber(0); // Reset to first page when page size changes
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!orderId) {
      toastUtils.error(toast, "Error", "Invalid order ID");
      return;
    }
    
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      // Refresh the orders list
      fetchOrders();
      toastUtils.success(toast, "Status Updated", `Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toastUtils.error(toast, "Error", "Failed to update order status: " + (error.message || "Unknown error"));
    }
  };
  
  // Search is now handled by the SearchInput component
  
  // Handle status filter change
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPageNumber(0); // Reset to first page on filter change
  };
  
  // Format orders data for Excel export
  const formatOrdersForExport = (ordersData) => {
    return ordersData.map(order => {
      return {
        'Order Number': `#${order.orderNumber}`,
        'Created By': order.createdByName || '',
        'Order Date': formatExcelDate(
          order.orderDate, 
          'N/A', 
          (date) => formatDate(date, 'MM/DD/YYYY')
        ),
        'Expected Delivery': formatExcelDate(
          order.expectedDeliveryDate, 
          'N/A', 
          (date) => formatDate(date, 'MM/DD/YYYY')
        ),
        'Total Amount': formatExcelCurrency(order.totalAmount),
        'Status': order.status || ''
      };
    });
  };
  
  // Column widths for Excel export
  const orderExportColumnWidths = [
    { wch: 15 }, // Order Number
    { wch: 20 }, // Created By
    { wch: 12 }, // Order Date
    { wch: 15 }, // Expected Delivery
    { wch: 12 }, // Total Amount
    { wch: 12 }  // Status
  ];

 // Define columns for the orders table
  const columns = [
    {
      header: 'Order Number',
      accessor: 'orderNumber',
      sortable: true,
      sortKey: 'orderNumber', // Backend field name
    },
    {
      header: 'Created Date',
      accessor: (order) => isValidDate(order.orderDate) ? formatDate(order.orderDate) : (order.orderDate || ''),
      sortable: true,
      sortKey: 'orderDate', // Backend field name
    },
    {
      header: 'Total',
      accessor: (order) => `$${order.totalAmount.toFixed(2)}`,
      sortable: true,
      sortKey: 'totalAmount', // Backend field name
    },
    {
      header: 'Created By',
      accessor: 'createdByName',
      sortable: true,
      sortKey: 'users.username', // Special case handled in the backend
    },
    {
      header: 'Exp. Delivery',
      accessor: (order) => isValidDate(order.expectedDeliveryDate) ? formatDate(order.expectedDeliveryDate) : (order.expectedDeliveryDate || ''),
      sortable: true,
      sortKey: 'expectedDeliveryDate', // Backend field name
    },
    {
      header: 'Status',
      accessor: (order) => {
        const status = order?.status;
        
        return (
          <>
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disableOutline={true} className='px-0'>
                     <StatusBadge
                        status={ORDER_STATUS_VARIANT[status] || 'warning'}
                        text={status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                      />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {order.status === 'DELIVERED' || order.status === 'CANCELLED'
                    ? null
                    : (order.status === 'PENDING'
                        ? ['PROCESSING', 'CANCELLED']
                        : ['DELIVERED', 'CANCELLED']
                      ).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusBadge
                status={ORDER_STATUS_VARIANT[status] || 'warning'}
                text={status}
              />
            )}
          </>
        );
      },
    },
    {
      header: '',
      accessor: (order) => {
        if (!order || !order.orderNumber) {
          return <span>No actions available</span>;
        }
        
        // Check if user can edit this order
        const canEdit = () => {
          if (!user) return false;
          
          if (isAdmin) {
            // Admin can edit orders that are in Pending or Processing status
            return order.status === "PENDING" || order.status === "PROCESSING";
          } else if (user.role === "STAFF") {
            // Staff can only edit their own orders that are in Pending status
            return order.status === "PENDING" && order.createdById === user.id;
          }
          
          return false;
        };
        
        return (
          <div className="flex items-center space-x-1 justify-center">
            {/* View Button - Available for all users */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOrderAction(order, "view")}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
            >
              View
            </Button>
            
            {/* Edit Button - Only show if user has permission to edit this order */}
            {canEdit() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOrderAction(order, "edit")}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
              >
                Edit
              </Button>
            )}
          </div>
        );
      },
    },
  ];

    // Handle sort change
	const handleSort = (newSortBy, newDirection) => {
		// If newDirection is provided, use it; otherwise, toggle the direction
		let newSortDirection = newDirection;
		if (!newDirection) {
			newSortDirection = 'asc';
			if (sortBy === newSortBy) {
				newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			}
		}
		
		// Find the column with the matching sortKey or accessor to get the correct backend field name
		const column = columns.find(col => 
			col.sortKey === newSortBy || 
			col.accessor === newSortBy ||
			(typeof col.accessor === 'string' && col.accessor === newSortBy)
		);
		
		// Use the column's sortKey if available, otherwise use the newSortBy value
		const backendSortField = column?.sortKey || newSortBy;
		
		setSortBy(backendSortField);
		setSortDirection(newSortDirection);
    setPageNumber(0); // Reset to first page on new sort
	};

  // We're using server-side filtering, sorting, and pagination
  // so we don't need to filter or sort the data on the client side
  const filteredOrders = orders;

  // State for managing the order modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view", "edit", or null
  
  // Handle order actions (view, edit)
  const handleOrderAction = (order, mode) => {
    if (!order || !order.orderNumber) {
      toastUtils.error(toast, "Error", "Invalid order data");
      return;
    }
    
    
    // For edit mode, check if the user has permission
    if (mode === "edit") {
      const canEdit = () => {
        if (!user) return false;
        
        if (isAdmin) {
          // Admin can edit orders that are in Pending or Processing status
          return order.status === "PENDING" || order.status === "PROCESSING";
        } else if (user.role === "STAFF") {
          // Staff can only edit their own orders that are in Pending status
          return order.status === "PENDING" && order.createdById === user.id;
        }
        
        return false;
      };
      
      if (!canEdit()) {
        toastUtils.error(toast, "Permission Denied", "You don't have permission to edit this order.");
        return;
      }
    }
    
    // Set the selected order and modal mode
    setSelectedOrder(order);
    setModalMode(mode);
  };
  
  // Handle modal close
  const handleModalClose = () => {
    setSelectedOrder(null);
    setModalMode(null);
  };

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
          title="Orders"
          description="Manage customer orders"
          icon={<ShoppingCart />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <div className="action-buttons-container">
          <div className="action-button-search">
            <SearchContainer
              placeholder="Search by order, name, dates..."
              onSearch={handleSearch}
              initialValue={searchQuery}
              delay={300}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="action-button-filter">
                <Filter className="mr-2 h-4 w-4" /> {selectedStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ORDER_STATUSES.map((status) => (
                <DropdownMenuItem 
                  key={status}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportButton
            data={orders}
            formatData={formatOrdersForExport}
            columnWidths={orderExportColumnWidths}
            sheetName="Orders"
            fileName="Orders"
            variant="outline"
            size="sm"
            className="action-button-export"
          />
          <div className="action-button-add">
            <AddOrderModel onOrderAdded={fetchOrders} />
          </div>
        </div>
      </div>

      {/* Table or Mobile Cards */}
      {isMobile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <p>Loading orders...</p>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.orderNumber} className="w-full">
                <CardHeader>
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <CardDescription>Created: {isValidDate(order.orderDate) ? formatDate(order.orderDate) : (order.orderDate || '')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Total: ${order.totalAmount.toFixed(2)}</p>
                  <p>Status: <StatusBadge status={order.status === 'Delivered' ? 'success' : order.status === 'Processing' ? 'info' : order.status === 'Pending' ? 'warning' : 'danger'} text={order.status} /></p>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="link" className="w-full text-left p-0 justify-start h-auto mt-2">
                        See More
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <p>Created By: {order.createdByName}</p>
                      <p>Expected Delivery: {isValidDate(order.expectedDeliveryDate) ? formatDate(order.expectedDeliveryDate) : (order.expectedDeliveryDate || '')}</p>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOrderAction(order, "view")}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {isAdmin || (user?.role === 'STAFF' && order.status === 'PENDING' && order.createdById === user.id) ? (
                    <Button variant="outline" size="sm" onClick={() => handleOrderAction(order, "edit")}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="relative flex-grow min-h-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.10)]">
          <DataTable
            columns={columns}
            data={filteredOrders}
            keyField="orderNumber"
            onRowClick={(order) => handleOrderAction(order, "view")}
            loading={isLoading}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            styles={{tableMaxHeight: 'max-h-[calc(100vh-64px-56px-52px)]'}}
          />
        </div>
      )}

      <Pagination
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      
      {/* Order Modal for View/Edit */}
      {selectedOrder && modalMode && (
        <AddOrderModel
          mode={modalMode}
          order={selectedOrder}
          onOrderUpdated={fetchOrders}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Orders;
