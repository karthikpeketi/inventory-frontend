/**
 * Constants for order management
 */

// Order status types for filtering
export const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

// Order status variants for UI styling
export const ORDER_STATUS_VARIANT = {
  Delivered: 'success',
  Processing: 'info',
  Pending: 'warning',
  Cancelled: 'danger',
};
