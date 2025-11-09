import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="nav-link">
        <span>🏠</span>
        <span className="nav-text">होम</span>
      </NavLink>
      <NavLink to="/japa" className="nav-link">
        <span>📿</span>
        <span className="nav-text">जप</span>
      </NavLink>
      <NavLink to="/family" className="nav-link">
        <span>👨‍👩‍👧‍👦</span>
        <span className="nav-text">परिवार</span>
      </NavLink>
      {/* यह रहा नया शास्त्र लिंक! */}
      <NavLink to="/satsang" className="nav-link">
        <span>📖</span>
        <span className="nav-text">सत्संग</span>
      </NavLink>
      <NavLink to="/profile" className="nav-link">
        <span>👤</span>
        <span className="nav-text">प्रोफ़ाइल</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;