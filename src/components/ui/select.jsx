import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the selected option text
  const getSelectedText = () => {
    let selectedText = '';
    React.Children.forEach(children, child => {
      if (child.type === SelectContent) {
        React.Children.forEach(child.props.children, item => {
          if (item.type === SelectItem && item.props.value === value) {
            selectedText = item.props.children;
          }
        });
      }
    });
    return selectedText;
  };

  const handleSelect = (selectedValue) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
            selectedText: getSelectedText()
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onSelect: handleSelect,
            selectedValue: value
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, onClick, isOpen, selectedText, className = '', ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (child.type === SelectValue) {
          return React.cloneElement(child, { selectedText });
        }
        return child;
      })}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SelectValue = ({ placeholder, children, selectedText }) => {
  return (
    <span className="block truncate">
      {selectedText || children || <span className="text-gray-500">{placeholder}</span>}
    </span>
  );
};

const SelectContent = ({ children, isOpen, onSelect, selectedValue, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${className}`}>
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, {
            onSelect,
            isSelected: child.props.value === selectedValue
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectItem = ({ children, value, onSelect, isSelected, className = '' }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(value);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${className}`}
    >
      <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
        {children}
      </span>
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };