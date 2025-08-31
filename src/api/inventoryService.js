import axiosClient from './axiosClient';

const inventoryService = {
  getRecentTransactions: async (count = 5) => {
    try {
      const response = await axiosClient.get(`/inventory/transactions/recent?count=${count}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch recent transactions' };
    }
  },

  getInventoryValue: async () => {
    try {
      const response = await axiosClient.get('/inventory/value');
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch inventory value' };
    }
  },
};

export default inventoryService;
