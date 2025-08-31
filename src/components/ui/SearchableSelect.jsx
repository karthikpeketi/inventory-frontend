import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { Input } from './input';
import { cn } from '../../lib/utils';

const SearchableSelect = ({
  fetchOptions,
  onSelect,
  placeholder = 'Select an option',
  value,
  pageSize = 50,
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const loadInitialOptions = async (searchQuery = '') => {
    if (loading) return;
    
    setLoading(true);
    setInitialLoading(true);
    setPage(1);
    setHasMore(true);

    try {
      console.log(`Loading initial options: page 1, pageSize ${pageSize}, search: "${searchQuery}"`);
      const newOptions = await fetchOptions(searchQuery, 1, pageSize);
      let optionsArray = newOptions || [];
      
      // If we have a selected option and search is empty, make sure it's included
      if (!searchQuery && selectedOption && !optionsArray.some(opt => opt.id === selectedOption.id)) {
        optionsArray = [selectedOption, ...optionsArray];
      }
      
      console.log(`Loaded ${optionsArray.length} initial options`);
      setOptions(optionsArray);
      setPage(2);
      // Set hasMore to true if we got exactly pageSize items (indicating there might be more)
      setHasMore(optionsArray.length === pageSize);
      console.log(`hasMore set to: ${optionsArray.length === pageSize}`);
    } catch (error) {
      console.error('Error loading options:', error);
      setOptions(selectedOption ? [selectedOption] : []);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const loadMoreOptions = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);

    try {
      console.log(`Loading more options: page ${page}, pageSize ${pageSize}, search: "${searchTerm}"`);
      const newOptions = await fetchOptions(searchTerm, page, pageSize);
      const newOptionsArray = newOptions || [];
      console.log(`Loaded ${newOptionsArray.length} more options (total will be ${options.length + newOptionsArray.length})`);
      setOptions((prev) => [...prev, ...newOptionsArray]);
      setPage(prev => prev + 1);
      setHasMore(newOptionsArray.length === pageSize);
      console.log(`Next page will be: ${page + 1}, hasMore: ${newOptionsArray.length === pageSize}`);
    } catch (error) {
      console.error('Error loading more options:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search (reduced to 300ms for better UX)
    searchTimeoutRef.current = setTimeout(() => {
      if (isOpen) {
        // If we have a selected option and search is empty, keep it in the options
        if (!newSearchTerm && selectedOption) {
          loadInitialOptions(newSearchTerm);
          setOptions([selectedOption]);
        } else {
          loadInitialOptions(newSearchTerm);
        }
      }
    }, 300);
  };

  // Reset state when dropdown closes
  const resetState = (clearSelection = false) => {
    setSearchTerm('');
    setOptions(selectedOption ? [selectedOption] : []);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setInitialLoading(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Only clear selection if explicitly requested
    if (clearSelection && value) {
      onSelect(null);
      setSelectedOption(null);
    }
  };

  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Calculate optimal max-height based on available space
      const maxDropdownHeight = 200; // Base max height
      const padding = 20; // Safety padding from viewport edges
      
      let availableSpace, shouldOpenUpward;
      
      if (spaceBelow >= maxDropdownHeight + padding) {
        // Enough space below
        availableSpace = Math.min(maxDropdownHeight, spaceBelow - padding);
        shouldOpenUpward = false;
      } else if (spaceAbove >= maxDropdownHeight + padding) {
        // Not enough space below, but enough above
        availableSpace = Math.min(maxDropdownHeight, spaceAbove - padding);
        shouldOpenUpward = true;
      } else {
        // Limited space both above and below, use the larger space
        if (spaceBelow > spaceAbove) {
          availableSpace = Math.max(120, spaceBelow - padding); // Minimum 120px
          shouldOpenUpward = false;
        } else {
          availableSpace = Math.max(120, spaceAbove - padding); // Minimum 120px
          shouldOpenUpward = true;
        }
      }
      
      setDropdownPosition({
        top: shouldOpenUpward ? -(availableSpace + 4) : rect.height + 4,
        left: 0,
        width: rect.width,
        maxHeight: availableSpace,
        openUpward: shouldOpenUpward,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      
      // Add listeners for window resize and scroll to reposition dropdown
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true); // Use capture to catch all scroll events
      
      // Cleanup listeners when dropdown closes
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
        resetState(false); // Don't clear selection when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Check if user scrolled near the bottom (within 50px) and load more
    if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading && !initialLoading) {
      loadMoreOptions();
    }
  };

  // Handle clearing the selection
  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedOption(null);
    onSelect(null);
  };

  // Update selected option when an option is selected
  const handleSelect = (option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Update selectedOption when value changes
  useEffect(() => {
    if (value) {
      // First check if we already have this option in our current options
      const foundOption = options.find((opt) => opt.id === value);
      if (foundOption) {
        setSelectedOption(foundOption);
      } else if (!selectedOption || selectedOption.id !== value) {
        // If we have a value but can't find it in options, try to fetch it
        const fetchSelectedOption = async () => {
          try {
            const result = await fetchOptions('', 1, 1, value);
            if (result && result.length > 0 && result[0].id === value) {
              setSelectedOption(result[0]);
              // Also add it to options if not already there
              setOptions(prev => {
                const exists = prev.some(opt => opt.id === value);
                return exists ? prev : [result[0], ...prev];
              });
            }
          } catch (error) {
            console.error('Error fetching selected option:', error);
          }
        };
        fetchSelectedOption();
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, fetchOptions]);

  // Update selectedOption when options change (for when options are loaded after value is set)
  useEffect(() => {
    if (value && options.length > 0 && (!selectedOption || selectedOption.id !== value)) {
      const foundOption = options.find((opt) => opt.id === value);
      if (foundOption) {
        setSelectedOption(foundOption);
      }
    }
  }, [options, value, selectedOption]);

  return (
    <div className="relative" ref={triggerRef}>
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-inner-soft cursor-pointer"
        )}
        onClick={() => {
          if (!isOpen) {
            resetState(false);
            loadInitialOptions('');
            setIsOpen(true);
          } else {
            setIsOpen(false);
            resetState(false);
          }
        }}
      >
        <span className={cn(
          "line-clamp-1",
          !selectedOption && "text-gray-500"
        )}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute bg-white border border-gray-200 rounded-2xl shadow-soft-lg overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 1000,
          }}
        >
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-gray-50/80 border-gray-200"
            />
          </div>
          <div 
            className="overflow-y-auto searchable-select-scroll" 
            ref={scrollAreaRef}
            onScroll={handleScroll}
            style={{
              maxHeight: `${dropdownPosition.maxHeight || 200}px`
            }}
          >
            <div className="p-2 pt-0">
              {initialLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Loading options...</p>
                </div>
              ) : options.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  No options found
                </div>
              ) : (
                <>
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-xl py-2.5 px-3 text-sm outline-none hover:bg-gray-50 font-medium cursor-pointer",
                        selectedOption?.id === option.id && "bg-gray-100"
                      )}
                      onClick={() => handleSelect(option)}
                    >
                      {option.name}
                    </div>
                  ))}
                  {/* Show loading indicator when loading more items */}
                  {loading && !initialLoading && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">Loading more...</span>
                    </div>
                  )}
                  {/* Show "Load more" hint when there are more items but not currently loading */}
                  {hasMore && !loading && options.length >= pageSize && (
                    <div className="py-2 text-center">
                      <span className="text-xs text-gray-400">
                        Scroll down to load more
                      </span>
                    </div>
                  )}
                  {/* Show total count when no more items */}
                  {!hasMore && options.length > 0 && (
                    <div className="py-2 text-center">
                      <span className="text-xs text-gray-400">
                        Showing all {options.length} items
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
