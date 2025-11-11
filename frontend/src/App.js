// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Import Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JapaCounter from './components/JapaCounter';
import Family from './components/Family';
import FamilyDetail from './components/FamilyDetail';
import Medicines from './components/Medicines';
import Profile from './components/Profile';
import Satsang from './components/Satsang';
import Tasks from './components/Tasks';

// --- NEW/UPDATED IMPORTS ---
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './components/admin/AdminPanel';
import UserManagement from './components/admin/UserManagement';
// 🛑 IMPORT THE NEW PLACEHOLDERS
import ScriptureManagement from './components/admin/ScriptureManagement';
import EventManagement from './components/admin/EventManagement';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          {/* Protected User Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/japa" element={<JapaCounter />} />
              <Route path="/family" element={<Family />} />
              <Route path="/family/:id" element={<FamilyDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/satsang" element={<Satsang />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<UserManagement />} />
            {/* 🛑 ADD THE NEW ROUTES */}
            <Route path="/admin/scriptures" element={<ScriptureManagement />} />
            <Route path="/admin/events" element={<EventManagement />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;