import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiRepeat, FiWind, FiMusic, FiZap, FiSun, FiHeart } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    japaToday: 0,
    japaStreak: 0,
    breatheMinutes: 0,
    tasksCompleted: 0,
  });
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  const spiritualQuotes = [
    "Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare",
    "The soul is neither born, and nor does it die - Bhagavad Gita",
    "In the joy of others lies our own - Prabhupad",
    "Chant and be happy",
    "Love of God is dormant in everyone's heart",
  ];

  useEffect(() => {
    fetchDashboardData();
    setQuote(spiritualQuotes[Math.floor(Math.random() * spiritualQuotes.length)]);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const japaRes = await api.get('/japa/today');
      if (japaRes.data) {
        setStats(prev => ({
          ...prev,
          japaToday: japaRes.data.rounds || 0,
          japaStreak: japaRes.data.streak || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <div className="mb-8 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <FiSun className="text-white text-4xl" />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
                Hare Krishna! 🙏
              </h1>
            </div>
            <p className="text-white/90 text-lg md:text-xl italic">
              "{quote}"
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Japa Card */}
          <Link to="/japa" className="group">
            <div className="h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FiRepeat className="text-yellow-600 text-2xl" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">Japa Rounds</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-yellow-600">{stats.japaToday}</span>
                <span className="text-gray-500 text-lg">today</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">🔥 {stats.japaStreak} day streak</p>
              </div>
            </div>
          </Link>

          {/* Breathe Card */}
          <Link to="/breathe" className="group">
            <div className="h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiWind className="text-green-600 text-2xl" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">Mindfulness</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-green-600">{stats.breatheMinutes}</span>
                <span className="text-gray-500 text-lg">mins</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">🧘 Breathe & Meditate</p>
              </div>
            </div>
          </Link>

          {/* Satsang Card */}
          <Link to="/satsang" className="group">
            <div className="h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiMusic className="text-blue-600 text-2xl" />
                </div>
                <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  LIVE
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">Satsang</h3>
              <p className="text-gray-600 text-sm">Daily spiritual discourse</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-blue-600 font-medium">🎵 Watch Now →</p>
              </div>
            </div>
          </Link>

          {/* Streak Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiZap className="text-purple-600 text-2xl" />
              </div>
            </div>
            <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">Streak</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-purple-600">{stats.japaStreak}</span>
              <span className="text-gray-500 text-lg">days</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">🌟 Keep it going!</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/japa" className="flex flex-col items-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
              <FiRepeat className="text-yellow-600 text-3xl mb-2" />
              <span className="text-sm font-medium text-gray-700">Start Japa</span>
            </Link>
            <Link to="/breathe" className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <FiWind className="text-green-600 text-3xl mb-2" />
              <span className="text-sm font-medium text-gray-700">Breathe</span>
            </Link>
            <Link to="/satsang" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <FiMusic className="text-blue-600 text-3xl mb-2" />
              <span className="text-sm font-medium text-gray-700">Satsang</span>
            </Link>
            <Link to="/library" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <FiHeart className="text-purple-600 text-3xl mb-2" />
              <span className="text-sm font-medium text-gray-700">Scriptures</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;