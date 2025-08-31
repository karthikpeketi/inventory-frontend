import axiosClient from './axiosClient';

// Mock data for demonstration
// const mockData = {
//   products: [
//     { id: 1, name: 'Laptop Computer', sku: 'LAP001', categoryName: 'Electronics', unitPrice: 999.99, quantity: 10, reorderLevel: 5 },
//     { id: 2, name: 'Wireless Mouse', sku: 'MOU001', categoryName: 'Electronics', unitPrice: 29.99, quantity: 25, reorderLevel: 10 },
//     { id: 3, name: 'Office Chair', sku: 'CHR001', categoryName: 'Furniture', unitPrice: 199.99, quantity: 8, reorderLevel: 3 },
//     { id: 4, name: 'Desk Lamp', sku: 'LAM001', categoryName: 'Furniture', unitPrice: 49.99, quantity: 15, reorderLevel: 5 },
//     { id: 5, name: 'Notebook', sku: 'NOT001', categoryName: 'Stationery', unitPrice: 5.99, quantity: 100, reorderLevel: 20 }
//   ],
//   orders: [
//     { id: 1, orderNumber: 'ORD001', totalAmount: 1299.98, createdByName: 'John Doe', orderDate: '2024-01-15', status: 'pending' },
//     { id: 2, orderNumber: 'ORD002', totalAmount: 249.99, createdByName: 'Jane Smith', orderDate: '2024-01-14', status: 'completed' },
//     { id: 3, orderNumber: 'ORD003', totalAmount: 79.98, createdByName: 'Bob Johnson', orderDate: '2024-01-13', status: 'cancelled' }
//   ],
//   suppliers: [
//     { id: 1, name: 'Tech Solutions Inc', email: 'contact@techsolutions.com', contactPerson: 'Mike Wilson' },
//     { id: 2, name: 'Office Supplies Co', email: 'sales@officesupplies.com', contactPerson: 'Sarah Davis' },
//     { id: 3, name: 'Furniture World', email: 'info@furnitureworld.com', contactPerson: 'Tom Brown' }
//   ],
//   categories: [
//     { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
//     { id: 2, name: 'Furniture', description: 'Office and home furniture' },
//     { id: 3, name: 'Stationery', description: 'Office supplies and stationery items' }
//   ],
//   users: [
//     { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', role: 'admin' },
//     { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', role: 'staff' },
//     { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@company.com', role: 'staff' }
//   ]
// };

// const searchInData = (data, query) => {
//   const lowerQuery = query.toLowerCase();
//   return data.filter(item => {
//     return Object.values(item).some(value => 
//       value && value.toString().toLowerCase().includes(lowerQuery)
//     );
//   });
// };

export const searchAPI = {
  // Global search across all entities
  globalSearch: async (query, filters = {}) => {
    try {
      // Prepare search parameters
      const params = {
        q: query,
        entityType: filters.entityType || 'all',
        limit: filters.limit || 5
      };

      // Add optional filters
      if (filters.dateRange) params.dateRange = filters.dateRange;
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priceRange?.min) params.minPrice = filters.priceRange.min;
      if (filters.priceRange?.max) params.maxPrice = filters.priceRange.max;
      if (filters.stockLevel) params.stockLevel = filters.stockLevel;

      // Call the real API
      const response = await axiosClient.get('/search/global', { params });
      return response.data;
    } catch (error) {
      console.warn('Search API not available, using mock data:', error.message);
      
      // Fallback to mock data if API is not available
      // const results = {
      //   products: searchInData(mockData.products, query).slice(0, 5),
      //   orders: searchInData(mockData.orders, query).slice(0, 5),
      //   suppliers: searchInData(mockData.suppliers, query).slice(0, 5),
      //   categories: searchInData(mockData.categories, query).slice(0, 5),
      //   users: searchInData(mockData.users, query).slice(0, 5)
      // };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      return results;
    }
  },

  // Search specific entity types
  searchProducts: async (query, filters = {}) => {
    try {
      const response = await axiosClient.get('/search/products', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Product search error:', error);
      throw error;
    }
  },

  searchOrders: async (query, filters = {}) => {
    try {
      const response = await axiosClient.get('/search/orders', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Order search error:', error);
      throw error;
    }
  },

  searchSuppliers: async (query, filters = {}) => {
    try {
      const response = await axiosClient.get('/search/suppliers', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Supplier search error:', error);
      throw error;
    }
  },

  searchCategories: async (query, filters = {}) => {
    try {
      const response = await axiosClient.get('/search/categories', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Category search error:', error);
      throw error;
    }
  },

  searchUsers: async (query, filters = {}) => {
    try {
      const response = await axiosClient.get('/search/users', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('User search error:', error);
      throw error;
    }
  }
};