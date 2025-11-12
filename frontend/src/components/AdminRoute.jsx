import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth(); //
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Shows a loading message
  }

  // Check if user exists AND has the 'admin' role
  if (user && user.role === 'admin') { //
    return children; // This will render your <AdminPanel />
  }

  // If not an admin, redirect to the login page
  return <Navigate to="/login" state={{ from: location }} replace />; //
};

export default AdminRoute;