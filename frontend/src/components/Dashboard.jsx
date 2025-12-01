import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiSun, FiRepeat, FiWind, FiMusic, FiZap, FiTrendingUp } from 'react-icons/fi';

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-saffron-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-pink-50 p-4 md:p-8">
      {/* Background Decoration */}
      <div className="fixed inset-0 opacity-5 bg-peacock bg-cover bg-center pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">

          {/* Welcome Card - Spans 2 columns */}
          <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-saffron-400 via-saffron-500 to-orange-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-lotus bg-cover bg-center opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <FiSun className="text-white text-4xl animate-float" />
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
                  Hare Krishna! 🙏
                </h1>
              </div>
              <p className="text-white/90 text-lg md:text-xl italic font-light leading-relaxed">
                "{quote}"
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                  ✨ Divine Day
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                  🌸 Vrindavan Vibes
                </div>
              </div>
            </div>
          </div>

          {/* Japa Card */}
          <Link to="/japa" className="group">
            <div className="h-full bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-saffron-400/20 to-orange-500/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-saffron-400 to-orange-500 rounded-2xl shadow-lg">
                    <FiRepeat className="text-white text-2xl" />
                  </div>
                  <FiTrendingUp className="text-saffron-500 text-xl" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">Japa Rounds</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-saffron-600">{stats.japaToday}</span>
                  <span className="text-gray-500 text-lg">today</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">🔥 {stats.japaStreak} day streak</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Breathe Card */}
          <Link to="/breathe" className="group">
            <div className="h-full bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-tulsi-400/20 to-krishna-500/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-tulsi-500 to-krishna-500 rounded-2xl shadow-lg">
                    <FiWind className="text-white text-2xl" />
                  </div>
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">Mindfulness</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-tulsi-600">{stats.breatheMinutes}</span>
                  <span className="text-gray-500 text-lg">mins</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">🧘 Breathe & Meditate</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Satsang Card */}
          <Link to="/satsang" className="group">
            <div className="h-full bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lotus-400/20 to-pink-500/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-lotus-500 to-pink-500 rounded-2xl shadow-lg">
                    <FiMusic className="text-white text-2xl" />
                  </div>
                  <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    LIVE
                  </div>
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">Satsang</h3>
                <p className="text-gray-600 text-sm">Daily spiritual discourse</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-lotus-600 font-medium">🎵 Watch Now →</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Streak Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-krishna-400/20 to-blue-500/20 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-krishna-500 to-blue-600 rounded-2xl shadow-lg">
                  <FiZap className="text-white text-2xl" />
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">Streak</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-krishna-600">{stats.japaStreak}</span>
                <span className="text-gray-500 text-lg">days</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">🌟 Keep it going!</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;