import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { LogOut, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useIsMobile } from '../../hooks/useMobile';
import { 
  NAV_ITEMS, 
  USER_MANAGEMENT_NAV_ITEM 
} from '../../constants/navigation';
import { 
  SIDEBAR_FULL_WIDTH, 
  SIDEBAR_COLLAPSED_WIDTH 
} from '../../constants/layout';

const Sidebar = ({ mobileOpen, onMobileClose, collapsed, setCollapsed }) => {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();
  const sidebarRef = useRef(null);
  const isMobile = useIsMobile();
  const mobileSidebarWidth = isMobile ? "w-1/2" : "w-64";


  const handleLogoClick = (event) => {
    if (location.pathname === '/dashboard') {
      event.preventDefault();
    }
  };

  // Dynamically add User Management nav item for ADMIN only
  const dynamicNavItems = [...NAV_ITEMS];
  if (isAdmin) {
    dynamicNavItems.splice(5, 0, USER_MANAGEMENT_NAV_ITEM);
  }

  // Ensure collapsed initializes as true on desktop
  useEffect(() => {
    if (!isMobile && setCollapsed) {
      setCollapsed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Handle mouse enter/leave for auto collapse (desktop)
  const handleMouseEnter = () => {
    if (!isMobile && setCollapsed) setCollapsed(false);
  };
  const handleMouseLeave = () => {
    if (!isMobile && setCollapsed) setCollapsed(true);
  };

  return (
    <>
      {/* Only ONE hamburger button, rendered in Header, so remove it here */}
      {/* Overlay for mobile sidebar */}
      {mobileOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-[99] md:hidden"
          onClick={() => onMobileClose(false)}
        />
      )}

      {/* Main sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed z-50 inset-y-0 left-0 flex flex-col transition-all duration-300 ease-in-out h-full shadow-2xl",
          "bg-gray-900 border-r border-gray-800",
          isMobile
            ? (mobileOpen ? mobileSidebarWidth : "hidden")
            : (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_FULL_WIDTH),
          "md:flex md:flex-col"
        )}
        style={{
          ...(isMobile && !mobileOpen ? { transform: 'translateX(-100%)' } : {})
        }}
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
        tabIndex={-1}
      >
        {/* Top Logo or App Name */}
        <div 
          className={cn(
            "flex items-center px-4 py-6 border-b border-gray-800",
            collapsed && !mobileOpen ? "justify-center" : "justify-between"
          )}
        >
          <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-3">
            {/* Always show Package icon */}
            <div className="p-2 bg-gray-800 rounded-2xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            {/* Show text label only when not collapsed or in mobile menu */}
            <AnimatePresence>
              {(!collapsed || (isMobile && mobileOpen)) && (
                <motion.span 
                  className="text-lg font-bold text-white font-display"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  Inventory360
                </motion.span>
              )}
            </AnimatePresence>

          </Link>
        </div>

        {/* Navigation Links */}
        <nav 
          className={cn(
            "flex-1 flex flex-col px-3 py-4",
            collapsed && !mobileOpen && "items-center"
          )}
        >
          {dynamicNavItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path || item.label || `nav-item-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-2xl py-3 my-1 transition-all duration-300 group relative overflow-hidden",
                    (collapsed && !mobileOpen) ? "justify-center px-3 mx-1" : "justify-start px-4",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <IconComponent className="h-5 w-5 z-10 flex-shrink-0" />
                    {/* Always show label in expanded or mobile sidebar when open */}
                    <AnimatePresence mode="wait">
                      {(!collapsed || (isMobile && mobileOpen)) && (
                        <motion.span 
                          className="ml-3 font-medium z-10 whitespace-nowrap"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Sticky logout at bottom */}
        <motion.div 
          className={cn(
            "py-4 px-3 sticky bottom-0 z-10 border-t border-gray-800",
            collapsed && !mobileOpen ? "flex justify-center" : ""
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            variant="danger"
            className={cn(
              "flex items-center bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all duration-300 overflow-hidden",
              collapsed && !mobileOpen ? "justify-center w-10 h-10 px-3 mx-1" : "justify-start w-full px-4 gap-3",
              "font-medium"
            )}
            onClick={logout}
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {/* Show text always in mobileOpen or uncollapsed */}
            <AnimatePresence mode="wait">
              {(!collapsed || (isMobile && mobileOpen)) && (
                <motion.span
                  className="whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </aside>
    </>
  );
};

export default Sidebar;
