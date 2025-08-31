/**
 * Constants for product and inventory management
 */

// Product status types
export const PRODUCT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  OUT_OF_STOCK: 'Out of Stock',
  LOW_STOCK: 'Low stock',
};

// Product status variants (for UI styling)
export const PRODUCT_STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
  OUT_OF_STOCK: 'danger',
  LOW_STOCK: 'warning',
};

// Transaction types
export const TRANSACTION_TYPES = {
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN',
};