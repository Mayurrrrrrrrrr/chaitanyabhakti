// frontend/src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiActivity, FiCalendar, FiMusic, FiSettings } from 'react-icons/fi';
import api from '../../utils/api';
import UserManagement from './UserManagement';
import ScriptureManagement from './ScriptureManagement';
import MediaManagement from './MediaManagement';
import EventManagement from './EventManagement';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    users: 0,
    scriptures: 0,
    media: 0,
    events: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Parallel fetch for dashboard stats
      const [usersRes, scripturesRes, mediaRes, eventsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/scriptures'),
        api.get('/media/audio'),
        api.get('/events')
      ]);

      setStats({
        users: usersRes.data.length,
        scriptures: scripturesRes.data.length,
        media: mediaRes.data.length, // Only counting audio for now, could add video
        events: eventsRes.data.length
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: FiUsers, color: 'bg-blue-500' },
    { id: 'scriptures', label: 'Scriptures', icon: FiBook, color: 'bg-saffron-500' },
    { id: 'media', label: 'Media', icon: FiMusic, color: 'bg-purple-500' },
    { id: 'events', label: 'Events', icon: FiCalendar, color: 'bg-green-500' },
    { id: 'settings', label: 'Settings', icon: FiSettings, color: 'bg-gray-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return <UserManagement />;
      case 'scriptures': return <ScriptureManagement />;
      case 'media': return <MediaManagement />;
      case 'events': return <EventManagement />;
      case 'settings': return <div className="p-8 text-center text-gray-500">Settings coming soon...</div>;
      default: return <UserManagement />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 font-heading">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage users, content, and system settings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.users}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-saffron-50 text-saffron-600 rounded-xl">
            <FiBook size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Scriptures</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.scriptures}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <FiMusic size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Media Items</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.media}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <FiCalendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Events</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.events}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'text-saffron-600 border-b-2 border-saffron-500 bg-saffron-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;