//
// FILE: frontend/src/components/Dashboard.jsx
//
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { FiCheckSquare, FiShare2 } from 'react-icons/fi'; // Import Share icon

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today_count: 0,
    total_japa_count: 0,
    current_streak: 0,
    longest_streak: 0,
  });
  const [taskSummary, setTaskSummary] = useState({ pending_count: 0 });

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
      }
    };

    fetchStats();
    fetchTaskSummary();
  }, []);

  // --- PRIORITY 2: WHATSAPP SHARE FUNCTION ---
  const handleShareToWhatsApp = () => {
    let message = `Hare Krishna, ${user?.name}! 🙏\n\nToday's Japa: ${stats.today_count} Malas\nTotal Japa: ${stats.total_japa_count} Malas\nMy current streak: ${stats.current_streak} days 🔥\n\nTrack your bhakti with me!`;
    
    // For senior citizens, we can use a simpler message
    // let message = `Hare Krishna. ${stats.today_count} mala ho gayi.`;

    const encodedMessage = encodeURIComponent(message);
    // This URL works on both mobile and desktop
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{`Hare Krishna, ${user?.name || 'Bhakta'}`}</h1>
        <p>Your spiritual progress summary</p>
      </header>

      {/* --- PRIORITY 2: WHATSAPP SHARE BUTTON --- */}
      <button className="share-btn" onClick={handleShareToWhatsApp}>
        <FiShare2 /> Share My Progress
      </button>

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
        
        <div className="stat-card task-card">
          <Link to="/tasks" className="task-link-wrapper">
            <FiCheckSquare size={24} />
            <h2>Pending Tasks</h2>
            <p>{taskSummary.pending_count}</p>
          </Link>
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