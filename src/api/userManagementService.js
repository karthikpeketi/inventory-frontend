import axiosClient from './axiosClient';
import { USER_STATUS } from '../constants/userStatus';

const userManagementService = {
  /**
   * Get users with pagination, sorting, and filtering
   * @param {number} pageNumber - Page number (0-based)
   * @param {number} pageSize - Number of items per page
   * @param {string} sortBy - Field to sort by
   * @param {string} sortDirection - Sort direction ('asc' or 'desc')
   * @param {string} searchQuery - Search query for filtering
   * @param {string} searchFields - Comma-separated list of fields to search in
   * @param {boolean|null} isActive - Filter by active status (true = only active, false = only inactive, null = all)
   * @param {boolean} pendingApproval - Whether to show only users pending approval
   * @returns {Promise<Object>} - Paginated users data
   */
  getUsers: async (
    pageNumber = 0,
    pageSize = 10,
    sortBy = 'firstName',
    sortDirection = 'asc',
    searchQuery = '',
    searchFields = 'firstName,lastName,email',
    isActive = true,
    pendingApproval = false
  ) => {
    try {
      const params = {
        page: pageNumber,
        size: pageSize,
        sort: sortBy || undefined,
        direction: sortDirection || undefined,
        search: searchQuery || undefined,
        searchFields: searchFields || undefined,
        isActive: isActive === null ? undefined : isActive,
        pendingApproval: pendingApproval || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axiosClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create user' };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user' };
    }
  },

  /**
   * Mark a user as inactive instead of deleting them
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  deactivateUser: async (id) => {
    try {
      // Use the dedicated endpoint for deactivating users
      const response = await axiosClient.post(`/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to deactivate user' };
    }
  },

  /**
   * Reactivate an inactive user
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  reactivateUser: async (id) => {
    try {
      // Use the dedicated endpoint for reactivating users
      const response = await axiosClient.post(`/users/${id}/reactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reactivate user' };
    }
  },

  /**
   * Hard delete a user (kept for backward compatibility)
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  deleteUser: async (id) => {
    try {
      const response = await axiosClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },
  
  /**
   * Resend activation email to a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  resendActivationEmail: async (id) => {
    try {
      const response = await axiosClient.post(`/users/${id}/send-activation-email`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send activation email' };
    }
  },
  
  /**
   * Approve a user registration
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  approveUser: async (id) => {
    try {
      // Use the dedicated endpoint for approving users
      const response = await axiosClient.post(`/users/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve user' };
    }
  },
  
  /**
   * Reject a user registration
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  rejectUser: async (id) => {
    try {
      // Use the dedicated endpoint for rejecting users
      const response = await axiosClient.post(`/users/${id}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject user' };
    }
  },
  
  /**
   * Send activation email to a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  sendActivationEmail: async (id) => {
    try {
      const response = await axiosClient.post(`/users/${id}/send-activation`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send activation email' };
    }
  },
};

export default userManagementService;
