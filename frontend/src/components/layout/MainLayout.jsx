import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();

  return (
    <div>
      <header className="app-header">
        {/* यहाँ सुंदर "जय श्री कृष्ण" जोड़ें */}
        जय श्री कृष्ण, {user ? user.name : 'भक्त'}!
      </header>
      
      <main className="page-container">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;