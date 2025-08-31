import { cn } from '../../lib/utils';

const baseClasses =
  "inline-flex items-center px-6 py-3 font-medium rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none relative overflow-hidden";

const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-2";

const variantClasses = {
  primary:
    "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-glow focus:ring-primary/50 shadow-soft",
  secondary:
    "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-400 shadow-soft",
  danger:
    "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-glow-coral focus:ring-red-400 shadow-soft",
  outline:
    "border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-300 shadow-soft",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
};

const Button = ({
  variant = "primary",
  className = "",
  type = "button",
  children,
  disableOutline = false,
  size = "default",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
    icon: "p-2 w-10 h-10",
  };

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant] || "",
        sizeClasses[size],
        !disableOutline && focusClasses,
        className
      )}
      {...props}
    >
      <div
        className="flex items-center justify-center gap-2"
      >
        {children}
      </div>
    </button>
  );
};

export { Button };
