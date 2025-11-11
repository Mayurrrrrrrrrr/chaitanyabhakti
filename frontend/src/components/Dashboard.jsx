import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { FiCheckSquare, FiShare2, FiTrendingUp, FiAward } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today_count: 0,
    total_japa_count: 0,
    current_streak: 0,
    longest_streak: 0,
  });
  const [taskSummary, setTaskSummary] = useState({ pending_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/japa/summary');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    
    const fetchTaskSummary = async () => {
      try {
        const res = await api.get('/tasks/summary/my-pending');
        setTaskSummary(res.data);
      } catch (err) {
        console.error('Failed to fetch task summary', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchTaskSummary();
  }, []);

  const handleShareToWhatsApp = () => {
    const message = `🙏 Hare Krishna! 

Today's Japa: ${stats.today_count} Malas 📿
Total Japa: ${stats.total_japa_count} Malas
Current Streak: ${stats.current_streak} days 🔥

Track your spiritual journey with Vaishnav Bhakti App!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading your spiritual journey...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="greeting-section">
          <h1>🙏 Hare Krishna, {user?.name || 'Bhakta'}!</h1>
          <p>May your day be filled with devotion and peace</p>
        </div>
      </header>

      <button className="share-btn" onClick={handleShareToWhatsApp}>
        <FiShare2 size={20} />
        <span>Share My Progress</span>
      </button>

      <div className="stats-grid">
        <div className="stat-card today">
          <div className="stat-icon">📿</div>
          <div className="stat-content">
            <h3>Today's Malas</h3>
            <p className="stat-value">{stats.today_count}</p>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Total Malas</h3>
            <p className="stat-value">{stats.total_japa_count}</p>
          </div>
        </div>

        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">{stats.current_streak} <span>days</span></p>
          </div>
        </div>

        <div className="stat-card best">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Longest Streak</h3>
            <p className="stat-value">{stats.longest_streak} <span>days</span></p>
          </div>
        </div>

        <Link to="/tasks" className="stat-card tasks">
          <div className="stat-icon">
            <FiCheckSquare size={32} />
          </div>
          <div className="stat-content">
            <h3>Pending Seva</h3>
            <p className="stat-value">{taskSummary.pending_count}</p>
          </div>
        </Link>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/japa" className="action-card japa">
            <span className="action-icon">🙏</span>
            <h3>Start Japa</h3>
            <p>Begin your daily practice</p>
          </Link>

          <Link to="/family" className="action-card family">
            <span className="action-icon">👨‍👩‍👧‍👦</span>
            <h3>My Family</h3>
            <p>Connect with devotees</p>
          </Link>

          <Link to="/medicines" className="action-card medicine">
            <span className="action-icon">💊</span>
            <h3>Medicines</h3>
            <p>Track your health</p>
          </Link>

          <Link to="/library" className="action-card library">
            <span className="action-icon">📚</span>
            <h3>Scriptures</h3>
            <p>Study sacred texts</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;