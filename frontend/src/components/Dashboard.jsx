import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    japaCount: 0,
    japaRounds: 0,
    breatheMinutes: 0,
    streak: 0
  });
  const [quote, setQuote] = useState("Chant and be happy.");

  useEffect(() => {
    fetchRealtimeData();
    // Simulate a random quote change or fetch from API
    const quotes = [
      "Always remember Krishna, never forget Krishna.",
      "Chant the Holy Name and be happy.",
      "Service to humanity is service to God."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const fetchRealtimeData = async () => {
    try {
      const japaRes = await api.get('/japa/today');
      // Assuming you have a route for generic user stats or we calculate breathe locally for now
      // const userRes = await api.get('/user/stats'); 

      setStats({
        japaCount: japaRes.data?.count || 0,
        japaRounds: japaRes.data?.rounds || 0,
        breatheMinutes: 15, // Mock or fetch from API
        streak: 5 // Mock or fetch
      });
    } catch (err) {
      console.error("Dashboard sync error", err);
    }
  };

  return (
    <div className="dashboard-root min-h-screen bg-gray-50 p-4 pb-24">
      {/* Welcome Section */}
      <div className="welcome-banner bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-6">
        <h1 className="text-2xl font-bold">Hare Krishna, Devotee!</h1>
        <p className="opacity-90 mt-1 text-sm font-medium">{quote}</p>
      </div>

      {/* Realtime Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Japa Card - Yellow/Orange */}
        <Link to="/japa" className="transform transition hover:scale-[1.02]">
          <div className="dash-card bg-white border-l-8 border-yellow-500 rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Todays Japa</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">{stats.japaRounds} <span className="text-sm text-gray-400 font-normal">Rounds</span></h2>
              <p className="text-yellow-600 text-sm mt-1 font-medium">Total Beads: {(stats.japaRounds * 108) + stats.japaCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full text-3xl">📿</div>
          </div>
        </Link>

        {/* Breathe Card - Green */}
        <Link to="/breathe" className="transform transition hover:scale-[1.02]">
          <div className="dash-card bg-white border-l-8 border-green-500 rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Mindfulness</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">{stats.breatheMinutes} <span className="text-sm text-gray-400 font-normal">Mins</span></h2>
              <p className="text-green-600 text-sm mt-1 font-medium">Status: Calm</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full text-3xl">🧘</div>
          </div>
        </Link>

        {/* Community/Streak Card - Blue */}
        <Link to="/community" className="transform transition hover:scale-[1.02]">
          <div className="dash-card bg-white border-l-8 border-blue-500 rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Streak 🔥</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">{stats.streak} <span className="text-sm text-gray-400 font-normal">Days</span></h2>
              <p className="text-blue-600 text-sm mt-1 font-medium">Keep it up!</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-3xl">👥</div>
          </div>
        </Link>

        {/* Live Satsang Card - Red/Pink */}
        <Link to="/satsang" className="transform transition hover:scale-[1.02]">
          <div className="dash-card bg-white border-l-8 border-pink-500 rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Satsang</p>
              <h2 className="text-lg font-bold text-gray-800 mt-1">Live Now</h2>
              <p className="text-pink-600 text-sm mt-1 font-medium">Join Session &rarr;</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full text-3xl">🎥</div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default Dashboard;