// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiActivity, FiCheckCircle, FiTrendingUp, FiUsers, FiDollarSign, FiBell, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { supabase } from '../supabase';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    japaCount: 0,
    tasksPending: 0,
    nextEvent: null,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      // 1. Get Today's Japa
      const today = new Date().toISOString().split('T')[0];
      const japaRes = await api.get(`/japa/history?date=${today}`);
      const todayJapa = japaRes.data.reduce((sum, session) => sum + session.count, 0);

      // 2. Get Pending Tasks
      const tasksRes = await api.get('/tasks');
      const pendingTasks = tasksRes.data.filter(t => !t.completed).length;

      // 3. Get Next Event
      const eventsRes = await api.get('/events');
      const now = new Date();
      const futureEvents = eventsRes.data
        .filter(e => new Date(e.start_date) >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;

      // 4. Get Streak (Mock or from Supabase if function exists)
      // For now, we'll try to fetch from user_stats if it exists, else default to 0
      let streak = 0;
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('current_streak')
        .eq('user_id', user?.id)
        .single();

      if (userStats) {
        streak = userStats.current_streak;
      }

      setStats({
        japaCount: todayJapa,
        tasksPending: pendingTasks,
        nextEvent: nextEvent,
        streak: streak
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-saffron-500 to-orange-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {t('welcome')}, {user?.name || 'Devotee'}! 🙏
          </h1>
          <p className="text-orange-100 text-lg max-w-2xl">
            "Always think of Me, become My devotee, worship Me and offer your homage unto Me." - Bhagavad Gita 18.65
          </p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Japa Card (Large) */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiActivity size={120} className="text-saffron-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-saffron-600 mb-2">
              <FiActivity />
              <span className="font-semibold uppercase tracking-wider text-xs">Today's Japa</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-800 mb-1">
              {loading ? '...' : stats.japaCount}
            </h2>
            <p className="text-gray-500">Mantras chanted today</p>
          </div>
          <div className="mt-6">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-saffron-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((stats.japaCount / 1728) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">Daily Goal: 16 Rounds (1728 mantras)</p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2 text-orange-600 mb-4">
            <FiTrendingUp />
            <span className="font-semibold uppercase tracking-wider text-xs">Current Streak</span>
          </div>
          <div className="text-center py-4">
            <h2 className="text-5xl font-bold text-gray-800 mb-1">
              {loading ? '...' : stats.streak}
            </h2>
            <p className="text-gray-500 text-sm">Days in a row</p>
          </div>
          <div className="text-center text-xs text-orange-500 font-medium bg-orange-50 py-2 rounded-lg">
            Keep it up! 🔥
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <FiCheckCircle />
            <span className="font-semibold uppercase tracking-wider text-xs">Pending Tasks</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-1">
            {loading ? '...' : stats.tasksPending}
          </h2>
          <p className="text-gray-500 text-sm mb-4">Tasks remaining for today</p>
          <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
            View Tasks
          </button>
        </div>

        {/* Upcoming Event Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <FiCalendar />
            <span className="font-semibold uppercase tracking-wider text-xs">Next Event</span>
          </div>

          {loading ? (
            <div className="animate-pulse h-20 bg-gray-100 rounded-xl"></div>
          ) : stats.nextEvent ? (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                {stats.nextEvent.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {formatDate(stats.nextEvent.start_date)}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FiClock />
                <span>{new Date(stats.nextEvent.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              <p>No upcoming events</p>
            </div>
          )}
        </div>

        {/* Quick Quote/Wisdom */}
        <div className="md:col-span-1 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-center text-center">
          <div>
            <p className="text-lg font-medium italic opacity-90 mb-2">
              "Chant the Holy Name and be happy."
            </p>
            <p className="text-sm opacity-75">- Srila Prabhupada</p>
          </div>
        </div>

      </div>

      {/* Temple Management Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiGrid className="text-saffron-500" />
          Temple Management
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Member Attendance */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-saffron-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <FiUsers size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Attendance</h3>
            <p className="text-xs text-gray-500 mt-1">Track member visits</p>
          </div>

          {/* Event Scheduling */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-saffron-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <FiCalendar size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Scheduling</h3>
            <p className="text-xs text-gray-500 mt-1">Manage temple events</p>
          </div>

          {/* Donations */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-saffron-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-100 transition-colors">
              <FiDollarSign size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Donations</h3>
            <p className="text-xs text-gray-500 mt-1">Manage contributions</p>
          </div>

          {/* Announcements */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-saffron-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
              <FiBell size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Announcements</h3>
            <p className="text-xs text-gray-500 mt-1">Notify community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;