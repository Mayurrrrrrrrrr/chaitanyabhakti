// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Wait until authentication status is loaded
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Logged in, show the nested route (Dashboard, etc.)
  return <Outlet />;
};

export default PrivateRoute;