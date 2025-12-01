import React, { useState, useEffect } from 'react';
import { FiWind, FiPlay, FiPause, FiRefreshCcw } from 'react-icons/fi';

const Breathe = () => {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // Breathing Cycle: 4-7-8 Technique
  // Inhale: 4s, Hold: 7s, Exhale: 8s
  const cycleDurations = {
    Inhale: 4,
    Hold1: 7,
    Exhale: 8,
    Hold2: 0 // 4-7-8 doesn't have a post-exhale hold usually
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  useEffect(() => {
    if (!isActive) return;

    let mounted = true;

    const runCycle = async () => {
      if (!mounted) return;
      // Inhale
      setPhase('Inhale');
      await new Promise(r => setTimeout(r, 4000));

      if (!mounted || !isActive) return;
      // Hold
      setPhase('Hold');
      await new Promise(r => setTimeout(r, 7000));

      if (!mounted || !isActive) return;
      // Exhale
      setPhase('Exhale');
      await new Promise(r => setTimeout(r, 8000));

      if (mounted && isActive) {
        setCycleCount(c => c + 1);
        runCycle(); // Loop
      }
    };

    runCycle();

    return () => { mounted = false; };
  }, [isActive]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 animate-fadeIn">

      <div className="text-center space-y-2">
        <h2 className="font-heading text-3xl font-bold text-primary-900">Mindful Breathing</h2>
        <p className="text-slate-500">4-7-8 Technique for Deep Relaxation</p>
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rings */}
        <div className={`absolute w-64 h-64 rounded-full border-2 border-primary-200 ${isActive ? 'animate-ping opacity-20' : 'opacity-0'}`}></div>
        <div className={`absolute w-80 h-80 rounded-full border border-primary-100 ${isActive ? 'animate-pulse opacity-30' : 'opacity-0'}`}></div>

        {/* Main Circle */}
        <div
          className={`
            w-48 h-48 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-2xl flex items-center justify-center relative z-10 transition-all duration-[4000ms] ease-in-out
            ${isActive && phase === 'Inhale' ? 'scale-125 shadow-primary-500/50' : ''}
            ${isActive && phase === 'Exhale' ? 'scale-90 shadow-primary-500/20' : ''}
          `}
        >
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>

          <div className="text-center text-white relative z-20">
            <FiWind size={32} className="mx-auto mb-2 opacity-80" />
            <span className="text-xl font-bold tracking-widest uppercase">{isActive ? phase : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1
            ${isActive
              ? 'bg-white text-slate-600 hover:bg-slate-50'
              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-500/30'
            }
          `}
        >
          {isActive ? <><FiPause /> Pause</> : <><FiPlay /> Start</>}
        </button>

        <button
          onClick={() => { setIsActive(false); setTimer(0); setCycleCount(0); setPhase('Inhale'); }}
          className="p-3 rounded-full bg-white text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors shadow-sm"
          title="Reset"
        >
          <FiRefreshCcw size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-8 text-center">
        <div>
          <span className="block text-2xl font-bold text-slate-700">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Time</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-slate-700">{cycleCount}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Cycles</span>
        </div>
      </div>
    </div>
  );
};

export default Breathe;