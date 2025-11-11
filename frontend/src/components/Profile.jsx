//
// FILE: frontend/src/components/Profile.jsx
//
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css'; 

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Spiritual Name:</strong> {user.spiritual_name || 'N/A'}</p>
        <p><strong>Mobile:</strong> {user.mobile_number}</p>
      </div>

      <button onClick={handleLogout} className="btn-logout">
        Logout
      </button>
    </div>
  );
};

export default Profile;