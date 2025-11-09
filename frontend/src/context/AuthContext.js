import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext();

// Create the "Provider" component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 1. फ़ॉन्ट साइज़ के लिए नया स्टेट
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'font-large'); // 'font-large' डिफ़ॉल्ट है

  useEffect(() => {
    // 2. जब ऐप लोड हो, तो बॉडी पर फ़ॉन्ट क्लास लगाएँ
    document.body.className = fontSize;
  }, [fontSize]);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          const response = await api.get('/user/profile');
          setUser(response.data.user);
          
          // 3. उपयोगकर्ता की सेव की गई फ़ॉन्ट प्राथमिकता लोड करें
          if (response.data.user.font_size) {
            setFontSize(response.data.user.font_size);
            localStorage.setItem('fontSize', response.data.user.font_size);
            document.body.className = response.data.user.font_size;
          }

        } catch (error) {
          console.error('Failed to fetch user', error);
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
    if (newUser) {
      setUser(newUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fontSize'); // लॉगआउट पर फ़ॉन्ट रीसेट करें
    setToken(null);
    setUser(null);
    setFontSize('font-large'); // डिफ़ॉल्ट पर रीसेट करें
    document.body.className = 'font-large';
    delete api.defaults.headers.Authorization;
  };
  
  // 4. फ़ॉन्ट बदलने के लिए एक फ़ंक्शन
  const changeFontSize = async (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.body.className = size;
    try {
      // डेटाबेस में सेव करें ताकि यह याद रहे
      await api.put('/user/preferences', { font_size: size });
    } catch (error) {
      console.error('Failed to save font size', error);
    }
  };

  return (
    // 5. Context में फ़ॉन्ट-साइज़ और उसे बदलने का फ़ंक्शन दें
    <AuthContext.Provider value={{ token, user, login, logout, loading, fontSize, changeFontSize }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a simple "hook" to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};