import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- CORRECTED PATH
import api from '../services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
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
    return <div>Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h3>Today's Sadhana</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats ? stats.total_japa_count : 0}</div>
          <div className="stat-label">Total Malas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats ? stats.current_streak : 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      <Link to="/japa" className="japa-button-link">
        <button className="japa-button">
          📿 Start/Continue Japa
        </button>
      </Link>

      <div className="quick-links">
        <Link to="/family" className="quick-link">My Family</Link>
        <Link to="/tasks" className="quick-link">My Tasks</Link>
        <Link to="/scriptures" className="quick-link">Scriptures</Link>
      </div>

      <button onClick={logout} className="logout-button">
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;