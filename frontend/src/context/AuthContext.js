// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react'; // ✅ --- ADD useContext HERE
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use useCallback to prevent function recreation on every render
  const loadUser = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    setLoading(false);
  }, []); // Empty dependency array - function never changes

  // Run only once on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅✅✅ --- THIS IS THE FIX --- ✅✅✅
// You must export the useAuth hook so your components can import it.
export const useAuth = () => {
  return useContext(AuthContext);
};