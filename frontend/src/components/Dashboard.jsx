import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css'; 

const Dashboard = () => {
  const { logout } = useAuth(); // <-- 'user' was removed here
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/japa/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-container">आपका डैशबोर्ड लोड हो रहा है...</div>;
  }

  return (
    <div className="dashboard">
      <div className="card greeting-card">
        <p>"हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे ।</p>
        <p>हरे राम हरे राम, राम राम हरे हरे ॥"</p>
      </div>

      <h3>आज की साधना</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats ? stats.total_japa_count : 0}</div>
          <div className="stat-label">कुल माला</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats ? stats.current_streak : 0}</div>
          <div className="stat-label">जप स्ट्रीक (दिन)</div>
        </div>
      </div>

      <Link to="/japa" className="japa-button-link">
        <button className="japa-button">
          📿 जप शुरू करें
        </button>
      </Link>

      <div className="quick-links">
        <Link to="/family" className="quick-link">मेरा परिवार</Link>
        <Link to="/tasks" className="quick-link">मेरे कार्य</Link>
        <Link to="/medicines" className="quick-link">मेरी दवाएँ</Link> 
        <Link to="/leaderboard" className="quick-link">🏆 लीडरबोर्ड</Link> 
      </div>

      <button onClick={logout} className="btn-logout">
        लॉग आउट
      </button>
    </div>
  );
};

export default Dashboard;