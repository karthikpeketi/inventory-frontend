/**
 * Constants for navigation and menu items
 */
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  PieChart,
  Truck,
  Tags,
} from 'lucide-react';

// Main navigation items
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Box },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/reports', label: 'Reports', icon: PieChart },

];

// User management item (added dynamically for admin users)
export const USER_MANAGEMENT_NAV_ITEM = { 
  path: '/user-management', 
  label: 'User Management', 
  icon: Users 
};

