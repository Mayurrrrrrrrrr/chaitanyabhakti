import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext'; // <-- CORRECTED PATH

const MainLayout = () => {
  const { user } = useAuth();

  return (
    <div>
      <header className="app-header">
        Hare Krishna, {user ? user.name : 'Bhakta'}!
      </header>
      
      <main className="page-container">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;