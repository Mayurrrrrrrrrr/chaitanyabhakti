// frontend/src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // ✅ IMPORT Outlet
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useEffect, useRef, useState } from 'react';
import './MainLayout.css';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
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
  return (
    <div className="main-layout">
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <div className="content-wrapper">
        <div className="main-content">
          <Outlet />
        </div>
        <div className="mobile-nav-wrapper">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;