import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
/**
 * Checks if a date string or object is valid
 * 
 * @param {string|Date} dateInput - The date to check
 * @returns {boolean} - True if the date is valid, false otherwise
 */
export function isValidDate(dateInput) {
  if (!dateInput) return false;
  
  try {
    // If dateInput is already a Date object
    if (dateInput instanceof Date) {
      return !isNaN(dateInput.getTime());
    }
    
    // If dateInput is a string, try to parse it
    if (typeof dateInput === 'string') {
      // Check if the date is in ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
        const date = new Date(dateInput);
        return !isNaN(date.getTime());
      } 
      // Check if the date is in MM/DD/YYYY format
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateInput)) {
        const [month, day, year] = dateInput.split('/');
        const date = new Date(year, month - 1, day);
        return !isNaN(date.getTime());
      }
      // Check if the date is in DD-MM-YYYY format
      else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateInput)) {
        const [day, month, year] = dateInput.split('-');
        const date = new Date(year, month - 1, day);
        return !isNaN(date.getTime());
      }
      // Try standard parsing as fallback
      else {
        const date = new Date(dateInput);
        return !isNaN(date.getTime());
      }
    }
    
    return false;
  } catch (e) {
    console.error(`Error checking date validity: ${dateInput}`, e);
    return false;
  }
}

/**
 * Parses a date string into a Date object
 * Handles various input formats and returns a Date object if valid
 * 
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} - The parsed Date object or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Check if the date is in DD-MM-YYYY format
    if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try to parse the date string using standard methods
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

/**
 * Formats a date string into a consistent, readable format
 * Handles various input formats and returns a formatted date string
 * 
 * @param {string|Date} dateInput - The date to format (string or Date object)
 * @param {string} [format='MM/DD/YYYY'] - The format to use ('MM/DD/YYYY', 'YYYY-MM-DD', or 'DD-MM-YYYY')
 * @returns {string} - The formatted date string or empty string if invalid
 */
export function formatDate(dateInput, format = 'MM/DD/YYYY') {
  if (!dateInput) return '';
  
  try {
    // If dateInput is already a Date object
    let date = dateInput instanceof Date ? dateInput : null;
    
    // If dateInput is a string, try to parse it
    if (typeof dateInput === 'string') {
      // Check if the date is in ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
        date = new Date(dateInput);
      } 
      // Check if the date is in MM/DD/YYYY format
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateInput)) {
        const [month, day, year] = dateInput.split('/');
        date = new Date(year, month - 1, day);
      }
      // Check if the date is in DD-MM-YYYY format
      else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateInput)) {
        const [day, month, year] = dateInput.split('-');
        date = new Date(year, month - 1, day);
      }
      // Try standard parsing as fallback
      else {
        date = new Date(dateInput);
      }
    }
    
    // Check if date is valid
    if (!date || isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateInput}`);
      return typeof dateInput === 'string' ? dateInput : '';
    }
    
    // Format based on requested format
    if (format === 'YYYY-MM-DD') {
      return date.toISOString().split('T')[0];
    } else if (format === 'DD-MM-YYYY') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } else {
      // Default: MM/DD/YYYY
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    }
  } catch (e) {
    console.error(`Error formatting date: ${dateInput}`, e);
    return typeof dateInput === 'string' ? dateInput : '';
  }
}
