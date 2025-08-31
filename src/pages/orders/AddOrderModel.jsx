import { useState, useEffect } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button.jsx";
import DateInput from "../../components/ui/DateInput.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import SearchableSelect from "../../components/ui/SearchableSelect.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { orderService } from "../../api";
import { productService } from "../../api";
import { supplierService } from "../../api";
import { formatDate, parseDate } from "../../lib/utils.js";
import { Textarea } from "../../components/ui/textarea.jsx";

const AddOrderModel = ({ mode = "add", order: initialOrder = null, onOrderAdded, onOrderUpdated, onClose }) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { user, isAdmin } = useAuth();
  
  // Create mode constants for better readability
  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  
  // Set the title based on the mode
  const modalTitle = isAddMode 
    ? "Add New Purchase Order" 
    : isEditMode 
      ? "Edit Purchase Order" 
      : "View Purchase Order";

  // Check if user has permission to create/edit orders
  const canCreateOrder = user && (isAdmin || user.role === "STAFF");
  
  // Check if user can edit this specific order (based on role and order status)
  const canEditOrder = () => {
    if (!user || !initialOrder) return false;
    
    if (isAdmin) {
      // Admin can edit orders that are in Pending or Processing status
      return initialOrder.status === "PENDING" || initialOrder.status === "PROCESSING";
    } else if (user.role === "STAFF") {
      // Staff can only edit their own orders that are in Pending status
      return initialOrder.status === "PENDING" && initialOrder.createdById === user.id;
    }
    
    return false;
  };
  
  // If we're in edit mode but user doesn't have permission, switch to view mode
  useEffect(() => {
    if (isEditMode && !canEditOrder()) {
      if (onClose) onClose(); // Close the modal
      toastUtils.error(toast, "Permission Denied", "You don't have permission to edit this order.");
    }
  }, [isEditMode, user]);

    // Initialize order state
    const [order, setOrder] = useState({
      supplierId: "",
      orderDate: formatDate(new Date(), 'DD-MM-YYYY'),
      expectedDeliveryDate: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    });
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize with data if in edit or view mode
  useEffect(() => {
    if (initialOrder && (isEditMode || isViewMode)) {
      // Format the order without fetching data in view mode
      const formattedOrder = {
        id: initialOrder.id,
        // Find supplier ID from supplier name if not directly provided
        supplierId: initialOrder.supplierId ? 
          initialOrder.supplierId.toString() : "",
        orderDate: initialOrder.orderDate || formatDate(new Date(), 'DD-MM-YYYY'),
        expectedDeliveryDate: initialOrder.expectedDeliveryDate || "",
        notes: initialOrder.notes || "",
        status: initialOrder.status || "PENDING",
        createdById: initialOrder.createdById,
        items: initialOrder.items?.length > 0 
          ? initialOrder.items.map(item => ({
              id: item.id,
              productId: item.productId?.toString() || "",
              productName: item.productName || "",
              quantity: parseInt(item.quantity) || 1,
              unitPrice: parseFloat(item.unitPrice) || 0,
              total: parseFloat(item.total) || 0
            }))
          : [{ productId: "", quantity: 1, unitPrice: 0 }]
      };
      
      setOrder(formattedOrder);
      
      // Calculate total amount
      if (initialOrder.items?.length > 0) {
        const total = initialOrder.items.reduce(
          (sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0
        );
        setTotalAmount(total);
      }

      // Fetch products only in edit mode
      if (isEditMode) {
        const loadData = async () => {
          try {
            const productsData = await productService.getProducts(0, 100);
            setProducts(productsData.content || []);
          } catch (error) {
            console.error("Error loading data:", error);
            toastUtils.error(toast, "Error", "Failed to load order data");
          }
        };
        loadData();
      }
    }
  }, [initialOrder, mode, toast, isEditMode, isViewMode]);

  const fetchSuppliers = async (searchTerm, page, limit) => {
    try {
      if (searchTerm && searchTerm.trim()) {
        // For search, we need to handle pagination differently
        // Since searchSupplierByName doesn't support pagination, we'll simulate it
        const data = await supplierService.searchSupplierByName(searchTerm);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return data.slice(startIndex, endIndex);
      } else {
        // Use regular getSuppliers with proper parameters for infinite scroll
        const data = await supplierService.getSuppliers(page - 1, limit, 'name', 'asc');
        return data.content || [];
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toastUtils.error(toast, "Error", "Failed to fetch suppliers");
      return [];
    }
  };

  const fetchProducts = async (searchTerm, page, limit) => {
    try {
      let data;
      if (searchTerm) {
        searchTerm.trim()
      }
      data = await productService.getProducts(page - 1, limit, 'name', 'asc', searchTerm);
      return data.content ? data.content.map(product => ({
        id: product.id,
        name: product.name,
        costPrice: product.costPrice
      })) : [];
    } catch (error) {
      console.error("Error fetching products:", error);
      toastUtils.error(toast, "Error", "Failed to fetch products");
      return [];
    }
  };
  
  // Fetch data function (extracted for reuse)
  const fetchData = async () => {
    try {
      // We don't need to pre-fetch all products anymore
      // as SearchableSelect will handle the loading
      setProducts([]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toastUtils.error(toast, "Error", "Failed to fetch products");
    }
  };

  useEffect(() => {
    // Only fetch data in add mode when the modal is opened
    // For edit/view modes, data is fetched in the initialOrder useEffect
    if (isAddMode && open) {
      fetchData();
    }
  }, [open, isAddMode, toast]);

  useEffect(() => {
    const calculateTotal = () => {
      const total = order.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      setTotalAmount(total);
    };
    calculateTotal();
  }, [order.items]);
  
  
  // parseDate is imported from utils.js

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...order.items];
    
    // Handle numeric values properly
    if (field === 'quantity') {
      // Ensure quantity is a valid number
      const numValue = parseInt(value);
      updatedItems[index][field] = isNaN(numValue) ? 1 : Math.max(1, numValue);
    } else if (field === 'unitPrice') {
      // Ensure unit price is a valid number
      const numValue = parseFloat(value);
      updatedItems[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      updatedItems[index][field] = value;
    }
    
    // Update product price when product is selected
    if (field === "productId") {
      const selectedProduct = products.find((p) => p.id?.toString() === value?.toString());
      if (selectedProduct) {
        updatedItems[index].unitPrice = parseFloat(selectedProduct.costPrice) || 0;
        updatedItems[index].productName = selectedProduct.name; // Store product name for display
      }
    }
    
    setOrder((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setOrder((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!order.supplierId) {
      toastUtils.error(toast, "Error", "Please select a supplier");
      return;
    }
    if (
      order.items.length === 0 ||
      order.items.some((item) => !item.productId || item.quantity <= 0)
    ) {
      toastUtils.error(toast, "Error", "Please add at least one valid item with quantity");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        supplierId: parseInt(order.supplierId),
        orderDate: order.orderDate,
        expectedDeliveryDate: order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate, 'YYYY-MM-DD') : null,
        notes: order.notes,
        totalAmount: totalAmount,
        items: order.items.map((item) => ({
          id: item.id, // Include item ID for edit mode
          productId: parseInt(item.productId),
          productName: item.productName, // Include product name for display
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
      };
      
      let result;
      if (isAddMode) {
        // Create new order
        result = await orderService.createOrder(orderData, user.id);
        toastUtils.success(toast, "Order Created", "New purchase order has been successfully created");
        if (onOrderAdded) onOrderAdded();
      } else if (isEditMode) {
        // Update existing order
        result = await orderService.updateOrder(order.id, {
          ...orderData,
          id: order.id,
          status: order.status,
          createdById: order.createdById // Preserve the original creator
        });
        toastUtils.success(toast, "Order Updated", "Purchase order has been successfully updated");
        if (onOrderUpdated) onOrderUpdated();
      }
      
      // Close the modal
      if (isAddMode) {
        setOpen(false);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error(isAddMode ? "Error creating order:" : "Error updating order:", error);
      toastUtils.error(toast, "Error", `Failed to ${isAddMode ? 'create' : 'update'} order: ` + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // For dialog trigger in add mode
  const renderTrigger = () => {
    if (!isAddMode) return null;
    
    if (!canCreateOrder) return null;
    
    return (
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Order
        </Button>
      </DialogTrigger>
    );
  };

  return (
    <Dialog open={isAddMode ? open : true} onOpenChange={isAddMode ? setOpen : onClose}>
      {renderTrigger()}
      <DialogContent 
        className="sm:max-w-[600px] min-w-[600px] max-h-[80vh] flex flex-col"
        aria-describedby="order-form-description"
        >
        <DialogHeader className="flex flex-row items-center justify-between border-b py-3">
          <div>
            <DialogTitle>{modalTitle}</DialogTitle>
            <p id="order-form-description" className="text-sm text-gray-500 mt-1">
              {isAddMode ? "Create a new purchase order" : isEditMode ? "Modify existing purchase order" : "View purchase order details"}
            </p>
          </div>
          {(isViewMode || isEditMode) && initialOrder && (
            <div className="text-sm text-gray-500 mr-10">
              Status: <span className={`font-medium ${
                initialOrder.status === "PENDING" ? "text-yellow-600" :
                initialOrder.status === "PROCESSING" ? "text-blue-600" :
                initialOrder.status === "DELIVERED" ? "text-blue-600" :
                "text-red-600"
              }`}>{initialOrder.status}</span>
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <div className="flex flex-col gap-4">
            {/* Order Details Section */}
            <div className="flex flex-wrap gap-4">
              {/* Supplier Selection */}
              <div className="flex flex-col gap-2 w-full sm:w-[calc(50%-0.5rem)]">
                <Label htmlFor="supplierId">Supplier</Label>
                {isViewMode ? (
                  <Input
                    value={initialOrder?.supplierName || ""}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                ) : (
                  <SearchableSelect
                    fetchOptions={fetchSuppliers}
                    onSelect={(supplier) => handleSelectChange("supplierId", supplier.id)}
                    placeholder="Select a supplier"
                    value={order.supplierId}
                  />
                )}
              </div>
              
              {/* Order Date */}
              <div className="flex flex-col gap-2 min-w-[150px]">
                {isViewMode ? (
                  <div className="flex flex-col gap-1">
                    <Label>Order Date</Label>
                    <Input 
                      value={order.orderDate || ""}
                      readOnly
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                ) : (
                  <DateInput
                    label="Order Date"
                    value={parseDate(order.orderDate)}
                    onChange={(date) =>
                      handleInputChange({
                        target: {
                          name: "orderDate",
                          value: date ? formatDate(date, 'DD-MM-YYYY') : "",
                        },
                      })
                    }
                    readOnly={true} // Always read-only as per requirements
                  />
                )}
              </div>
              
              {/* Expected Delivery Date */}
              <div className="flex flex-col gap-2 min-w-[150px]">
                {isViewMode ? (
                  <div className="flex flex-col gap-1">
                    <Label>Exp. Delivery</Label>
                    <Input 
                      value={order.expectedDeliveryDate || ""}
                      readOnly
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                ) : (
                  <DateInput
                    label="Exp. Delivery"
                    value={parseDate(order.expectedDeliveryDate)}
                    onChange={(date) =>
                      handleInputChange({
                        target: {
                          name: "expectedDeliveryDate",
                          value: date ? formatDate(date, 'DD-MM-YYYY') : "",
                        },
                      })
                    }
                    minDate={parseDate(order.orderDate) || new Date()}
                    readOnly={isViewMode} // Read-only in view mode
                  />
                )}
              </div>
              
              {/* Notes Field */}
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={order.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Add any special instructions or notes here"
                  readOnly={isViewMode}
                  disabled={isViewMode}
                  className={`w-full ${isViewMode ? "bg-gray-50" : ""}`}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Order Items Section */}
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Order Items</h3>

              {/* Header Row */}
              <div className="flex items-center gap-2 mb-2 font-medium">
                <Label className="w-[40%] pl-1">Product</Label>
                <Label className="w-[20%] pl-1">Quantity</Label>
                <Label className="w-[20%] pl-1">Unit Price</Label>
                <Label className="w-[15%] pl-1">Total</Label>
                {!isViewMode && <div className="w-[5%]"></div>}
              </div>

              {/* Order Item Rows */}
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  {/* Product */}
                  <div className="w-[40%]">
                    {isViewMode ? (
                      <Input
                        value={item.productName || 
                               products.find(p => p.id?.toString() === item.productId?.toString())?.name || 
                               ""}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    ) : (
                      <SearchableSelect
                        fetchOptions={fetchProducts}
                        onSelect={(product) => {
                          // Update both productId and unitPrice when a product is selected
                          handleItemChange(index, "productId", product.id);
                          handleItemChange(index, "unitPrice", parseFloat(product.costPrice) || 0);
                        }}
                        placeholder="Search and select a product"
                        value={item.productId}
                      />
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="w-[20%]">
                    {isViewMode ? (
                      <Input
                        type="number"
                        value={item.quantity}
                        readOnly
                        disabled
                        className="text-center border focus-visible:ring-0 focus-visible:ring-offset-0 px-0 w-full h-10 bg-gray-50"
                      />
                    ) : (
                      <div className="flex items-center border rounded-md overflow-hidden h-10">
                        <div
                          onClick={() => {
                            if (item.productId) {
                              handleItemChange(
                                index,
                                "quantity",
                                Math.max(1, item.quantity - 1)
                              );
                            }
                          }}
                          className={`w-8 h-full flex items-center justify-center border-r cursor-pointer text-gray-600 ${!item.productId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Minus className="h-4 w-4" />
                        </div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          className="text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 w-16 h-full"
                        />
                        <div
                          onClick={() => {
                            if (item.productId) {
                              handleItemChange(index, "quantity", item.quantity + 1);
                            }
                          }}
                          className={`w-8 h-full flex items-center justify-center border-l cursor-pointer text-gray-600 ${!item.productId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div className="w-[20%]">
                    <Input
                      type="number"
                      value={item.unitPrice.toFixed(2)}
                      readOnly
                      disabled
                      placeholder="0.00"
                      className="w-full text-left pl-2 h-10 bg-gray-50"
                    />
                  </div>
                  
                  {/* Item Total */}
                  <div className="w-[15%]">
                    <Input
                      type="text"
                      value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                      readOnly
                      disabled
                      className="w-full text-left pl-2 h-10 bg-gray-50"
                    />
                  </div>

                  {/* Delete Icon - only show in add/edit mode */}
                  {!isViewMode && (
                    <div className="w-[5%]">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Item Button - only show in add/edit mode */}
              {!isViewMode && (
                <Button variant="outline" onClick={addItem} className="mt-2 w-fit">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              )}
            </div>
            
            {/* Created By Information - only show in view/edit mode */}
            {(isViewMode || isEditMode) && initialOrder && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Created by: {initialOrder.createdByName || "Unknown"}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with Total and Action Buttons */}
        <div className="flex justify-between items-center border-t pt-3 mt-4">
          <strong className="text-lg">
            Total Amount:{" "}
            <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
          </strong>
          <div className="flex gap-2">
            {isViewMode ? (
              <Button onClick={onClose}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={isAddMode ? () => setOpen(false) : onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (isAddMode ? "Creating..." : "Updating...") : (isAddMode ? "Create Order" : "Update Order")}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderModel;
