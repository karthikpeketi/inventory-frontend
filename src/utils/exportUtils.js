import * as XLSX from 'xlsx';

/**
 * Exports data to Excel file
 * 
 * @param {Array} data - Array of objects to export
 * @param {Array} columnWidths - Array of column width objects { wch: number }
 * @param {string} sheetName - Name of the Excel sheet
 * @param {string} fileName - Name of the file to download (without extension)
 * @returns {Object} - Result object with success status and message
 */
export const exportToExcel = (data, columnWidths, sheetName, fileName) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      };
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths if provided
    if (columnWidths && Array.isArray(columnWidths)) {
      worksheet['!cols'] = columnWidths;
    }
    
    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
    
    // Generate file name with current date if not provided
    const fullFileName = `${fileName || sheetName || 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Write file and trigger download
    XLSX.writeFile(workbook, fullFileName);
    
    return {
      success: true,
      message: `Data exported to ${fullFileName}`,
      fileName: fullFileName
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      message: error.message || 'Failed to export data',
      error
    };
  }
};

/**
 * Format date values for Excel export
 * 
 * @param {string|Date} date - Date to format
 * @param {string} fallback - Fallback value if date is invalid
 * @param {Function} formatFn - Optional custom format function
 * @returns {string} - Formatted date string
 */
export const formatExcelDate = (date, fallback = 'N/A', formatFn) => {
  // Check if date is valid
  const isValid = date && (
    (date instanceof Date && !isNaN(date)) || 
    (typeof date === 'string' && new Date(date).toString() !== 'Invalid Date')
  );
  
  if (!isValid) {
    return fallback;
  }
  
  // Use custom format function if provided
  if (typeof formatFn === 'function') {
    return formatFn(date);
  }
  
  // Default formatting: YYYY-MM-DD
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Format currency values for Excel export
 * 
 * @param {number|string} value - Value to format as currency
 * @param {string} currency - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @param {string} fallback - Fallback value if value is invalid
 * @returns {string} - Formatted currency string
 */
export const formatExcelCurrency = (value, currency = '$', decimals = 2, fallback = '$0.00') => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return fallback;
  }
  
  return `${currency}${numValue.toFixed(decimals)}`;
};