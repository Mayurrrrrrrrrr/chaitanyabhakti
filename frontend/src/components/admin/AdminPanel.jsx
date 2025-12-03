import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiBookOpen, FiVideo, FiCalendar, FiLogOut, FiSettings, FiPieChart } from 'react-icons/fi';
import api from '../../utils/api';

const AdminPanel = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScriptures: 0,
    totalMedia: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [usersRes, scripturesRes, videosRes, audioRes, eventsRes] = await Promise.all([
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/scriptures').catch(() => ({ data: [] })),
        api.get('/media/videos').catch(() => ({ data: [] })),
        api.get('/media/audio').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] }))
      ]);

      const today = new Date();
      const upcomingEvents = (eventsRes.data || []).filter(e =>
        new Date(e.start_date) >= today
      ).length;

      setStats({
        totalUsers: (usersRes.data || []).length,
        totalScriptures: (scripturesRes.data || []).length,
        totalMedia: (videosRes.data || []).length + (audioRes.data || []).length,
        upcomingEvents
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminCards = [
    {
      title: 'User Management',
      description: 'Create, deactivate, and manage user accounts',
      icon: FiUsers,
      link: '/admin/users',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Scripture Library',
      description: 'Upload PDFs, audio files, and manage content',
      icon: FiBookOpen,
      link: '/admin/scriptures',
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Media Management',
      description: 'Upload Kirtans and manage YouTube videos',
      icon: FiVideo,
      link: '/admin/media',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Global Events',
      description: 'Schedule festivals and Ekadashi notifications',
      icon: FiCalendar,
      link: '/admin/events',
      gradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FiSettings className="text-white text-4xl" />
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-white/90 text-lg">
                Welcome back, {user?.name} 👋
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                Super Admin
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading statistics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <FiUsers className="text-blue-500 text-2xl" />
                  <FiPieChart className="text-gray-400 text-xl" />
                </div>
                <div className="text-3xl font-bold text-gray-800">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500 mt-1">Total Users</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <FiBookOpen className="text-green-500 text-2xl" />
                  <FiPieChart className="text-gray-400 text-xl" />
                </div>
                <div className="text-3xl font-bold text-gray-800">{stats.totalScriptures}</div>
                <div className="text-sm text-gray-500 mt-1">Scriptures</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <FiVideo className="text-purple-500 text-2xl" />
                  <FiPieChart className="text-gray-400 text-xl" />
                </div>
                <div className="text-3xl font-bold text-gray-800">{stats.totalMedia}</div>
                <div className="text-sm text-gray-500 mt-1">Media Files</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <FiCalendar className="text-yellow-500 text-2xl" />
                  <FiPieChart className="text-gray-400 text-xl" />
                </div>
                <div className="text-3xl font-bold text-gray-800">{stats.upcomingEvents}</div>
                <div className="text-sm text-gray-500 mt-1">Upcoming Events</div>
              </div>
            </div>

            {/* Admin Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {adminCards.map((card, index) => (
                <Link
                  key={index}
                  to={card.link}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-2xl -mr-16 -mt-16`}></div>

                  <div className="relative z-10">
                    <div className={`${card.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <card.icon className={`${card.iconColor} text-3xl`} />
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed mb-4">
                      {card.description}
                    </p>

                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      <span>Manage</span>
                      <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Actions Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600">
                Access documentation and support resources
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={fetchStats}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Refresh Stats
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;