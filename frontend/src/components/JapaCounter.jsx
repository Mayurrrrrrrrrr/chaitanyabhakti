import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiRefreshCw, FiVolume2, FiVolumeX, FiAward } from 'react-icons/fi';

const JapaCounter = () => {
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRipple, setShowRipple] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchJapaStats();
  }, []);

  const fetchJapaStats = async () => {
    try {
      const res = await api.get('/japa/today');
      if (res.data) {
        setCount(res.data.count || 0);
        setRounds(res.data.rounds || 0);
      }
    } catch (error) {
      console.error("Error fetching japa stats:", error);
    }
  };

  const handleChant = async () => {
    // Ripple effect
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);

    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const newCount = count + 1;

    if (newCount >= 108) {
      // Round completed!
      setCount(0);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      // Celebration
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      // Longer vibration
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      // Sync with backend
      try {
        await api.post('/japa/round', {
          timestamp: new Date(),
          count: 108
        });
      } catch (error) {
        console.error("Failed to sync round:", error);
      }
    } else {
      setCount(newCount);
    }
  };

  const resetCounter = () => {
    if (window.confirm("Reset current round?")) {
      setCount(0);
    }
  };

  // Calculate progress percentage
  const progress = (count / 108) * 100;
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-peacock bg-cover bg-center opacity-5"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-saffron-300/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="font-heading text-4xl font-bold text-saffron-600 mb-2">
              Round Complete!
            </h2>
            <p className="text-gray-600 text-xl">
              {rounds} rounds completed today
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiAward className="text-saffron-500 text-2xl" />
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Rounds</span>
            </div>
            <div className="text-5xl font-bold text-saffron-600">{rounds}</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📿</span>
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Beads Today</span>
            </div>
            <div className="text-5xl font-bold text-orange-600">{(rounds * 108) + count}</div>
          </div>
        </div>

        {/* Main Counter */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative w-96 h-96">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-saffron-400/30 rounded-full blur-3xl animate-pulse"></div>

            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
              {/* Background circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="#FFF8E1"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF9933" />
                  <stop offset="50%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#FF6F00" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Button */}
            <button
              onClick={handleChant}
              className="absolute inset-0 m-auto w-72 h-72 rounded-full bg-gradient-to-br from-saffron-400 via-saffron-500 to-orange-600 shadow-2xl flex flex-col items-center justify-center transform transition-all active:scale-95 hover:scale-105 focus:outline-none group border-8 border-white relative overflow-hidden"
            >
              {/* Ripple effect */}
              {showRipple && (
                <span className="absolute inset-0 bg-white rounded-full animate-ripple"></span>
              )}

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Count display */}
              <div className="relative z-10 text-center">
                <div className="text-8xl font-bold text-white drop-shadow-lg mb-2">
                  {count}
                </div>
                <div className="text-white/90 text-2xl font-medium mb-4">
                  / 108
                </div>
                <div className="text-white/70 text-sm uppercase tracking-widest">
                  Tap to Chant
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mantra Display */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 mb-8 text-center shadow-lg border border-white/50">
          <p className="font-heading text-2xl md:text-3xl text-saffron-700 font-bold">
            Hare Krishna Hare Krishna
          </p>
          <p className="font-heading text-2xl md:text-3xl text-saffron-700 font-bold">
            Krishna Krishna Hare Hare
          </p>
          <p className="font-heading text-2xl md:text-3xl text-saffron-700 font-bold mt-2">
            Hare Rama Hare Rama
          </p>
          <p className="font-heading text-2xl md:text-3xl text-saffron-700 font-bold">
            Rama Rama Hare Hare
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={resetCounter}
            className="p-4 bg-white/70 backdrop-blur-md rounded-2xl text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-lg border border-white/50"
            title="Reset Round"
          >
            <FiRefreshCw size={28} />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-4 backdrop-blur-md rounded-2xl transition-all shadow-lg border border-white/50 ${soundEnabled
                ? 'bg-saffron-100 text-saffron-600 hover:bg-saffron-200'
                : 'bg-white/70 text-gray-400 hover:bg-white'
              }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <FiVolume2 size={28} /> : <FiVolumeX size={28} />}
          </button>
        </div>

        {/* Quote */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 italic text-lg">
            "Chant the Holy Name and be happy" 🙏
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default JapaCounter;