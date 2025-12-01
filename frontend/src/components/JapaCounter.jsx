import React, { useState, useEffect } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../utils/api';
import { FiRefreshCw, FiVolume2, FiVolumeX } from 'react-icons/fi';

const JapaCounter = () => {
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [beadAudio] = useState(new Audio('/sounds/bead-click.mp3')); // Ensure this file exists or remove

  // Sync with backend
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/japa/today');
      if (res.data) {
        setCount(res.data.count || 0);
        setRounds(res.data.rounds || 0);
      }
    } catch (error) {
      console.error("Error fetching japa stats");
    }
  };

  const handleChant = async () => {
    const newCount = count + 1;
    let newRounds = rounds;

    // Play sound
    if (soundEnabled) {
      beadAudio.currentTime = 0;
      beadAudio.play().catch(() => { });
    }

    // Vibration
    if (navigator.vibrate) navigator.vibrate(50);

    if (newCount >= 108) {
      newRounds += 1;
      setCount(0);
      setRounds(newRounds);

      // Round completion vibration
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

      try {
        await api.post('/japa/round', { timestamp: new Date() });
      } catch (e) {
        console.error("Failed to sync round", e);
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

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-fadeIn">

      {/* Header Stats */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-secondary-500 flex flex-col items-center">
          <span className="text-xs font-bold text-secondary-600 uppercase tracking-wider">Total Rounds</span>
          <span className="text-4xl font-bold text-slate-800">{rounds}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-primary-500 flex flex-col items-center">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Beads Today</span>
          <span className="text-4xl font-bold text-slate-800">{(rounds * 108) + count}</span>
        </div>
      </div>

      {/* Main Counter */}
      <div className="relative w-80 h-80">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-secondary-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

        <CircularProgressbarWithChildren
          value={count}
          maxValue={108}
          strokeWidth={6}
          styles={buildStyles({
            pathColor: '#eab308', // Yellow-500
            trailColor: '#f1f5f9', // Slate-100
            pathTransitionDuration: 0.15,
            strokeLinecap: 'round',
          })}
        >
          {/* Interactive Button */}
          <button
            onClick={handleChant}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 shadow-[0_10px_40px_-10px_rgba(234,179,8,0.5)] flex flex-col items-center justify-center transform transition-all active:scale-95 hover:scale-105 focus:outline-none group relative overflow-hidden border-4 border-white"
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <span className="text-7xl font-bold text-white drop-shadow-lg font-heading">{count}</span>
            <span className="text-secondary-100 font-medium mt-2">/ 108</span>
            <span className="text-xs text-white/60 mt-4 uppercase tracking-widest">Tap to Chant</span>
          </button>
        </CircularProgressbarWithChildren>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={resetCounter}
          className="p-4 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all"
          title="Reset Round"
        >
          <FiRefreshCw size={24} />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-4 rounded-full shadow-sm transition-all ${soundEnabled
              ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          title="Toggle Sound"
        >
          {soundEnabled ? <FiVolume2 size={24} /> : <FiVolumeX size={24} />}
        </button>
      </div>

      <p className="text-slate-400 text-sm italic">
        "Chant the Holy Name and be happy"
      </p>
    </div>
  );
};

export default JapaCounter;