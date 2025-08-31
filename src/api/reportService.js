import axiosClient from './axiosClient';

const reportService = {
  /**
   * Get stock movement data for a specified date range
   * @param {string} startDate - Start date in ISO format (yyyy-MM-dd)
   * @param {string} endDate - End date in ISO format (yyyy-MM-dd)
   * @returns {Promise<Array>} - Promise with stock movement data
   */
  getStockMovementData: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axiosClient.get(`/reports/stock-movement?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch stock movement data' };
    }
  },

  /**
   * Get top selling products for a specified period
   * @param {number} period - Period in days (default 30)
   * @param {number} limit - Number of products to return (default 5)
   * @returns {Promise<Array>} - Promise with top selling products data
   */
  getTopSellingProducts: async (period = 30, limit = 5) => {
    try {
      const response = await axiosClient.get(`/reports/top-products?period=${period}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch top selling products' };
    }
  },

  /**
   * Get slow moving products (products with low sales)
   * @param {number} period - Period in days (default 30)
   * @param {number} limit - Number of products to return (default 5)
   * @returns {Promise<Array>} - Promise with slow moving products data
   */
  getSlowMovingProducts: async (period = 30, limit = 5) => {
    try {
      const response = await axiosClient.get(`/reports/slow-moving?period=${period}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch slow moving products' };
    }
  },

  /**
   * Get supplier contribution data
   * @param {number} period - Period in days (default 90)
   * @returns {Promise<Array>} - Promise with supplier contribution data
   */
  getSupplierContribution: async (period = 90) => {
    try {
      const response = await axiosClient.get(`/reports/supplier-contribution?period=${period}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch supplier contribution data' };
    }
  },

  /**
   * Get order value trend data
   * @param {number} months - Number of months to include (default 6)
   * @returns {Promise<Array>} - Promise with monthly order value data
   */
  getOrderValueTrend: async (months = 6) => {
    try {
      const response = await axiosClient.get(`/reports/order-value-trend?months=${months}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch order value trend data' };
    }
  }
};

export default reportService;
