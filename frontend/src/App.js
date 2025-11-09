import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JapaCounter from './components/JapaCounter'; 
import Family from './components/Family';
import Profile from './components/Profile'; 
// import Scriptures from './components/Scriptures'; // 1. यह गलत था, इसे हटा दिया गया है
import Satsang from './components/Satsang'; // 2. नया Satsang इम्पोर्ट
import Tasks from './components/Tasks';
import Medicines from './components/Medicines';
import FamilyDetail from './components/FamilyDetail'; // 3. यह नया पेज इम्पोर्ट

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
              
              {/* 4. पुराना /scriptures रूट बदलकर /satsang कर दिया गया है */}
              <Route path="/satsang" element={<Satsang />} /> 
              
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/medicines" element={<Medicines />} />
              
              {/* 5. परिवार विवरण के लिए नया रूट */}
              <Route path="/family/:familyId" element={<FamilyDetail />} />

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