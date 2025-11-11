//
// FILE: frontend/src/components/layout/BottomNav.jsx
//
import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';
import { 
  FiHome, 
  FiRepeat, 
  FiUsers, 
  FiCalendar, // Import Calendar Icon
  FiUser 
} from 'react-icons/fi';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="nav-item">
        <FiHome size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/japa" className="nav-item">
        <FiRepeat size={24} />
        <span>Japa</span>
      </NavLink>
      <NavLink to="/family" className="nav-item">
        <FiUsers size={24} />
        <span>Family</span>
      </NavLink>
      {/* --- PRIORITY 2: CALENDAR NAV ITEM --- */}
      <NavLink to="/calendar" className="nav-item">
        <FiCalendar size={24} />
        <span>Calendar</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <FiUser size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;