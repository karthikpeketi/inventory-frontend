
import { cn } from '../../lib/utils';

const StatusBadge = ({ status, text, className }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200';
      case 'warning':
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200';
      case 'danger':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm',
        getStatusClasses(), 
        className
      )}
    >
      {text}
    </span>
  );
};

export default StatusBadge;
