import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Tag, User, Package } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useSearch } from '../../context/SearchContext';

const SearchFilters = ({ onFiltersChange, onClose }) => {
  const { searchFilters } = useSearch();
  const [filters, setFilters] = useState(searchFilters);

  // Update local state when context filters change
  useEffect(() => {
    setFilters(searchFilters);
  }, [searchFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Clear incompatible filters when entity type changes
    if (key === 'entityType') {
      if (value === 'products') {
        newFilters.dateRange = '';
        newFilters.status = '';
      } else if (value === 'orders') {
        newFilters.priceRange = { min: '', max: '' };
        newFilters.stockLevel = '';
      } else if (value === 'categories' || value === 'users' || value === 'suppliers') {
        newFilters.dateRange = '';
        newFilters.status = '';
        newFilters.priceRange = { min: '', max: '' };
        newFilters.stockLevel = '';
      } else if (value === 'all') {
        // Clear all filters when "all" is selected
        newFilters.dateRange = '';
        newFilters.status = '';
        newFilters.priceRange = { min: '', max: '' };
        newFilters.stockLevel = '';
      }
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      entityType: 'all',
      dateRange: '',
      status: '',
      category: '',
      priceRange: { min: '', max: '' },
      stockLevel: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Get available filters based on entity type
  const getAvailableFilters = () => {
    switch (filters.entityType) {
      case 'products':
        return ['stockLevel', 'priceRange'];
      case 'orders':
        return ['dateRange', 'status'];
      case 'categories':
      case 'users':
      case 'suppliers':
        return [];
      case 'all':
        return []; // No filters for "all" - treat as no filter applied
      default:
        return ['dateRange', 'status', 'priceRange', 'stockLevel'];
    }
  };

  const availableFilters = getAvailableFilters();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Search Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Entity Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search In
          </label>
          <Select value={filters.entityType} onValueChange={(value) => handleFilterChange('entityType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="suppliers">Suppliers</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter - Only for orders */}
        {availableFilters.includes('dateRange') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter - Only for orders with order-specific options */}
        {availableFilters.includes('status') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range Filter - For products */}
        {availableFilters.includes('priceRange') && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                className="flex-1 h-10"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                className="flex-1 h-10"
              />
            </div>
          </div>
        )}

        {/* Stock Level Filter - For products */}
        {availableFilters.includes('stockLevel') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Level
            </label>
            <Select value={filters.stockLevel} onValueChange={(value) => handleFilterChange('stockLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any level</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="in">In Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          onClick={clearFilters}
          size="sm"
          className="px-4 py-2 text-sm"
        >
          Clear All
        </Button>
        <div className="text-sm text-gray-500">
          {Object.values(filters).filter(v => v && v !== 'all' && !(typeof v === 'object' && Object.values(v).every(val => val === ''))).length} filters applied
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;