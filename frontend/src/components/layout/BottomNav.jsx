// frontend/src/components/layout/BottomNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';
// You'll need to install react-icons: npm install react-icons
import { 
  FiHome, 
  FiDisc, 
  FiUsers, 
  FiCheckSquare, 
  FiHeadphones, 
  FiUser 
} from 'react-icons/fi';

const BottomNav = () => {
  const location = useLocation();
  
  // Don't show nav on the JapaCounter page
  if (location.pathname === '/japa') {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="nav-item">
        <FiHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/family" className="nav-item">
        <FiUsers />
        <span>Family</span>
      </NavLink>
      <NavLink to="/japa" className="nav-item japa-link">
        <FiDisc />
        <span>Japa</span>
      </NavLink>
      <NavLink to="/satsang" className="nav-item">
        <FiHeadphones />
        <span>Satsang</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <FiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;