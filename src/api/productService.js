import axiosClient from './axiosClient';

const productService = {
  /**
   * Get products with pagination, sorting, searching, and category filtering
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @param {string} sortBy - Sort by field
   * @param {string} sortDirection - Sort direction (asc, desc)
   * @param {string} searchQuery - Search query
   * @param {string} categoryName - Filter by category name (default 'All')
   * @returns {Promise<Object>} - Promise with paginated data
   */
  getProducts: async (page = 0, size = 10, sortBy = null, sortDirection = 'asc', searchQuery = '', categoryName = 'All') => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);

      if (sortBy) {
        params.append('sort', `${sortBy},${sortDirection}`);
      }

      // Add search query and category filter if they are provided and not default
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (categoryName && categoryName !== 'All') {
        params.append('category', categoryName);
      }

      const queryString = params.toString();
      const response = await axiosClient.get(`/products/paginated?${queryString}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch products' };
    }
  },

  /**
   * Get one product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} - Promise with product data
   */
  getProductById: async (id) => {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch product' };
    }
  },

  /**
   * Search products by name
   * @param {string} name - Product name to search for
   * @returns {Promise<Object>} - Promise with search results
   */
  searchProducts: async (name) => {
    try {
      const response = await axiosClient.get(`/products/search?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to search products' };
    }
  },

  /**
   * Get low stock products
   * @returns {Promise<Object>} - Promise with low stock products data
   */
  getLowStockProducts: async () => {
    try {
      const response = await axiosClient.get('/products/low-stock');
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to fetch low stock products' };
    }
  },

  /**
   * Create a new product (admin)
   * @param {Object} product - Product data
   * @param {number} userId - ID of the user creating the product
   * @returns {Promise<Object>} - Promise with created product data
   */
  createProduct: async (product, userId) => {
    try {
      const response = await axiosClient.post(`/products?userId=${userId}`, product);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to create product' };
    }
  },

  /**
   * Update a product
   * @param {number} id - Product ID
   * @param {Object} product - Updated product data
   * @returns {Promise<Object>} - Promise with updated product data
   */
  updateProduct: async (id, product) => {
    try {
      const response = await axiosClient.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to update product' };
    }
  },

  /**
   * Delete a product
   * @param {number} id - Product ID
   * @returns {Promise<void>}
   */
  deleteProduct: async (id) => {
    try {
      const response = await axiosClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to delete product' };
    }
  },

  /**
   * Sell a product (reduce inventory count)
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to sell
   * @param {string} [notes] - Optional notes about the sale
   * @returns {Promise<Object>} - Promise with the transaction data
   */
  sellProduct: async (productId, quantity, notes = '') => {
    try {
      const response = await axiosClient.post('/inventory/sell', {
        productId,
        quantity,
        notes
      });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Failed to sell product' };
    }
  },
};

export default productService;
