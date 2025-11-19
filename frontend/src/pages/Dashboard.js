import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchVaishnavaEvents } from '../utils/vaishnavaData'; 
import './Dashboard.css';

// --- Inline Icons ---
const IconSun = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconBookOpen = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconAward = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

// --- Mock Data ---
const MOCK_LEADERBOARD = [
  { id: 1, name: 'Radhika Dasi', count: 64 },
  { id: 2, name: 'Govinda Das', count: 58 },
  { id: 3, name: 'Krishna Kripa', count: 50 },
];

const MOCK_BLOGS = [
    { id: 1, title: "The Importance of Ekadashi", summary: "Why we fast and how it purifies the soul.", date: "Nov 18" },
    { id: 2, title: "Kirtan Standards", summary: "Guidelines for leading ecstatic kirtans.", date: "Nov 15" },
];

const MOCK_MESSAGES = [
    { id: 1, text: "Special Darshan tomorrow at 7 AM for Govardhan Puja.", type: "important" },
    { id: 2, text: "Srimad Bhagavatam class by HG Amogh Lila Prabhu today at 6 PM.", type: "info" }
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD);
  const [blogs, setBlogs] = useState(MOCK_BLOGS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
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
            .slice(0, 2);
        
        setUpcomingFestivals(nextEvents);

      } catch (err) {
        console.error("Dashboard data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="page-container dashboard-page">
      {/* Header Section */}
      <header className="dashboard-header-row">
        <div className="greeting-text">
            <h1>Hare Krishna, {user?.name?.split(' ')[0] || 'Devotee'}! 🙏</h1>
            <p>May your day be filled with devotion.</p>
        </div>
        <div className="weather-widget">
             <IconSun /> <span>Vrindavan</span>
        </div>
      </header>

      <div className="dashboard-grid">
          
          {/* 1. Important Messages */}
          <div className="card message-card">
            <div className="card-header">
                <h3><IconBell /> Temple Updates</h3>
            </div>
            <div className="message-list">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-item ${msg.type}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>
          </div>

          {/* 2. Upcoming Festivals */}
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

          {/* 3. Japa Leaderboard (Top 3) */}
          <div className="card leaderboard-card">
             <div className="card-header">
                <h3><IconAward /> Top Chanters Today</h3>
                <Link to="/leaderboard" className="view-all">View All</Link>
             </div>
             <div className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                    <div key={entry.id} className="leaderboard-item">
                        <div className="rank-badge">{index + 1}</div>
                        <div className="devotee-info">
                            <span className="devotee-name">{entry.name}</span>
                            <span className="mala-count">{entry.count} Malas</span>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* 4. Blogs / News */}
          <div className="card blog-card">
             <div className="card-header">
                <h3><IconBookOpen /> Spiritual Wisdom</h3>
             </div>
             <div className="blog-list">
                {blogs.map(blog => (
                    <div key={blog.id} className="blog-item">
                        <div className="blog-content">
                            <h4>{blog.title}</h4>
                            <p>{blog.summary}</p>
                            <span className="blog-date">{blog.date}</span>
                        </div>
                        <button className="read-btn"><IconArrowRight /></button>
                    </div>
                ))}
             </div>
          </div>

          {/* 5. Quick Actions Grid */}
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
          </div>
      </div>
    </div>
  );
};

export default Dashboard;