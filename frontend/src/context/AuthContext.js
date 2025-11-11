//
// FILE: frontend/src/context/AuthContext.js
//
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // 🛑 FIX: Correctly import jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch full user profile to get all data (including preferences)
            const res = await api.get('/user/profile');
            setUser(res.data.user); 
          }
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (mobile_number, otp, name, spiritual_name) => {
    // This function will be called by Login.jsx
    // It handles the API call and sets the user state
    try {
      const res = await api.post('/auth/verify-otp', {
        mobile_number,
        otp,
        name,
        spiritual_name
      });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        // The response from verify-otp already includes the user object
        setUser(res.data.user); 
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // This function allows other components (like Profile.jsx) to update the user context
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};