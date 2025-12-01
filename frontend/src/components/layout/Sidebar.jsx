import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
// Removed logo.svg import
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

  const navItems = [
    { to: "/dashboard", icon: FiHome, label: t('dashboard') },
    { to: "/japa", icon: FiRepeat, label: t('japa') },
    { to: "/family", icon: FiUsers, label: t('family') },
    { to: "/calendar", icon: FiCalendar, label: t('calendar') },
    { to: "/library", icon: FiBookOpen, label: t('library') },
    { to: "/satsang", icon: FiMusic, label: t('satsang') },
    { to: "/tasks", icon: FiActivity, label: t('tasks') },
    { to: "/breathe", icon: FiWind, label: "Breathe" },
    ...(user?.is_super_admin ? [{ to: "/admin", icon: FiUser, label: "Admin" }] : []),
    { to: "/profile", icon: FiSettings, label: t('profile') },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-screen bg-primary-900 text-white transition-all duration-300 ease-in-out shadow-2xl
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-800/50">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <img src="/logo192.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            {!collapsed && (
              <h2 className="font-heading font-bold text-xl tracking-tight text-secondary-400 whitespace-nowrap">
                {t('app_title')}
              </h2>
            )}
          </div>

          {/* Mobile Close */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2"
            onClick={onMobileClose}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className={`p-4 mb-2 ${collapsed ? 'text-center' : ''}`}>
          <div className={`
            flex items-center gap-3 p-3 rounded-xl bg-primary-800/50 border border-primary-700/50
            ${collapsed ? 'justify-center' : ''}
          `}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-primary-900 font-bold shadow-lg shrink-0">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                <FiUser size={20} />
              )}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate text-white">{user?.name}</p>
                <p className="text-xs text-primary-200 truncate">{user?.spiritual_name || 'Bhakta'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-primary-800 to-primary-700 text-secondary-400 shadow-lg border-r-4 border-secondary-500'
                  : 'text-primary-100 hover:bg-primary-800/50 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <item.icon size={22} className={`shrink-0 ${collapsed ? '' : ''}`} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-800/50 space-y-4 bg-primary-950/30">
          {!collapsed && (
            <div className="flex items-center justify-between px-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-primary-800 text-xs text-white border-none rounded-lg px-2 py-1 focus:ring-1 focus:ring-secondary-500 outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-2 text-red-300 hover:text-red-100 hover:bg-red-900/20 p-2 rounded-lg transition-colors w-full
                ${collapsed ? 'justify-center' : ''}
              `}
              title={t('logout')}
            >
              <FiLogOut size={20} />
              {!collapsed && <span className="text-sm font-medium">{t('logout')}</span>}
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-2 text-primary-300 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
            >
              {collapsed ? <FiChevronsRight size={20} /> : <FiChevronsLeft size={20} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;