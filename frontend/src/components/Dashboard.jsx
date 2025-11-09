import React from 'react';

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Easiest way to "log out"
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>You are logged in!</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Dashboard;