// frontend/src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; //

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuth(); //

  if (loading) {
    // Wait until authentication status is loaded
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.is_super_admin) {
    // Logged in, but NOT an admin. Redirect to dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in AND is an admin, show the nested route (AdminPanel, etc.)
  return <Outlet />;
};

export default AdminRoute;