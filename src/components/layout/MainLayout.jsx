import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { SearchProvider } from '../../context/SearchContext';

const MainLayout = () => {
  const location = useLocation();

  // Responsive sidebar collapse (desktop), mobile overlay state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    // Ensure mobile sidebar closes on nav
    setSidebarMobileOpen(false);
  }, [location.pathname]);

  // Adjust right pane width based on sidebar state
  const mainMargin = sidebarCollapsed
    ? 'md:ml-16'
    : 'md:ml-64';

  return (
    <SearchProvider>
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-50">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={setSidebarMobileOpen}
        />

        {/* Main panel with responsive margin */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${mainMargin}`}>
          {/* Header */}
          <Header onMenuClick={() => setSidebarMobileOpen(true)} />
          {/* Scrollable Main */}
          <main className="flex-1 px-4 md:px-6 pt-4 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
};

export default MainLayout;