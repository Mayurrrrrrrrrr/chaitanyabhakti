import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Sidebar.css';
import logo from '../../logo.svg'; // Assuming you have this, or use a placeholder
import {
  FiHome, FiRepeat, FiUsers, FiCalendar, FiUser,
  FiBookOpen, FiMusic, FiSettings, FiLogOut, FiActivity, FiChevronsLeft, FiChevronsRight, FiWind, FiX
} from 'react-icons/fi';

const Sidebar = ({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={onMobileClose}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <img src={logo} alt="Logo" className="app-logo" />
            <h2>{t('app_title')}</h2>
          </div>
          {/* Desktop Collapse Button */}
          <button className="logout-btn desktop-only" onClick={onToggleCollapse}>
            {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
          {/* Mobile Close Button */}
          <button className="logout-btn mobile-only" onClick={onMobileClose}>
            <FiX />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-small">
            {user?.profile_photo ? <img src={user.profile_photo} alt="User" /> : <FiUser />}
          </div>
          <div className="user-details">
            <strong>{user?.name}</strong>
            <span>{user?.spiritual_name || 'Bhakta'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={onMobileClose}>
            <FiHome /> {t('dashboard')}
          </NavLink>
          <NavLink to="/japa" onClick={onMobileClose}>
            <FiRepeat /> {t('japa')}
          </NavLink>
          <NavLink to="/family" onClick={onMobileClose}>
            <FiUsers /> {t('family')}
          </NavLink>
          <NavLink to="/calendar" onClick={onMobileClose}>
            <FiCalendar /> {t('calendar')}
          </NavLink>
          <NavLink to="/library" onClick={onMobileClose}>
            <FiBookOpen /> {t('library')}
          </NavLink>
          <NavLink to="/satsang" onClick={onMobileClose}>
            <FiMusic /> {t('satsang')}
          </NavLink>
          <NavLink to="/tasks" onClick={onMobileClose}>
            <FiActivity /> {t('tasks')}
          </NavLink>
          <NavLink to="/breathe" onClick={onMobileClose}>
            <FiWind /> Breathe
          </NavLink>
          {user?.is_super_admin ? (
            <NavLink to="/admin" onClick={onMobileClose}>
              <FiUser /> Admin
            </NavLink>
          ) : null}
          <NavLink to="/profile" onClick={onMobileClose}>
            <FiSettings /> {t('profile')}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;