// frontend/src/components/admin/AdminPanel.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import './AdminPanel.css';

const AdminPanel = () => {
  // Get the logout function and navigate hook
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <nav className="admin-nav">
        <ul>
          <li>
            <Link to="/admin/users">Manage Users</Link>
          </li>
          <li>
            <Link to="/admin/scriptures">Manage Scriptures</Link>
          </li>
          <li>
            <Link to="/admin/events">Manage Global Events</Link>
          </li>
          <li>
            {/* --- NEW LOGOUT BUTTON --- */}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminPanel;