import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ✅ --- IMPORT THE LANGUAGE PROVIDER ---
import { LanguageProvider } from './context/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ --- WRAP YOUR APP WITH THE PROVIDER --- */}
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
