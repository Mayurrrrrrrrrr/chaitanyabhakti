// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import your existing components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JapaCounter from './components/JapaCounter';
import Family from './components/Family';
// ... other component imports

// --- NEW IMPORTS ---
import AdminRoute from './components/AdminRoute';
import AdminPanel from './components/admin/AdminPanel';
import UserManagement from './components/admin/UserManagement';
// You would also import ScriptureManagement, EventManagement etc. here

// This is your existing PrivateRoute, if you have one
// If not, you can create one just like AdminRoute but only checking 'isAuthenticated'
// import PrivateRoute from './components/PrivateRoute'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Your Existing Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          {/* Your Existing Protected Routes (assuming you have a PrivateRoute) */}
          {/* <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/japa" element={<JapaCounter />} />
            <Route path="/family" element={<Family />} />
            ...
          </Route>
          */}

          {/* --- NEW ADMIN ROUTES --- */}
          {/* These routes are protected by AdminRoute */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<UserManagement />} />
            {/* <Route path="/admin/scriptures" element={<ScriptureManagement />} />
            <Route path="/admin/events" element={<EventManagement />} /> 
            */}
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;