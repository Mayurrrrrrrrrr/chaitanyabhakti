import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleCollapse = () => setCollapsed(!collapsed);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Mobile Header */}
        <header className="md:hidden bg-gradient-to-r from-green-500 via-blue-500 to-yellow-500 border-b border-white/20 px-4 py-3 flex items-center justify-between z-30 shadow-lg">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo192.png" alt="Logo" className="w-8 h-8 drop-shadow-lg" />
            <h1 className="font-heading text-xl font-bold text-white">Chaitanya Bhakti</h1>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;