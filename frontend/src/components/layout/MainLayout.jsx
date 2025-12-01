// frontend/src/components/layout/MainLayout.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { FiMenu } from 'react-icons/fi';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll to top on route change
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false); // Close mobile sidebar on route change
  }, [pathname]);

  // Idle timer logic
  const idleRef = useRef(null);
  const resetIdle = () => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      setCollapsed(true);
      localStorage.setItem('sidebarCollapsed', 'true');
    }, 30000);
  };

  useEffect(() => {
    const handler = () => resetIdle();
    window.addEventListener('mousemove', handler);
    window.addEventListener('keydown', handler);
    resetIdle();
    return () => {
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('keydown', handler);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
    resetIdle();
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const getPageTitle = () => {
    const path = pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
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
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-lg text-primary-900 capitalize">
              {getPageTitle()}
            </h3>
          </div>
          <button
            className="p-2 text-primary-900 hover:bg-slate-100 rounded-lg"
            onClick={toggleMobileSidebar}
          >
            <FiMenu size={24} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;