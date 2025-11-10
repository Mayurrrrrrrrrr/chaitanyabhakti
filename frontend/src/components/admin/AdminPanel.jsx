// frontend/src/components/admin/AdminPanel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
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
          {/* Add more admin links here */}
        </ul>
      </nav>
    </div>
  );
};

export default AdminPanel;