import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { fetchVaishnavaEvents } from '../utils/vaishnavaData';
import './Dashboard.css';

// --- Icons (Feather Icons) ---
const IconSun = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const IconBookOpen = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const IconAward = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IconCheckSquare = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;

const formatPostDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short' });
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);
  const [japaStats, setJapaStats] = useState({ today_count: 0, current_streak: 0 });
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [satsangPosts, setSatsangPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Get Upcoming Festivals (Next 2)
        const allEvents = await fetchVaishnavaEvents();
        const today = new Date();
        const nextEvents = allEvents
          .filter(e => new Date(e.start_date) >= today)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          .slice(0, 3);

        setUpcomingFestivals(nextEvents);

        // 2. Load global posts (temple updates / satsang)
        const postsRes = await api.get('/community/satsang').catch(() => ({ data: [] }));
        const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
        setSatsangPosts(posts);

        // 3. Load Japa Stats
        const japaRes = await api.getJapaSummary().catch(() => ({ data: {} }));
        setJapaStats(japaRes.data || { today_count: 0, current_streak: 0 });

        // 4. Load Pending Tasks
        const tasksRes = await api.get('/tasks/summary/my-pending').catch(() => ({ data: { pending_count: 0 } }));
        setPendingTasksCount(tasksRes.data.pending_count || 0);

      } catch (err) {
        console.error("Dashboard data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page-container dashboard-page loading-state">
        <div className="loader"></div>
        <p>Loading your spiritual dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      {/* Header Section */}
      <header className="dashboard-header-row">
        <div className="greeting-text">
          <h1>Hare Krishna, {user?.name?.split(' ')[0] || 'Devotee'}! 🙏</h1>
          <p>May your day be filled with devotion.</p>
        </div>
        <div className="weather-widget glass-panel">
          <IconSun /> <span>Vrindavan</span>
        </div>
      </header>

      {/* Stats Overview Grid */}
      <div className="stats-overview">
        <div className="stat-card-premium japa-card">
          <div className="stat-icon-bg">📿</div>
          <div className="stat-info">
            <h3>Today's Japa</h3>
            <div className="stat-value">{japaStats.today_count} <span className="unit">Malas</span></div>
          </div>
        </div>

        <div className="stat-card-premium streak-card">
          <div className="stat-icon-bg">🔥</div>
          <div className="stat-info">
            <h3>Current Streak</h3>
            <div className="stat-value">{japaStats.current_streak} <span className="unit">Days</span></div>
          </div>
        </div>

        <div className="stat-card-premium tasks-card">
          <div className="stat-icon-bg">📝</div>
          <div className="stat-info">
            <h3>Pending Seva</h3>
            <div className="stat-value">{pendingTasksCount} <span className="unit">Tasks</span></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-layout">

        {/* Left Column */}
        <div className="dashboard-left-col">

          {/* Upcoming Festivals */}
          <div className="card festival-card">
            <div className="card-header">
              <h3><IconCalendar /> Upcoming Festivals</h3>
              <Link to="/calendar" className="view-all">View All</Link>
            </div>
            <div className="festival-list">
              {upcomingFestivals.length > 0 ? upcomingFestivals.map(event => (
                <div key={event.id} className="festival-item">
                  <div className="date-badge">
                    <span className="month">{new Date(event.start_date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="day">{new Date(event.start_date).getDate()}</span>
                  </div>
                  <div className="festival-info">
                    <h4>{event.title}</h4>
                    <span className={`tag tag-${event.event_type}`}>{event.event_type}</span>
                  </div>
                </div>
              )) : <p className="empty-text">No upcoming festivals soon.</p>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <Link to="/japa" className="card action-card">
              <span className="action-icon">📿</span>
              <span>Japa</span>
            </Link>
            <Link to="/satsang" className="card action-card">
              <span className="action-icon">🎵</span>
              <span>Media</span>
            </Link>
            <Link to="/family" className="card action-card">
              <span className="action-icon">👨‍👩‍👧‍👦</span>
              <span>Family</span>
            </Link>
            <Link to="/library" className="card action-card">
              <span className="action-icon">📖</span>
              <span>Books</span>
            </Link>
            <Link to="/breathe" className="card action-card">
              <span className="action-icon">🧘</span>
              <span>Breathe</span>
            </Link>
          </div>

        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">

          {/* Temple Updates */}
          <div className="card message-card">
            <div className="card-header">
              <h3><IconBell /> Temple Updates</h3>
            </div>
            <div className="message-list">
              {satsangPosts.slice(0, 4).map(post => (
                <div key={post.post_id} className={`message-item ${post.post_type || 'info'}`}>
                  <div className="message-content">
                    <h4>{post.title}</h4>
                    <p>{post.content?.slice(0, 60)}...</p>
                  </div>
                  <span className="message-date">{formatPostDate(post.created_at)}</span>
                </div>
              ))}
              {satsangPosts.length === 0 && (
                <div className="message-item info"><p>No updates yet.</p></div>
              )}
            </div>
          </div>

          {/* Satsang Highlights */}
          <div className="card blog-card">
            <div className="card-header">
              <h3><IconBookOpen /> Satsang Highlights</h3>
            </div>
            <div className="blog-list">
              {satsangPosts.slice(0, 2).map(post => (
                <div key={post.post_id} className="blog-item">
                  <div className="blog-content">
                    <h4>{post.title || (post.content?.slice(0, 50) + '...')}</h4>
                    <p>{post.content?.slice(0, 100)}</p>
                  </div>
                  <button className="read-btn"><IconArrowRight /></button>
                </div>
              ))}
              {satsangPosts.length === 0 && <div className="blog-item"><div className="blog-content"><p>No posts yet.</p></div></div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;