import { useCallback, memo } from 'react';
import SearchInput from './SearchInput';

/**
 * A container component that isolates search state and logic from parent components
 * to prevent unnecessary re-renders of the entire parent component.
 * 
 * This component maintains its own internal state for the search input value
 * and only calls the parent's onSearch callback when the debounced/throttled value changes.
 * 
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {function} props.onSearch - Callback function that receives the search value
 * @param {number} props.delay - Debounce/throttle delay in milliseconds (default: 300)
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.initialValue - Initial search value
 * @param {boolean} props.useThrottling - Whether to use throttling instead of debouncing
 * @returns {JSX.Element} Search container component
 */
const SearchContainer = ({
  placeholder = "Search...",
  onSearch,
  delay = 300,
  className = "",
  initialValue = "",
  useThrottling = false
}) => {
  // Handle search changes
  const handleSearch = useCallback((value) => {
    // setHasSearched(true);
    onSearch(value);
  }, [onSearch]);
  
  return (
    <div className={className}>
      <SearchInput
        placeholder={placeholder}
        onSearch={handleSearch}
        delay={delay}
        initialValue={initialValue}
        useThrottling={useThrottling}
      />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(SearchContainer);