import axiosClient from "./axiosClient";

const supplierService = {
  /**
   * Get paginated suppliers with sorting
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @param {string} sortBy - Sort by field
   * @param {string} sortDirection - Sort direction (asc, desc)
   * @returns {Promise<Object>} - Promise with paginated suppliers data
   */
  getSuppliers: async (page = 0, size = 10, sortBy = null, sortDirection = 'asc') => {
    try {
      const params = { page, size };
      if (sortBy) {
        params.sort = `${sortBy},${sortDirection}`;
      }
      const response = await axiosClient.get("/suppliers", {
        params
      });
      // Check if response.data has 'content' property; if not, wrap it
      if (response.data && !response.data.hasOwnProperty('content')) {
        return {
          content: response.data,
          totalPages: 1,
          totalElements: response.data.length || 0
        };
      }
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch suppliers' };
    }
  },

  /**
   * Search suppliers by name
   * @param {string} name - Supplier name to search for
   * @returns {Promise<Array>} - Promise with array of supplier objects
   */
  searchSupplierByName: async (name) => {
    try {
      const response = await axiosClient.get("/suppliers/search", {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to search suppliers' };
    }
  },

  /**
   * Add a new supplier
   * @param {Object} data - Supplier data
   * @returns {Promise<Object>} - Promise with created supplier data
   */
  addSupplier: async (data) => {
    try {
      const response = await axiosClient.post("/suppliers", data);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to add supplier' };
    }
  },

  /**
   * Update a supplier
   * @param {number} id - Supplier ID
   * @param {Object} data - Updated supplier data
   * @returns {Promise<Object>} - Promise with updated supplier data
   */
  updateSupplier: async (id, data) => {
    try {
      const response = await axiosClient.put(`/suppliers/${id}`, data);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to update supplier' };
    }
  },

  /**
   * Delete a supplier (soft)
   * @param {number} id - Supplier ID
   * @returns {Promise<void>}
   */
  deleteSupplier: async (id) => {
    try {
      const response = await axiosClient.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to delete supplier' };
    }
  }
};

export default supplierService;
