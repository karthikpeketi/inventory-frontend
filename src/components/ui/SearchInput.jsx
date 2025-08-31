import { useState, useEffect, useCallback, memo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input.jsx';

/**
 * A reusable search input component with built-in debouncing and optional throttling
 * This component is memoized to prevent unnecessary re-renders
 * 
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {function} props.onSearch - Callback function that receives the debounced search value
 * @param {number} props.delay - Debounce delay in milliseconds (default: 300)
 * @param {string} props.className - Additional CSS classes for the input
 * @param {string} props.initialValue - Initial search value
 * @param {boolean} props.useThrottling - Whether to use throttling instead of debouncing (default: false)
 * @returns {JSX.Element} Search input component with debouncing or throttling
 */
const SearchInput = ({ 
  placeholder = "Search...", 
  onSearch, 
  delay = 300, 
  className = "",
  initialValue = "",
  useThrottling = false
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [lastCallTime, setLastCallTime] = useState(0);
  
  // Update input value when initialValue prop changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);
  
  // Create debounced/throttled search function
  const processSearch = useCallback(
    (value) => {
      if (useThrottling) {
        // Throttling implementation
        const now = Date.now();
        if (now - lastCallTime >= delay) {
          onSearch(value);
          setLastCallTime(now);
          // Return undefined (no cleanup needed)
        } else {
          const remainingTime = delay - (now - lastCallTime);
          const handler = setTimeout(() => {
            onSearch(value);
            setLastCallTime(Date.now());
          }, remainingTime);
          
          return () => clearTimeout(handler);
        }
      } else {
        // Debouncing implementation
        const handler = setTimeout(() => {
          onSearch(value);
        }, delay);
        
        return () => clearTimeout(handler);
      }
    },
    [delay, onSearch, lastCallTime, useThrottling]
  );
  
  // Apply debouncing/throttling effect
  useEffect(() => {
    // Process the search and get the cleanup function if any
    const cleanupFn = processSearch(inputValue);
    // Only return the cleanup function if it exists
    if (cleanupFn) {
      return cleanupFn;
    }
    // Otherwise return undefined (implicit)
  }, [inputValue, processSearch]);
  
  // Handle input change
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
  };
  
  return (
    <div 
      className="relative flex-grow"
    >
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        className={`pl-12 pr-10 w-full bg-gray-50/80 border-gray-200 focus:bg-white focus:border-primary hover:border-gray-300 ${className}`}
        value={inputValue}
        onChange={handleChange}
      />
      {inputValue && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleClear}
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(SearchInput);