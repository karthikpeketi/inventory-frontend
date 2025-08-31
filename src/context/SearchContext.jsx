import React, { createContext, useContext, useState, useCallback } from 'react';
import { searchAPI } from '../api/searchAPI';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    products: [],
    orders: [],
    suppliers: [],
    categories: [],
    users: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState({
    entityType: 'all',
    dateRange: '',
    status: '',
    category: '',
    priceRange: { min: '', max: '' },
    stockLevel: ''
  });

  const performSearch = useCallback(async (query, filters = searchFilters) => {
    if (!query.trim()) {
      setSearchResults({
        products: [],
        orders: [],
        suppliers: [],
        categories: [],
        users: []
      });
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAPI.globalSearch(query, filters);
      setSearchResults(results);
      setShowResults(true);
      
      // Add to search history if not already present
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 4)]); // Keep last 5 searches
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        products: [],
        orders: [],
        suppliers: [],
        categories: [],
        users: []
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchHistory, searchFilters]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults({
      products: [],
      orders: [],
      suppliers: [],
      categories: [],
      users: []
    });
    setShowResults(false);
    setSelectedFilter('all'); // Reset filter to 'all' when clearing search
  }, []);

  const hideResults = useCallback(() => {
    setShowResults(false);
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    searchHistory,
    searchFilters,
    setSearchFilters,
    selectedFilter,
    setSelectedFilter,
    performSearch,
    clearSearch,
    hideResults,
    setShowResults
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};