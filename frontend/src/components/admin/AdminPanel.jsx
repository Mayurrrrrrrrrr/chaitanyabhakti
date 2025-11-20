// frontend/src/components/admin/AdminPanel.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import './AdminPanel.css';

const AdminPanel = () => {
  // Destructure logout from AuthContext
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-panel-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin</p>
      </header>

      <nav className="admin-nav-grid">
        <Link to="/admin/users" className="admin-card">
          <h3>Manage Users</h3>
          <p>Create, deactivate, or reactivate users.</p>
        </Link>

        <Link to="/admin/scriptures" className="admin-card">
          <h3>Manage Scriptures</h3>
          <p>Upload PDFs, audio, and cover images.</p>
        </Link>

        <Link to="/admin/media" className="admin-card">
          <h3>Manage Media</h3>
          <p>Upload Kirtans and add YouTube links.</p>
        </Link>

        <Link to="/admin/events" className="admin-card">
          <h3>Manage Global Events</h3>
          <p>Schedule festivals and Ekadashi notifications.</p>
        </Link>
      </nav>

      <div className="admin-actions">
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;