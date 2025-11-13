import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth(); //
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Shows a loading message
  }

  if (user && (user.is_super_admin === 1 || user.is_super_admin === true)) {
    return children; // This will render your <AdminPanel />
  }

  // If not an admin, redirect to the login page
  return <Navigate to="/login" state={{ from: location }} replace />; //
};

export default AdminRoute;