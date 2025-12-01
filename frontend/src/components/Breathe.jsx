import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.js';

const Breathe = () => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const timerRef = useRef(null);

  const BREATH_TIMINGS = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 2
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const runPhase = (currentPhase) => {
    setPhase(currentPhase);

    let duration = 0;
    let nextPhase = '';

    switch (currentPhase) {
      case 'inhale':
        duration = BREATH_TIMINGS.inhale;
        nextPhase = 'hold';
        break;
      case 'hold':
        duration = BREATH_TIMINGS.hold;
        nextPhase = 'exhale';
        break;
      case 'exhale':
        duration = BREATH_TIMINGS.exhale;
        nextPhase = 'holdEmpty';
        break;
      case 'holdEmpty':
        duration = BREATH_TIMINGS.holdEmpty;
        nextPhase = 'inhale';
        setCycleCount(c => c + 1);
        break;
      default:
        return;
    }

    setTimeLeft(duration);

    // Start countdown for this phase
    let counter = duration;
    const countdownInterval = setInterval(() => {
      counter -= 1;
      setTimeLeft(counter);
      if (counter <= 0) clearInterval(countdownInterval);
    }, 1000);

    // Schedule next phase
    timerRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
      if (isActive) {
        runPhase(nextPhase);
      }
    }, duration * 1000);
  };

  const toggleBreathing = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('ready');
      setTimeLeft(0);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setIsActive(true);
      setCycleCount(0);
      runPhase('inhale');
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case 'ready': return 'Press Start';
      case 'inhale': return t('breatheIn') || 'Breathe In';
      case 'hold': return t('hold') || 'Hold';
      case 'exhale': return t('breatheOut') || 'Breathe Out';
      case 'holdEmpty': return 'Relax';
      default: return '';
    }
  };

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale': return 'border-blue-500 scale-110';
      case 'hold': return 'border-yellow-500 scale-110';
      case 'exhale': return 'border-green-500 scale-100';
      case 'holdEmpty': return 'border-slate-400 scale-100';
      default: return 'border-slate-300';
    }
  }

  const getRippleColor = () => {
    if (phase === 'inhale') return 'bg-blue-500';
    if (phase === 'exhale') return 'bg-green-500';
    return 'hidden';
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl shadow-sm">
      <style>{`
        @keyframes ripple {
          0% { width: 100%; height: 100%; opacity: 0.4; }
          100% { width: 150%; height: 150%; opacity: 0; }
        }
        .animate-ripple {
          animation: ripple 2s infinite;
        }
        .animate-ripple-delay {
          animation: ripple 2s infinite 0.5s;
        }
      `}</style>

      <div className={`relative w-72 h-72 bg-white rounded-full flex items-center justify-center transition-all duration-1000 border-8 shadow-2xl z-10 ${getCircleColor()}`}>
        <div className="text-center z-20">
          <h2 className="text-3xl font-bold text-slate-700 mb-2 transition-all">{getInstruction()}</h2>
          {isActive && <span className="text-5xl font-mono text-blue-600 font-semibold">{timeLeft}s</span>}
        </div>

        {/* Ripples */}
        {isActive && (phase === 'inhale' || phase === 'exhale') && (
          <>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full opacity-20 -z-10 animate-ripple ${getRippleColor()}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full opacity-20 -z-10 animate-ripple-delay ${getRippleColor()}`}></div>
          </>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mt-12 grid grid-cols-2 gap-6 w-full">
        <div className="bg-white p-4 rounded-2xl shadow-sm text-center border-b-4 border-yellow-400">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Cycles</span>
          <span className="text-3xl font-bold text-slate-800">{cycleCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm text-center border-b-4 border-green-400">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phase</span>
          <span className="text-xl font-bold text-green-600 capitalize">{phase}</span>
        </div>
      </div>

      <button
        onClick={toggleBreathing}
        className={`mt-10 px-10 py-4 rounded-full text-white font-bold text-xl transition-all transform hover:scale-105 shadow-lg active:scale-95 w-full max-w-xs ${isActive
            ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-red-200'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-200'
          }`}
      >
        {isActive ? 'Stop Session' : 'Start Breathing'}
      </button>
    </div>
  );
};

export default Breathe;