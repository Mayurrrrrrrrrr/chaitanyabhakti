import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css'; // We will create this CSS file next

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="nav-link">
        {/* You can add icons here later */}
        <span>🏠</span>
        <span className="nav-text">Home</span>
      </NavLink>
      <NavLink to="/japa" className="nav-link">
        <span>📿</span>
        <span className="nav-text">Japa</span>
      </NavLink>
      <NavLink to="/family" className="nav-link">
        <span>👨‍👩‍👧‍👦</span>
        <span className="nav-text">Family</span>
      </NavLink>
      <NavLink to="/profile" className="nav-link">
        <span>👤</span>
        <span className="nav-text">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;