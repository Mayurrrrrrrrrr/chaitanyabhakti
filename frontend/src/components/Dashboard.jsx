import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiRepeat, FiWind, FiMusic, FiZap, FiSun, FiHeart, FiTrendingUp, FiCheckCircle, FiCircle, FiCalendar } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    japaToday: 0,
    japaStreak: 0,
    totalJapa: 0,
    breatheMinutes: 0,
    breatheSessions: 0,
    tasksCompleted: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
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
      setLoading(true);

      // Fetch Japa Stats
      try {
        const japaRes = await api.get('/japa/today');
        if (japaRes.data) {
          setStats(prev => ({
            ...prev,
            japaToday: japaRes.data.rounds || japaRes.data.malas || 0,
            japaStreak: japaRes.data.streak || japaRes.data.current_streak || 0,
            totalJapa: japaRes.data.total_rounds || japaRes.data.total_malas || 0,
          }));
        }
      } catch (japaErr) {
        console.error('Japa fetch error:', japaErr);
      }

      // Fetch Breathe Stats
      try {
        const breatheRes = await api.get('/breathe/stats');
        if (breatheRes.data) {
          setStats(prev => ({
            ...prev,
            breatheMinutes: breatheRes.data.total_minutes || breatheRes.data.minutes_today || 0,
            breatheSessions: breatheRes.data.sessions_today || breatheRes.data.total_sessions || 0,
          }));
        }
      } catch (breatheErr) {
        console.error('Breathe fetch error:', breatheErr);
      }

      // Fetch Pending Tasks
      try {
        const tasksRes = await api.get('/tasks');
        const pendingTasks = (tasksRes.data || []).filter(t => !t.is_completed).slice(0, 5);
        setTasks(pendingTasks);
      } catch (tasksErr) {
        console.error('Tasks fetch error:', tasksErr);
      }

      // Fetch Upcoming Events
      try {
        const eventsRes = await api.get('/events');
        const today = new Date();
        const upcoming = (eventsRes.data || [])
          .filter(e => new Date(e.start_date) >= today)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          .slice(0, 5);
        setUpcomingEvents(upcoming);
      } catch (eventsErr) {
        console.error('Events fetch error:', eventsErr);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      await api.put(`/tasks/${task.task_id}`, { is_completed: !task.is_completed });
      fetchDashboardData();
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-orange-50 via-blue-50 to-pink-50">
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
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
            >
              <FiTrendingUp />
              Refresh Stats
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm text-gray-600">🧘 {stats.breatheSessions} sessions today</p>
              </div>
            </div>
          </Link>

          <Link to="/satsang" className="group">
            <div className="h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiMusic className="text-blue-600 text-2xl" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">Satsang</h3>
              <p className="text-gray-600 text-sm">Daily spiritual discourse</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-blue-600 font-medium">🎵 Watch Now →</p>
              </div>
            </div>
          </Link>

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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-gray-800">Pending Seva</h2>
              <Link to="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending tasks</p>
                <Link to="/tasks" className="text-blue-600 text-sm mt-2 inline-block">Create a task →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.task_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <button
                      onClick={() => toggleTask(task)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {task.is_completed ? <FiCheckCircle size={24} /> : <FiCircle size={24} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{task.description}</p>
                      {task.task_type && (
                        <span className="text-xs text-gray-500">{task.task_type}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-gray-800">Upcoming Events</h2>
              <Link to="/calendar" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View Calendar →
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.event_id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FiCalendar className="text-orange-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(event.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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