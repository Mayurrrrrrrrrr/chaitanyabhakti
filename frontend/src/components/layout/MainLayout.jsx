// frontend/src/components/layout/MainLayout.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './MainLayout.css';
import { FiMenu } from 'react-icons/fi'; // Assuming react-icons is installed

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

  // Idle timer logic (kept from your original code)
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

  // Helper to get page title based on path (Simple version)
  const getPageTitle = () => {
    const path = pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="main-layout">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content Area */}
      <div className={`content-wrapper ${collapsed ? 'expanded' : ''}`}>

        {/* Mobile Header (Visible only on mobile) */}
        <header className="mobile-header">
          <div className="mobile-logo-area">
            {/* You can add a small logo here */}
            <h3 className="app-title">{getPageTitle()}</h3>
          </div>
          <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
            {/* Could be used for a slide-out drawer or notifications */}
            <FiMenu size={24} color="var(--text-color)" />
          </button>
        </header>

        {/* Main Page Content */}
        <main className="main-content">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default MainLayout;