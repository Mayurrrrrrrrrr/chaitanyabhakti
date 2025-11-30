// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Correct path

// Page Imports
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';

// Layout & Component Imports
import MainLayout from './components/layout/MainLayout';
import ScriptureLibrary from './components/ScriptureLibrary';
// Import other components as needed
import JapaCounter from './components/JapaCounter';
import Family from './components/Family';
import FamilyDetail from './components/FamilyDetail';
import Medicines from './components/Medicines';
import Tasks from './components/Tasks';
import Satsang from './components/Satsang';
import Leaderboard from './components/Leaderboard';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import Breathe from './components/Breathe';
import AdminPanel from './components/admin/AdminPanel';
import AdminRoute from './components/AdminRoute';
import UserManagement from './components/admin/UserManagement';
import ScriptureManagement from './components/admin/ScriptureManagement';
import MediaManagement from './components/admin/MediaManagement';
import EventManagement from './components/admin/EventManagement';

import './App.css';

// Protected Route Component (already good)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div>Loading...</div></div>;
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route (already good)
const PublicRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div>Loading...</div></div>;
  }
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* ✅ Protected User Routes */}
          <Route
            path="/"
            element={<ProtectedRoute><MainLayout /></ProtectedRoute>}
          >
            {/* Default route for "/" is /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* All component pages are children of MainLayout */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="library" element={<ScriptureLibrary />} />
            <Route path="japa" element={<JapaCounter />} />
            <Route path="family" element={<Family />} />
            <Route path="family/:family_id" element={<FamilyDetail />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="satsang" element={<Satsang />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="breathe/*" element={<Breathe />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/admin"
            element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute><AdminRoute><UserManagement /></AdminRoute></ProtectedRoute>}
          />
          <Route
            path="/admin/scriptures"
            element={<ProtectedRoute><AdminRoute><ScriptureManagement /></AdminRoute></ProtectedRoute>}
          />
          <Route
            path="/admin/media"
            element={<ProtectedRoute><AdminRoute><MediaManagement /></AdminRoute></ProtectedRoute>}
          />
          <Route
            path="/admin/events"
            element={<ProtectedRoute><AdminRoute><EventManagement /></AdminRoute></ProtectedRoute>}
          />

          {/* Catch all - redirect to login if not found */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;