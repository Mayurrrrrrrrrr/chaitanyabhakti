import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { FiActivity, FiWind, FiUsers, FiMusic, FiArrowRight } from 'react-icons/fi';

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
    const quotes = [
      "Always remember Krishna, never forget Krishna.",
      "Chant the Holy Name and be happy.",
      "Service to humanity is service to God.",
      "The soul is eternal, full of knowledge and bliss."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const fetchRealtimeData = async () => {
    try {
      const japaRes = await api.get('/japa/today');
      setStats({
        japaCount: japaRes.data?.count || 0,
        japaRounds: japaRes.data?.rounds || 0,
        breatheMinutes: 15, // Mock
        streak: 5 // Mock
      });
    } catch (err) {
      console.error("Dashboard sync error", err);
    }
  };

  const cards = [
    {
      to: "/japa",
      title: "Today's Japa",
      value: `${stats.japaRounds} Rounds`,
      subValue: `${(stats.japaRounds * 108) + stats.japaCount} Beads`,
      icon: FiActivity,
      color: "from-yellow-400 to-yellow-600",
      textColor: "text-yellow-900",
      bgLight: "bg-yellow-50"
    },
    {
      to: "/breathe",
      title: "Mindfulness",
      value: `${stats.breatheMinutes} Mins`,
      subValue: "Status: Calm",
      icon: FiWind,
      color: "from-green-400 to-green-600",
      textColor: "text-green-900",
      bgLight: "bg-green-50"
    },
    {
      to: "/community",
      title: "Streak",
      value: `${stats.streak} Days`,
      subValue: "Keep it up!",
      icon: FiUsers,
      color: "from-blue-400 to-blue-600",
      textColor: "text-blue-900",
      bgLight: "bg-blue-50"
    },
    {
      to: "/satsang",
      title: "Live Satsang",
      value: "Join Now",
      subValue: "Daily Wisdom",
      icon: FiMusic,
      color: "from-pink-400 to-pink-600",
      textColor: "text-pink-900",
      bgLight: "bg-pink-50"
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 to-primary-800 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            Hare Krishna, Devotee! 🙏
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl italic">
            "{quote}"
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-secondary-500/20 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.to}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <card.icon size={80} className={card.textColor} />
            </div>

            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={24} />
              </div>

              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className={`text-sm font-medium mt-1 ${card.textColor.replace('900', '600')}`}>
                {card.subValue}
              </p>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <div className={`p-2 rounded-full ${card.bgLight} ${card.textColor}`}>
                <FiArrowRight />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity / Quick Actions Section could go here */}
    </div>
  );
};

export default Dashboard;