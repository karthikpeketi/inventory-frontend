import axiosClient from './axiosClient';

const categoryService = {
  /**
   * Get all categories (for dropdowns, etc.)
   * @returns {Promise} - Promise with all categories data
   */
  getAllCategories: async () => {
    try {
      const response = await axiosClient.get('/categories/all');
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  /**
   * Get paginated categories with sorting and filtering
   * @param {number} pageNumber - Page number (0-based)
   * @param {number} pageSize - Number of items per page
   * @param {string} sortBy - Field to sort by
   * @param {string} sortDirection - Sort direction (asc or desc)
   * @param {string} searchQuery - Optional search term
   * @returns {Promise} - Promise with paginated category data
   */
  getCategories: async (pageNumber = 0, pageSize = 10, sortBy = 'name', sortDirection = 'asc', searchQuery = '') => {
    try {
      const response = await axiosClient.get('/categories', {
        params: {
          page: pageNumber,
          size: pageSize,
          sort: sortBy || undefined,
          direction: sortDirection || undefined,
          search: searchQuery || undefined
        }
      });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  /**
   * Get one category by ID
   * @param {number} id - Category ID
   * @returns {Promise} - Promise with category data
   */
  getCategoryById: async (id) => {
    try {
      const response = await axiosClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch category' };
    }
  },

  /**
   * Create a new category (admin)
   * @param {Object} category - Category data
   * @returns {Promise} - Promise with created category data
   */
  createCategory: async (category) => {
    try {
      const response = await axiosClient.post('/categories', category);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to create category' };
    }
  },

  /**
   * Update a category
   * @param {number} id - Category ID
   * @param {Object} category - Updated category data
   * @returns {Promise} - Promise with updated category data
   */
  updateCategory: async (id, category) => {
    try {
      const response = await axiosClient.put(`/categories/${id}`, category);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to update category' };
    }
  },

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise} - Promise with deletion response
   */
  deleteCategory: async (id) => {
    try {
      const response = await axiosClient.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to delete category' };
    }
  },
};

export default categoryService;
