import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext'; // New Provider
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
import ScriptureLibrary from './components/ScriptureLibrary';
import Calendar from './components/Calendar'; 

// Import Admin & Route Guards
import PrivateRoute from './components/PrivateRoute'; 
import AdminRoute from './components/AdminRoute';
import AdminPanel from './components/admin/AdminPanel';
import UserManagement from './components/admin/UserManagement';
import ScriptureManagement from './components/admin/ScriptureManagement';
import EventManagement from './components/admin/EventManagement';
import MediaManagement from './components/admin/MediaManagement'; // <-- ADDED: Media management import

const AppWrapper = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.user_id) {
      const preferences = user.preferences || {};
      document.body.className = '';
      document.body.classList.add(`theme-${preferences.theme || 'light'}`);
      document.body.classList.add(`font-${preferences.font_size || 'medium'}`);
      if (preferences.high_contrast) {
        document.body.classList.add('high-contrast');
      }
    } else {
      document.body.className = 'theme-light font-medium';
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/japa" element={<JapaCounter />} />
          <Route path="/family" element={<Family />} />
          <Route path="/family/:id" element={<FamilyDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/satsang" element={<Satsang />} />
          <Route path="/library" element={<ScriptureLibrary />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Routes - wrapped individually with AdminRoute */}
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/scriptures" element={<AdminRoute><ScriptureManagement /></AdminRoute>} />
      <Route path="/admin/events" element={<AdminRoute><EventManagement /></AdminRoute>} />
      <Route path="/admin/media" element={<AdminRoute><MediaManagement /></AdminRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider> {/* Wrap with LanguageProvider */}
        <Router>
          <AppWrapper />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;