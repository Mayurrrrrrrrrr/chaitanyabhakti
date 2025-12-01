import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
    { to: "/dashboard", icon: FiHome, label: t('dashboard'), color: "from-saffron-500 to-orange-500" },
    { to: "/japa", icon: FiRepeat, label: t('japa'), color: "from-saffron-500 to-orange-600" },
    { to: "/family", icon: FiUsers, label: t('family'), color: "from-tulsi-500 to-green-600" },
    { to: "/calendar", icon: FiCalendar, label: t('calendar'), color: "from-krishna-500 to-blue-600" },
    { to: "/library", icon: FiBookOpen, label: t('library'), color: "from-lotus-500 to-pink-600" },
    { to: "/satsang", icon: FiMusic, label: t('satsang'), color: "from-pink-500 to-purple-600" },
    { to: "/tasks", icon: FiActivity, label: t('tasks'), color: "from-orange-500 to-red-600" },
    { to: "/breathe", icon: FiWind, label: "Breathe", color: "from-tulsi-500 to-krishna-500" },
    ...(user?.is_super_admin ? [{ to: "/admin", icon: FiUser, label: "Admin", color: "from-gray-600 to-gray-800" }] : []),
    { to: "/profile", icon: FiSettings, label: t('profile'), color: "from-gray-500 to-gray-700" },
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
          fixed md:static top-0 left-0 z-50 h-screen 
          bg-gradient-to-b from-saffron-600 via-orange-600 to-orange-700
          text-white transition-all duration-300 ease-in-out shadow-2xl
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
          border-r-4 border-saffron-400/30
        `}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-peacock bg-cover bg-center opacity-5"></div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-white/20">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <img src="/logo192.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
            {!collapsed && (
              <h2 className="font-heading font-bold text-xl tracking-tight text-white whitespace-nowrap">
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
        <div className={`relative p-4 mb-2 ${collapsed ? 'text-center' : ''}`}>
          <div className={`
            flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20
            ${collapsed ? 'justify-center' : ''}
          `}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-saffron-100 flex items-center justify-center text-saffron-600 font-bold shadow-lg shrink-0">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                <FiUser size={20} />
              )}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate text-white">{user?.name}</p>
                <p className="text-xs text-white/70 truncate">{user?.spiritual_name || 'Bhakta'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border-r-4 border-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20`}></div>
                  )}
                  <item.icon size={22} className="shrink-0 relative z-10" />
                  {!collapsed && <span className="font-medium relative z-10">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t border-white/20 space-y-4 bg-black/10">
          {!collapsed && (
            <div className="flex items-center justify-between px-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-xs text-white border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-white/50 outline-none cursor-pointer"
              >
                <option value="en" className="text-gray-800">English</option>
                <option value="hi" className="text-gray-800">हिंदी</option>
                <option value="bn" className="text-gray-800">বাংলা</option>
                <option value="mr" className="text-gray-800">मराठी</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-2 text-red-200 hover:text-white hover:bg-red-500/20 p-2 rounded-lg transition-colors w-full
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
              className="hidden md:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {collapsed ? <FiChevronsRight size={20} /> : <FiChevronsLeft size={20} />}
            </button>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar;