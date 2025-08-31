import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, TrendingUp, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useSearch } from '../../context/SearchContext';
import { useDebounce } from '../../hooks/useDebounce';
import SearchResults from './SearchResults';

const EnhancedSearchInterface = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    searchQuery,
    setSearchQuery,
    performSearch,
    clearSearch,
    hideResults,
    showResults,
    setShowResults,
    searchResults
  } = useSearch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const searchContainerRef = useRef(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
    } else {
      clearSearch();
    }
  }, [debouncedSearchQuery, performSearch, clearSearch]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        hideResults();
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideResults]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideResults();
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setShowResults(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      setShowSuggestions(false);
      
      // Handle Enter key navigation after a short delay to allow search results to load
      setTimeout(() => {
        handleEnterKeyNavigation();
      }, 100);
    }
  };

  const handleEnterKeyNavigation = () => {
    if (!searchQuery.trim()) return;

    // Map current path to entity type
    const getCurrentPageType = () => {
      const path = location.pathname;
      if (path.includes('/products')) return 'products';
      if (path.includes('/orders')) return 'orders';
      if (path.includes('/suppliers')) return 'suppliers';
      if (path.includes('/categories')) return 'categories';
      if (path.includes('/user-management')) return 'users';
      return null;
    };

    // Map entity type to navigation path
    const getNavigationPath = (type) => {
      const paths = {
        products: '/products',
        orders: '/orders',
        suppliers: '/suppliers',
        categories: '/categories',
        users: '/user-management'
      };
      return paths[type] || null;
    };

    const currentPageType = getCurrentPageType();
    
    // If we're on a specific page, always navigate to that page with the search query
    // This will trigger the page-level search regardless of whether there are global search results
    if (currentPageType) {
      const currentPath = getNavigationPath(currentPageType);
      
      // Always use replace: false to ensure the navigation triggers properly
      navigate(`${currentPath}?search=${encodeURIComponent(searchQuery)}`, { replace: false });
      
      // Clear the global search
      clearSearch();
      hideResults();
      return;
    }

    // If we're not on a specific page, find the best match from search results
    if (searchResults) {
      const entityTypes = ['products', 'orders', 'suppliers', 'categories', 'users'];
      
      for (const entityType of entityTypes) {
        if (searchResults[entityType] && searchResults[entityType].length > 0) {
          const path = getNavigationPath(entityType);
          if (path) {
            navigate(`${path}?search=${encodeURIComponent(searchQuery)}`);
            
            // Clear the global search
            clearSearch();
            hideResults();
            return;
          }
        }
      }
    }

    // Fallback: if no specific results found, navigate to products page
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    clearSearch();
    hideResults();
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search products, orders, suppliers..."
            className="w-full pl-12 pr-12 py-3 rounded-2xl border-gray-200 bg-gray-50/80 backdrop-blur-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          
          {/* Clear Button */}
          {searchQuery && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">Suggestions</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-gray-400" />
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {!showSuggestions && <SearchResults />}
    </div>
  );
};

export default EnhancedSearchInterface;