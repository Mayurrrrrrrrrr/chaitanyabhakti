// frontend/src/components/layout/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiRepeat,
  FiUsers,
  FiCalendar,
  FiUser
} from 'react-icons/fi';

const BottomNav = () => {
  const navItems = [
    { to: "/dashboard", icon: FiHome, label: "Home" },
    { to: "/japa", icon: FiRepeat, label: "Japa" },
    { to: "/family", icon: FiUsers, label: "Family" },
    { to: "/calendar", icon: FiCalendar, label: "Calendar" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors duration-200
            ${isActive ? 'text-primary-600' : 'text-slate-400 hover:text-primary-500'}
          `}
        >
          <item.icon size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;