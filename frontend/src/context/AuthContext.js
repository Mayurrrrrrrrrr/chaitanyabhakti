import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext();

// Create the "Provider" component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Set token in api headers for this request
          api.defaults.headers.Authorization = `Bearer ${token}`;
          // Fetch user profile
          const response = await api.get('/user/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user', error);
          // Token is invalid, log out
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
    
    // If user object comes from login, use it.
    if (newUser) {
      setUser(newUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a simple "hook" to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};