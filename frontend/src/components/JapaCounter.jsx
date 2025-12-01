import React, { useState, useEffect } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../utils/api';
import './JapaCounter.css';

const JapaCounter = () => {
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [beadAudio] = useState(new Audio('/sounds/bead-click.mp3')); // Optional sound

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

    // Play subtle sound if you have it, else ignore
    // beadAudio.play().catch(e => {}); 

    if (newCount >= 108) {
      newRounds += 1;
      setCount(0);
      setRounds(newRounds);
      // Trigger vibration on mobile
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      await api.post('/japa/round', { timestamp: new Date() });
    } else {
      setCount(newCount);
      if (navigator.vibrate) navigator.vibrate(50);
    }

    // Debounce API call for individual beads usually, 
    // but for simplicity we can sync periodically or just rely on local state + background sync.
    // Here implies immediate round sync, local bead state.
  };

  const resetCounter = () => {
    if (window.confirm("Reset current round?")) {
      setCount(0);
    }
  };

  return (
    <div className="japa-layout min-h-screen flex flex-col items-center justify-between pb-20 pt-6 bg-gradient-to-b from-yellow-50 via-white to-blue-50">

      {/* Header Stats */}
      <div className="w-full max-w-md px-6 grid grid-cols-2 gap-4">
        <div className="stat-card bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500">
          <p className="text-xs font-bold uppercase tracking-wider">Total Rounds</p>
          <p className="text-3xl font-bold">{rounds}</p>
        </div>
        <div className="stat-card bg-blue-100 text-blue-800 border-l-4 border-blue-500">
          <p className="text-xs font-bold uppercase tracking-wider">Beads Today</p>
          <p className="text-3xl font-bold">{(rounds * 108) + count}</p>
        </div>
      </div>

      {/* Main Bead Interaction */}
      <div className="main-counter-wrapper w-72 h-72 relative mt-8 mb-8">
        <CircularProgressbarWithChildren
          value={count}
          maxValue={108}
          strokeWidth={8}
          styles={buildStyles({
            pathColor: `rgba(34, 197, 94, ${count / 108})`, // Green transitioning opacity
            trailColor: '#e2e8f0',
            pathTransitionDuration: 0.1,
          })}
        >
          {/* Central Tap Area */}
          <button
            onClick={handleChant}
            className="bead-button w-56 h-56 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner flex flex-col items-center justify-center transform transition active:scale-95 focus:outline-none"
          >
            <span className="text-6xl font-bold text-white drop-shadow-md">{count}</span>
            <span className="text-sm text-yellow-100 mt-2">/ 108</span>
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-30 pointer-events-none"></div>
          </button>
        </CircularProgressbarWithChildren>
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-md px-8 flex justify-between items-center">
        <button onClick={resetCounter} className="text-gray-400 hover:text-red-500 font-medium text-sm transition">
          Reset Round
        </button>
        <div className="text-center">
          <p className="text-gray-500 text-xs italic">Tap the yellow circle to chant</p>
        </div>
      </div>
    </div>
  );
};

export default JapaCounter;