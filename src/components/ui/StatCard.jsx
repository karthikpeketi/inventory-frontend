import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, change, className, iconBgColor = "bg-blue-100", iconColor = "text-blue-600" }) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl p-6 flex items-center justify-between transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div 
            className={`flex items-center gap-1 text-sm font-medium ${change.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {change.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{change.value}</span>
            <span className="text-gray-400 text-xs">vs last month</span>
          </div>
        )}
      </div>
      <div 
        className={cn(
          "rounded-full p-4 transition-all duration-300",
          iconBgColor
        )}
      >
        <div className={cn("h-6 w-6", iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
