// frontend/src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css'; //
import { useAuth } from '../context/AuthContext'; //

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today_count: 0,
    total_japa_count: 0,
    current_streak: 0,
    longest_streak: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 🛑 FIX: Changed '/japa/stats' to '/japa/summary'
        const res = await api.get('/japa/summary');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{`Hare Krishna, ${user?.name || 'Bhakta'}`}</h1>
        <p>Your spiritual progress summary</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>Today's Malas</h2>
          <p>{stats.today_count}</p>
        </div>
        <div className="stat-card">
          <h2>Total Malas</h2>
          <p>{stats.total_japa_count}</p>
        </div>
        <div className="stat-card">
          <h2>Current Streak</h2>
          <p>{stats.current_streak} {stats.current_streak === 1 ? 'day' : 'days'}</p>
        </div>
        <div className="stat-card">
          <h2>Longest Streak</h2>
          <p>{stats.longest_streak} {stats.longest_streak === 1 ? 'day' : 'days'}</p>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/japa" className="action-btn japa-btn">
          Start Japa
        </Link>
        <Link to="/family" className="action-btn family-btn">
          My Family
        </Link>
        <Link to="/medicines" className="action-btn medicine-btn">
          My Medicines
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;