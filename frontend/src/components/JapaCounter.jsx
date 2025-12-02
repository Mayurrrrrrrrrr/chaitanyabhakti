import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiRefreshCw, FiVolume2, FiVolumeX, FiAward } from 'react-icons/fi';

const JapaCounter = () => {
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRipple, setShowRipple] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [manualRounds, setManualRounds] = useState(''); // State for manual entry

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
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const newCount = count + 1;

    if (newCount >= 108) {
      setCount(0);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      try {
        await api.post('/japa', {
          rounds: newRounds,
          japa_date: new Date().toISOString().split('T')[0]
        });
        console.log('✅ Round saved successfully');
      } catch (error) {
        console.error("Failed to sync round:", error);
        alert('Failed to save round. Please check your connection.');
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

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualRounds || isNaN(manualRounds)) return;

    try {
      const roundsToAdd = parseInt(manualRounds);
      const newTotalRounds = rounds + roundsToAdd;

      await api.post('/japa', {
        rounds: newTotalRounds,
        japa_date: new Date().toISOString().split('T')[0]
      });

      setRounds(newTotalRounds);
      setManualRounds('');
      alert('Rounds added successfully!');
    } catch (error) {
      console.error('Failed to add rounds:', error);
      alert('Failed to add rounds');
    }
  };

  const progress = (count / 108) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-300 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="font-heading text-4xl font-bold text-yellow-600 mb-2">Round Complete!</h2>
            <p className="text-gray-600 text-xl">{rounds} rounds completed today</p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl">
        {/* Maha Mantra at Top - SEPARATE CARD */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 mb-8 text-center shadow-xl border-2 border-yellow-200">
          <p className="font-heading text-3xl md:text-4xl text-yellow-700 font-bold leading-relaxed">
            हरे कृष्ण हरे कृष्ण<br />
            कृष्ण कृष्ण हरे हरे<br />
            हरे राम हरे राम<br />
            राम राम हरे हरे
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiAward className="text-yellow-500 text-2xl" />
              <span className="text-sm font-bold text-gray-600 uppercase">Total Rounds</span>
            </div>
            <div className="text-5xl font-bold text-yellow-600">{rounds}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📿</span>
              <span className="text-sm font-bold text-gray-600 uppercase">Total Beads</span>
            </div>
            <div className="text-5xl font-bold text-orange-600">{(rounds * 108) + count}</div>
          </div>
        </div>

        {/* SINGLE COUNTER CIRCLE */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            {/* Single Click Button with Progress Ring */}
            <button
              onClick={handleChant}
              className="relative w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 shadow-2xl flex flex-col items-center justify-center transform transition-all active:scale-95 hover:scale-105 focus:outline-none group border-8 border-white overflow-hidden"
            >
              {/* Ripple Effect */}
              {showRipple && (
                <span className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping"></span>
              )}

              {/* Glow */}
              <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-3xl animate-pulse"></div>

              {/* Progress Ring SVG - ON TOP */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>

              {/* Center Content */}
              <div className="relative z-10 text-center">
                <div className="text-8xl md:text-9xl font-bold text-white drop-shadow-2xl mb-2">
                  {count}
                </div>
                <div className="text-white/90 text-2xl md:text-3xl font-medium mb-4">
                  / 108
                </div>
                <div className="text-white/80 text-sm md:text-base uppercase tracking-widest font-semibold">
                  Tap to Chant
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={resetCounter}
            className="p-4 bg-white/80 backdrop-blur-md rounded-2xl text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-lg border border-gray-200"
            title="Reset Round"
          >
            <FiRefreshCw size={28} />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-4 backdrop-blur-md rounded-2xl transition-all shadow-lg border ${soundEnabled
              ? 'bg-yellow-100 text-yellow-600 border-yellow-200'
              : 'bg-white/80 text-gray-400 border-gray-200'
              }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <FiVolume2 size={28} /> : <FiVolumeX size={28} />}
          </button>
        </div>

        {/* Quote */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 italic text-lg font-medium">
            "Chant the Holy Name and be happy" 🙏
          </p>
        </div>

        {/* Manual Entry Form */}
        <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-yellow-200">
          <h3 className="font-heading text-lg font-bold text-gray-800 mb-4 text-center">Add Offline Rounds</h3>
          <form onSubmit={handleManualAdd} className="flex gap-2 justify-center">
            <input
              type="number"
              value={manualRounds}
              onChange={(e) => setManualRounds(e.target.value)}
              placeholder="Ex: 1"
              className="w-24 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none text-center"
              min="1"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors shadow-md"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JapaCounter;