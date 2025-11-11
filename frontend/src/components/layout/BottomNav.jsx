// frontend/src/components/layout/BottomNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';
import { 
  FiHome, 
  FiDisc, 
  FiUsers, 
  FiCheckSquare, 
  FiHeadphones, 
  FiUser,
  FiBookOpen
} from 'react-icons/fi';

const BottomNav = () => {
  // 🛑 FIX: I have removed the 'if' condition that was hiding
  // this component on the /japa page.

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
      <NavLink to="/tasks" className="nav-item">
        <FiCheckSquare />
        <span>Tasks</span>
      </NavLink>
      <NavLink to="/library" className="nav-item">
        <FiBookOpen />
        <span>Library</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <FiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;