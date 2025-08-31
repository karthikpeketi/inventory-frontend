import { Download } from 'lucide-react';
import { Button } from './button';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast, toastUtils } from './use-toast';

/**
 * Reusable Export Button component for exporting data to Excel
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to export
 * @param {Function} props.formatData - Function to format data for export
 * @param {Array} props.columnWidths - Column widths for Excel
 * @param {string} props.sheetName - Name of the Excel sheet
 * @param {string} props.fileName - Base name for the exported file
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 * @param {string} props.label - Button label
 * @param {Function} props.onExportStart - Callback before export starts
 * @param {Function} props.onExportComplete - Callback after export completes
 */
const ExportButton = ({
  data = [],
  formatData,
  columnWidths = [],
  sheetName = 'Sheet1',
  fileName,
  variant = 'outline',
  size = 'sm',
  label = 'Export',
  onExportStart,
  onExportComplete,
  ...props
}) => {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      // Call the onExportStart callback if provided
      if (typeof onExportStart === 'function') {
        onExportStart();
      }

      // Format data if a formatter function is provided
      const exportData = typeof formatData === 'function' 
        ? formatData(data)
        : data;

      // Use the utility function to export data
      const result = exportToExcel(
        exportData,
        columnWidths,
        sheetName,
        fileName || sheetName
      );

      // Show toast notification based on result
      if (result.success) {
        toastUtils.patterns.export.success(toast, result.message);
      } else {
        toastUtils.patterns.export.failed(toast, result.message);
      }

      // Call the onExportComplete callback if provided
      if (typeof onExportComplete === 'function') {
        onExportComplete(result);
      }
    } catch (error) {
      console.error('Error in ExportButton:', error);
      toastUtils.patterns.export.failed(toast, error.message || 'An unexpected error occurred');

      // Call the onExportComplete callback with error if provided
      if (typeof onExportComplete === 'function') {
        onExportComplete({ success: false, error });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={!data || data.length === 0}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default ExportButton;