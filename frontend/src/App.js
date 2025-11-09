import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // <-- CORRECTED PATH
import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JapaCounter from './components/JapaCounter'; 

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
              {/* <Route path="/family" element={<div>Family Page</div>} /> */}
              {/* <Route path="/profile" element={<div>Profile Page</div>} /> */}
              
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