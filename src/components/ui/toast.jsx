import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start space-x-4 overflow-hidden rounded-2xl border p-4 pr-8 shadow-soft-lg backdrop-blur-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white/95 text-gray-900",
        success: "border-green-200 bg-green-50/95 text-green-900",
        error: "border-red-200 bg-red-50/95 text-red-900",
        destructive: "border-red-200 bg-red-50/95 text-red-900", // Alias for error to match current usage
        warning: "border-amber-200 bg-amber-50/95 text-amber-900",
        info: "border-blue-200 bg-blue-50/95 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Helper component for toast icons using Lucide React icons
const ToastIcon = ({ variant }) => {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    destructive: <XCircle className="h-5 w-5 text-red-500" />, // Alias for error
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return variant in iconMap ? (
    <div className="flex-shrink-0 pt-0.5">
      {iconMap[variant]}
    </div>
  ) : null;
};

const Toast = React.forwardRef(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const hasCustomContent = React.Children.count(children) > 0;
    
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className, 'relative')}
        {...props}
      >
        {!hasCustomContent && variant !== 'default' && <ToastIcon variant={variant} />}
        <div className="flex-1">
          {children || (
            <>
              <ToastTitle>Notification</ToastTitle>
              <ToastDescription>Operation completed successfully</ToastDescription>
            </>
          )}
        </div>
        <ToastClose />
      </ToastPrimitives.Root>
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        className
      )}
      {...props}
    />
  )
);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-full p-1 text-gray-400 opacity-0 transition-all hover:text-gray-600 hover:bg-gray-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:opacity-100",
        // Success variant styles
        "data-[variant=success]:text-green-400 data-[variant=success]:hover:text-green-600 data-[variant=success]:hover:bg-green-50",
        // Error/Destructive variant styles
        "data-[variant=error]:text-red-400 data-[variant=error]:hover:text-red-600 data-[variant=error]:hover:bg-red-50",
        "data-[variant=destructive]:text-red-400 data-[variant=destructive]:hover:text-red-600 data-[variant=destructive]:hover:bg-red-50",
        // Warning variant styles
        "data-[variant=warning]:text-amber-400 data-[variant=warning]:hover:text-amber-600 data-[variant=warning]:hover:bg-amber-50",
        // Info variant styles
        "data-[variant=info]:text-blue-400 data-[variant=info]:hover:text-blue-600 data-[variant=info]:hover:bg-blue-50",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Title
      ref={ref}
      className={cn("text-sm font-semibold font-display", className)}
      {...props}
    />
  )
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Description
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  )
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// Reusable toast utility functions for common patterns
export const toastUtils = {
  // Success toasts
  success: (toast, title, description) => {
    toast({
      title,
      description,
      variant: "success",
    });
  },

  // Error/Failure toasts (using destructive to match current usage)
  error: (toast, title, description) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  },

  // Warning toasts
  warning: (toast, title, description) => {
    toast({
      title,
      description,
      variant: "warning",
    });
  },

  // Info toasts
  info: (toast, title, description) => {
    toast({
      title,
      description,
      variant: "info",
    });
  },

  // Common application-specific toast patterns
  patterns: {
    // Authentication related toasts
    auth: {
      loginSuccess: (toast) => toastUtils.success(toast, "Login successful", "Welcome back to Inventory360!"),
      loginFailed: (toast, message = "Invalid credentials") => toastUtils.error(toast, "Login failed", message),
      registerSuccess: (toast, message = "User registered successfully") => toastUtils.success(toast, "Registration successful", message),
      registerFailed: (toast, message = "Something went wrong") => toastUtils.error(toast, "Registration failed", message),
      logoutSuccess: (toast) => toastUtils.success(toast, "Logged out", "You have been successfully logged out."),
      logoutFailed: (toast, message = "Something went wrong during logout") => toastUtils.error(toast, "Logout failed", message),
      passwordResetSent: (toast) => toastUtils.success(toast, "Password reset email sent", "Please check your email for reset instructions."),
      passwordResetFailed: (toast, message = "Something went wrong") => toastUtils.error(toast, "Request failed", message),
      passwordResetSuccess: (toast) => toastUtils.success(toast, "Password reset successful", "You can now log in with your new password."),
      profileUpdated: (toast) => toastUtils.success(toast, "Profile updated", "Your profile has been updated successfully"),
      profileUpdateFailed: (toast, message = "Failed to update profile") => toastUtils.error(toast, "Update failed", message),
      otpSent: (toast, message = "OTP has been sent successfully. check your email") => toastUtils.info(toast, "OTP Sent", message),
      otpSendFailed: (toast, message) => toastUtils.error(toast, "OTP Error", message),
      otpVerified: (toast, message) => toastUtils.success(toast, "OTP Verified", message),
      otpInvalid: (toast) => toastUtils.error(toast, "Invalid OTP", "The OTP you entered is incorrect."),
      otpVerifyFailed: (toast) => toastUtils.error(toast, "OTP Verification Failed", "Could not verify OTP."),
      passwordChangeSuccess: (toast) => toastUtils.success(toast, "Password Changed", "Your password has been updated successfully."),
      passwordChangeFailed: (toast, message) => toastUtils.error(toast, "Password Change Failed", message),
      userNotAvailable: (toast) => toastUtils.error(toast, "User Error", "User information is not available."),
    },

    // CRUD operations
    crud: {
      // Generic CRUD patterns
      createSuccess: (toast, itemName) => toastUtils.success(toast, `${itemName} Added`, `${itemName} has been added successfully.`),
      createFailed: (toast, itemName, message = "An error occurred") => toastUtils.error(toast, `Failed to add ${itemName.toLowerCase()}`, message),
      updateSuccess: (toast, itemName) => toastUtils.success(toast, `${itemName} Updated`, `${itemName} has been updated successfully.`),
      updateFailed: (toast, itemName, message = "An error occurred") => toastUtils.error(toast, `Failed to update ${itemName.toLowerCase()}`, message),
      deleteSuccess: (toast, itemName) => toastUtils.success(toast, `${itemName} Deleted`, `${itemName} has been deleted successfully.`),
      deleteFailed: (toast, itemName, message = "Unable to delete") => toastUtils.error(toast, "Deletion Failed", `${message} ${itemName.toLowerCase()}.`),
      loadFailed: (toast, itemName, message = "An error occurred") => toastUtils.error(toast, `Failed to load ${itemName.toLowerCase()}`, message),

      // Specific entity patterns
      supplier: {
        loadFailed: (toast, message) => toastUtils.error(toast, "Supplier Error", message),
        deleteFailed: (toast, message) => toastUtils.error(toast, "Delete Failed", message),
      },
      category: {
        added: (toast, categoryName) => toastUtils.success(toast, "Category Added", `${categoryName} has been added successfully.`),
        updated: (toast, categoryName) => toastUtils.success(toast, "Category Updated", `${categoryName} has been updated successfully.`),
        deleted: (toast, categoryName) => toastUtils.success(toast, "Category Deleted", `${categoryName} has been deleted successfully.`),
        addFailed: (toast, message = "An error occurred while adding the category.") => toastUtils.error(toast, "Failed to add category", message),
        updateFailed: (toast, message = "An error occurred while updating the category.") => toastUtils.error(toast, "Failed to update category", message),
        deleteFailed: (toast, message = "Unable to delete category.") => toastUtils.error(toast, "Deletion Failed", message),
        loadFailed: (toast, message = "An error occurred while fetching categories.") => toastUtils.error(toast, "Failed to load categories", message),
      },

      product: {
        sold: (toast, quantity, productName) => toastUtils.success(toast, "Success", `Sold ${quantity} units of ${productName}`),
        sellFailed: (toast) => toastUtils.error(toast, "Error", "Failed to sell product"),
        invalidQuantity: (toast) => toastUtils.error(toast, "Warning", "Please enter a valid quantity"),
        markedInactive: (toast) => toastUtils.success(toast, "Success", "Product marked as inactive successfully"),
        markInactiveFailed: (toast) => toastUtils.error(toast, "Error", "Failed to mark product as inactive"),
        loadFailed: (toast) => toastUtils.error(toast, "Error", "Failed to fetch products"),
      },

      user: {
        loadFailed: (toast, message = "Unknown error") => toastUtils.error(toast, "Error", `Failed to load users: ${message}`),
        actionFailed: (toast, message = "Something went wrong") => toastUtils.error(toast, "Error", message),
        cannotDeleteAdmin: (toast) => toastUtils.error(toast, "Error", "Administrator users cannot be deleted"),
        alreadyInactive: (toast) => toastUtils.error(toast, "Error", "User is already inactive"),
      },
    },

    // Export related toasts
    export: {
      success: (toast, message = "Export completed successfully") => toastUtils.success(toast, "Export Successful", message),
      failed: (toast, message = "An unexpected error occurred") => toastUtils.error(toast, "Export Failed", message),
    },

    // Dashboard related toasts
    dashboard: {
      loadOrdersFailed: (toast) => toastUtils.error(toast, "Error", "Failed to fetch recent orders"),
      loadStockFailed: (toast) => toastUtils.error(toast, "Error", "Failed to fetch low stock items"),
      loadReportFailed: (toast) => toastUtils.error(toast, "Error", "Failed to load report data. Please try again."),
    },
    reports: {
      loadFailed: (toast) => toastUtils.error(toast, "Report Error", "Failed to load report data."),
    },
    validation: {
      quantityInvalid: (toast) => toastUtils.warning(toast, "Invalid Quantity", "Please enter a valid quantity."),
      integerRequired: (toast, field) => toastUtils.warning(toast, "Invalid Input", `${field} must be a valid number.`),
      numberRequired: (toast, field) => toastUtils.warning(toast, "Invalid Input", `${field} must be a valid number.`),
      costPriceTooHigh: (toast) => toastUtils.warning(toast, "Invalid Price", "Cost price cannot be higher than unit price."),
    },
  },
};

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
