// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; //

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading

  // This effect runs only ONCE when the app loads
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          // If we have a token and user, set them in our state
          const parsedUser = JSON.parse(storedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to load auth state from localStorage", error);
        // Clear bad data if it exists
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        // We are done loading, whether we found a user or not
        setLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []); // Empty array means this runs only once

  // Login function
  const login = (data) => {
    try {
      const { token, user } = data;
      if (!token || !user) {
        console.error('Login data is invalid:', data);
        return; 
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // These state updates will cause components to re-render
      setUser(user);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error("Failed to process login data", error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    
    // These state updates will cause components to re-render
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};