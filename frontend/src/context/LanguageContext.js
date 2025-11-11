import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to Hindi ('hi') if nothing saved
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'hi');

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    // Update the html lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  // Function to get translated text
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);