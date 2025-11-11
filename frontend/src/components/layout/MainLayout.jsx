import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext'; // Use Translation
import './MainLayout.css'; // Ensure this exists (can be empty or just basic styles)

const MainLayout = () => {
  const { user } = useAuth();
  const { t } = useLanguage(); // Hook for translations

  return (
    <div className="main-layout">
      {/* Sidebar for Desktop */}
      <Sidebar />

      <div className="content-wrapper">
        {/* Mobile Header */}
        <header className="mobile-header">
          <h3>{t('greeting')}, {user ? user.name : 'Bhakta'}!</h3>
        </header>
        
        <main className="page-container">
          <Outlet />
        </main>

        {/* Bottom Nav for Mobile */}
        <div className="mobile-nav-wrapper">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;