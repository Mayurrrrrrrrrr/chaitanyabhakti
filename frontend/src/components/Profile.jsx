import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

// --- Inline Icons ---
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPhone = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconAward = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconLogOut = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalMalas: 0, streak: 0 });

  useEffect(() => {
    // Mock fetching stats - replace with real API call
    // const fetchStats = async () => { ... }
    // fetchStats();
    setStats({ totalMalas: 108, streak: 12 }); // Mock data
  }, []);

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
        logout();
        navigate('/login');
    }
  };

  if (!user) return <div className="loading-state">Loading Profile...</div>;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'VB';

  return (
    <div className="page-container profile-page">
      
      {/* Header Card */}
      <div className="card profile-header-card">
        <div className="profile-cover-bg"></div>
        <div className="profile-main-info">
            <div className="avatar-large">
                {initials}
            </div>
            <h1 className="user-name">{user.name}</h1>
            <p className="user-spiritual-name">{user.spiritual_name || 'Aspiring Devotee'}</p>
            <span className="role-badge">{user.is_super_admin ? 'Administrator' : 'Member'}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="profile-stats-row">
          <div className="card stat-card">
              <span className="stat-number">{stats.totalMalas}</span>
              <span className="stat-desc">Total Malas</span>
          </div>
          <div className="card stat-card">
              <span className="stat-number">{stats.streak}</span>
              <span className="stat-desc">Day Streak</span>
          </div>
          <div className="card stat-card">
              <span className="stat-number">4</span>
              <span className="stat-desc">Groups</span>
          </div>
      </div>

      {/* Details Section */}
      <div className="card details-card">
          <div className="card-header-row">
              <h3>Personal Details</h3>
              <button className="icon-btn-text" disabled title="Edit Profile (Coming Soon)">
                  <IconEdit /> Edit
              </button>
          </div>
          
          <div className="detail-list">
              <div className="detail-item">
                  <div className="detail-icon"><IconPhone /></div>
                  <div className="detail-content">
                      <label>Mobile Number</label>
                      <p>{user.mobile_number}</p>
                  </div>
              </div>
              
              <div className="detail-item">
                  <div className="detail-icon"><IconMail /></div>
                  <div className="detail-content">
                      <label>Email</label>
                      <p>{user.email || 'Not provided'}</p>
                  </div>
              </div>

              <div className="detail-item">
                  <div className="detail-icon"><IconAward /></div>
                  <div className="detail-content">
                      <label>Initiation Status</label>
                      <p>{user.initiation_status || 'Aspiring'}</p>
                  </div>
              </div>

              <div className="detail-item">
                  <div className="detail-icon"><IconUser /></div>
                  <div className="detail-content">
                      <label>Yatra / Center</label>
                      <p>{user.center || 'Local Temple'}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Actions */}
      <div className="profile-actions">
          <button className="btn-logout-large" onClick={handleLogout}>
              <IconLogOut /> Logout
          </button>
      </div>

    </div>
  );
};

export default Profile;