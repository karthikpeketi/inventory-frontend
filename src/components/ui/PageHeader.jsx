import { cn } from '../../lib/utils';

const PageHeader = ({ title, description, icon, iconBgColor, iconColor }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className={cn("p-3 rounded-2xl", iconBgColor)}>
        <div className={cn("h-6 w-6", iconColor)}>
          {icon}
        </div>
      </div>
      <div className="flex flex-col w-max">
        <h1 className="text-3xl font-bold font-display text-gray-900">{title}</h1>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  );
};

export default PageHeader;
