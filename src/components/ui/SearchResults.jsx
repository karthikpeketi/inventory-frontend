import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  FolderOpen, 
  Users, 
  Search,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from './button';
import { useSearch } from '../../context/SearchContext';
import SearchHighlight from './SearchHighlight';

const SearchResults = ({ className = '' }) => {
  const navigate = useNavigate();
  const { 
    searchResults, 
    isSearching, 
    showResults, 
    searchQuery, 
    searchHistory,
    hideResults,
    setSearchQuery,
    performSearch,
    selectedFilter,
    setSelectedFilter,
    clearSearch
  } = useSearch();

  const filterButtons = [
    { key: 'all', label: 'All', icon: Search },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'categories', label: 'Categories', icon: FolderOpen },
    { key: 'suppliers', label: 'Suppliers', icon: Truck },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'users', label: 'Users', icon: Users }
  ];

  const getEntityIcon = (type) => {
    const icons = {
      products: Package,
      orders: ShoppingCart,
      suppliers: Truck,
      categories: FolderOpen,
      users: Users
    };
    return icons[type] || Package;
  };

  const getEntityColor = (type) => {
    const colors = {
      products: 'text-blue-600',
      orders: 'text-green-600',
      suppliers: 'text-purple-600',
      categories: 'text-orange-600',
      users: 'text-gray-600'
    };
    return colors[type] || 'text-blue-600';
  };

  const getNavigationPath = (type) => {
    const paths = {
      products: '/products',
      orders: '/orders',
      suppliers: '/suppliers',
      categories: '/categories',
      users: '/user-management'
    };
    return paths[type] || '/dashboard';
  };

  const handleFilterClick = (filterKey) => {
    setSelectedFilter(filterKey);
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleResultClick = (item, type) => {
    const path = getNavigationPath(type);
    hideResults();
    
    // Get the item name based on type
    const getItemName = () => {
      switch (type) {
        case 'products':
          return item.name;
        case 'orders':
          return item.orderNumber;
        case 'users':
          return item.firstName;
        default:
          return item.name;
      }
    };
    
    const itemName = getItemName();
    
    // Navigate to the page and pass the clicked item name as a URL parameter
    navigate(`${path}?search=${encodeURIComponent(itemName)}`);
    
    // Clear the global search to avoid conflicts
    clearSearch();
  };

  const renderResultItem = (item, type) => {
    const Icon = getEntityIcon(type);
    const colorClass = getEntityColor(type);

    const getMainText = () => {
      switch (type) {
        case 'products':
          return item.name;
        case 'orders':
          return item.orderNumber;
        case 'users':
          return item.firstName;
        default:
          return item.name;
      }
    };

    const getSubText = () => {
      switch (type) {
        case 'products':
          return item.sku ? `SKU: ${item.sku} • ${item.categoryName || 'No category'} • $${item.unitPrice?.toFixed(2) || '0.00'}` : `${item.categoryName || 'No category'}`;
        case 'orders':
          return `$${item.totalAmount?.toFixed(2) || '0.00'} • ${item.createdByName || 'Unknown'} • ${item.orderDate || 'No date'}`;
        case 'suppliers':
          return `${item.contactPerson || 'No contact'} • ${item.email || 'No email'}`;
        case 'categories':
          return item.description || 'No description';
        case 'users':
          return `${item.email || 'No email'} • ${item.role || 'No role'}`;
        default:
          return '';
      }
    };

    return (
      <div
        key={`${type}-${item.id}`}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleResultClick(item, type)}
      >
        <div className={`p-2 rounded-lg bg-gray-100`}>
          <Icon className={`h-4 w-4 ${colorClass} flex-shrink-0`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            <SearchHighlight text={getMainText()} searchTerm={searchQuery} />
          </div>
          <div className="text-sm text-gray-500 truncate mt-1">
            <SearchHighlight text={getSubText()} searchTerm={searchQuery} />
          </div>
          {type === 'products' && item.quantity !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.quantity > (item.reorderLevel || 0) 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                Stock: {item.quantity || 0}
              </span>
              {item.quantity <= (item.reorderLevel || 0) && (
                <span className="text-xs text-red-600">Low Stock</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getFilteredResults = () => {
    if (selectedFilter === 'all') {
      return searchResults;
    }
    
    return {
      products: selectedFilter === 'products' ? searchResults.products : [],
      orders: selectedFilter === 'orders' ? searchResults.orders : [],
      suppliers: selectedFilter === 'suppliers' ? searchResults.suppliers : [],
      categories: selectedFilter === 'categories' ? searchResults.categories : [],
      users: selectedFilter === 'users' ? searchResults.users : []
    };
  };

  const renderSection = (items, type, title) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="py-2">
        <div className="px-3 py-2">
          <h3 className="text-sm font-semibold text-gray-700 capitalize">{title}</h3>
        </div>
        <div className="space-y-1">
          {items.slice(0, 5).map(item => renderResultItem(item, type))}
        </div>
      </div>
    );
  };

  if (!showResults) return null;

  const filteredResults = getFilteredResults();
  const hasResults = Object.values(filteredResults).some(results => results && results.length > 0);

  return (
    <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 max-h-96 overflow-hidden ${className}`}>
      {/* Sticky Filter Buttons */}
      {searchQuery && (
        <div className="sticky top-0 bg-white p-3 border-b border-gray-100 z-10 rounded-t-2xl">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterClick(key)}
                className={`flex items-center gap-1 text-xs px-3 py-1 h-7 ${
                  selectedFilter === key 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto max-h-80">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        ) : hasResults ? (
          <div className="py-2">
            {renderSection(filteredResults.products, 'products', 'Products')}
            {renderSection(filteredResults.orders, 'orders', 'Orders')}
            {renderSection(filteredResults.suppliers, 'suppliers', 'Suppliers')}
            {renderSection(filteredResults.categories, 'categories', 'Categories')}
            {renderSection(filteredResults.users, 'users', 'Users')}
          </div>
        ) : searchQuery ? (
          <div className="py-8 px-4 text-center">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
            <p className="text-gray-400 text-xs mt-1">Try different keywords or check spelling</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchResults;