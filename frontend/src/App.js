import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JapaCounter from './components/JapaCounter'; 
import Family from './components/Family';
import Profile from './components/Profile'; 
import Scriptures from './components/Scriptures'; 
import Tasks from './components/Tasks'; // 1. Tasks को इम्पोर्ट करें
import Medicines from './components/Medicines'; // 2. Medicines को इम्पोर्ट करें

function App() {
  const { token, login } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Route: Login */}
          {!token ? (
            <>
              <Route path="/login" element={<Login setToken={login} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* Protected Routes: All pages inside MainLayout */
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/japa" element={<JapaCounter />} />
              <Route path="/family" element={<Family />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/scriptures" element={<Scriptures />} /> 
              
              {/* 3. नए रूट जोड़ें */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/medicines" element={<Medicines />} />

              {/* Redirect to dashboard if logged in */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;