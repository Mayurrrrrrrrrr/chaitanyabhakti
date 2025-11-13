// frontend/src/pages/Dashboard.js
import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Import Link
import { AuthContext } from '../context/AuthContext'; // Correct path
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🕉️ Vaishnav Bhakti Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.name || 'Devotee'}!</h2>
          {user?.spiritual_name && (
            <p className="spiritual-name">
              Spiritual Name: {user.spiritual_name}
            </p>
          )}
          <p className="mobile">Mobile: {user?.mobile_number}</p>
          {user?.is_super_admin === 1 && (
            <div className="admin-badge">Admin</div>
          )}
        </div>

        <div className="features-grid">
          {/* ✅ Wrapped in Link */}
          <Link to="/japa" className="feature-card">
            <h3>📿 Japa Tracker</h3>
            <p>Track your daily chanting</p>
          </Link>
          
          {/* ✅ Wrapped in Link */}
          <Link to="/family" className="feature-card">
            <h3>👨‍👩‍👧‍👦 Family</h3>
            <p>Connect with your spiritual family</p>
          </Link>
          
          {/* ✅ Wrapped in Link (pointing to /library to match sidebar) */}
          <Link to="/library" className="feature-card">
            <h3>📖 Scriptures</h3>
            <p>Read and study sacred texts</p>
          </Link>
          
          {/* ✅ Wrapped in Link */}
          <Link to="/satsang" className="feature-card">
            <h3>🎵 Media</h3>
            <p>Listen to bhajans and lectures</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;