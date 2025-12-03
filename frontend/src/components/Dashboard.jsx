// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    japaCount: 0,
    tasksPending: 0,
    nextEvent: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      // Filter for future events and sort by date
      const now = new Date();
      const futureEvents = eventsRes.data
        .filter(e => new Date(e.start_date) >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;

      setStats({
        japaCount: todayJapa,
        tasksPending: pendingTasks,
        nextEvent: nextEvent
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="md:col-span-2 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-center text-center">
          <div>
            <p className="text-lg font-medium italic opacity-90 mb-2">
              "Chant the Holy Name and be happy."
            </p>
            <p className="text-sm opacity-75">- Srila Prabhupada</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;