import axiosClient from './axiosClient';

const orderService = {
  /**
   * Get all orders with pagination, filtering, and sorting
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @param {string} sortBy - Sort by field
   * @param {string} sortDirection - Sort direction (asc, desc)
   * @param {string} searchQuery - Search query
   * @param {string} status - Filter by status (Pending, Processing, Delivered, Cancelled, All)
   * @param {string} searchFields - Comma-separated list of fields to search in
   * @returns {Promise<Object>} - Promise with paginated data
   */
  getAllOrders: async (page = 0, size = 10, sortBy = null, sortDirection = 'asc', searchQuery = '', status = 'All', searchFields = '') => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);

      if (sortBy) {
        // Don't use the 'sort' parameter as it's not being used by the backend
        // Instead, pass sortBy and sortDirection as separate parameters
        params.append('sortBy', sortBy);
        params.append('sortDirection', sortDirection);
      }

      // Add search query if provided
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Add status filter if not 'All'
      if (status && status !== 'All') {
        params.append('status', status);
      }
      
      // Add search fields if provided
      if (searchFields) {
        params.append('searchFields', searchFields);
      }

      const queryString = params.toString();
      const response = await axiosClient.get(`/orders?${queryString}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch orders' };
    }
  },

  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object>} - Promise with order data
   */
  getOrderById: async (id) => {
    try {
      const response = await axiosClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch order' };
    }
  },

  /**
   * Create a new order
   * @param {Object} order - Order data
   * @param {number} userId - ID of the user creating the order
   * @returns {Promise<Object>} - Promise with created order
   */
  createOrder: async (order, userId) => {
    try {
      const orderData = { ...order, createdById: userId };
      const response = await axiosClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to create order' };
    }
  },

  /**
   * Update an existing order
   * @param {number} id - Order ID
   * @param {Object} order - Updated order data
   * @returns {Promise<Object>} - Promise with updated order
   */
  updateOrder: async (id, order) => {
    try {
      const response = await axiosClient.put(`/orders/${id}`, order);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to update order' };
    }
  },

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status (Pending, Processing, Delivered, Cancelled)
   * @returns {Promise<Object>} - Promise with updated order
   */
  updateOrderStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to update order status' };
    }
  },

  /**
   * Delete an order
   * @param {number} id - Order ID
   * @returns {Promise<void>}
   */
  deleteOrder: async (id) => {
    try {
      const response = await axiosClient.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to delete order' };
    }
  }
};

export default orderService;
