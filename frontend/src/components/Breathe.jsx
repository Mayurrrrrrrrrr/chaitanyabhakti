import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';

const Breathe = () => {
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale, holdEmpty
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);

  // Breathing cycle timings (in milliseconds)
  const TIMINGS = {
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    holdEmpty: 2000,
  };

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      runBreathingCycle();
    } else {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    }
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [isActive]);

  const runBreathingCycle = () => {
    // Inhale phase
    setPhase('inhale');
    phaseTimerRef.current = setTimeout(() => {
      // Hold phase
      setPhase('hold');
      phaseTimerRef.current = setTimeout(() => {
        // Exhale phase
        setPhase('exhale');
        phaseTimerRef.current = setTimeout(() => {
          // Hold Empty phase
          setPhase('holdEmpty');
          phaseTimerRef.current = setTimeout(() => {
            // Complete cycle
            setCycleCount(prev => prev + 1);
            if (isActive) {
              runBreathingCycle(); // Start next cycle
            }
          }, TIMINGS.holdEmpty);
        }, TIMINGS.exhale);
      }, TIMINGS.hold);
    }, TIMINGS.inhale);
  };

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('ready');
    } else {
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('ready');
    setCycleCount(0);
    setTotalTime(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'holdEmpty':
        return 'Hold';
      default:
        return 'Ready';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-125';
      case 'hold':
        return 'scale-125';
      case 'exhale':
        return 'scale-100';
      case 'holdEmpty':
        return 'scale-100';
      default:
        return 'scale-100';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tulsi-50 via-krishna-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-lotus bg-cover bg-center opacity-5"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-tulsi-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-krishna-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Mindful Breathing
          </h1>
          <p className="text-gray-600 text-lg">
            4-4-4-2 Breathing Technique
          </p>
        </div>

        {/* Breathing Circle */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            {/* Outer rings */}
            <div className={`absolute inset-0 rounded-full border-4 border-tulsi-300/30 ${isActive ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full border-2 border-krishna-300/30 ${isActive ? 'animate-pulse' : ''}`}></div>

            {/* Main breathing circle */}
            <div className={`
              absolute inset-8 rounded-full 
              bg-gradient-to-br from-tulsi-400 via-krishna-400 to-blue-500
              shadow-2xl
              flex items-center justify-center
              transition-transform duration-[4000ms] ease-in-out
              ${getCircleScale()}
            `}>
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>

              {/* Phase text */}
              <div className="relative z-10 text-center">
                <div className="text-white text-6xl md:text-7xl font-bold mb-4 animate-pulse">
                  {phase === 'inhale' && '↑'}
                  {phase === 'hold' && '●'}
                  {phase === 'exhale' && '↓'}
                  {phase === 'holdEmpty' && '○'}
                  {phase === 'ready' && '✨'}
                </div>
                <div className="text-white text-2xl md:text-3xl font-heading font-bold">
                  {getPhaseText()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="text-4xl font-bold text-tulsi-600">{cycleCount}</div>
            <div className="text-sm text-gray-600 mt-1">Cycles</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="text-4xl font-bold text-krishna-600">{formatTime(totalTime)}</div>
            <div className="text-sm text-gray-600 mt-1">Time</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleToggle}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl
              transition-all duration-300 hover:scale-105
              ${isActive
                ? 'bg-white text-gray-700 hover:bg-gray-50'
                : 'bg-gradient-to-r from-tulsi-500 to-krishna-500 text-white hover:shadow-2xl'
              }
            `}
          >
            {isActive ? (
              <>
                <FiPause size={24} />
                Pause
              </>
            ) : (
              <>
                <FiPlay size={24} />
                Start
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-4 bg-white/70 backdrop-blur-md rounded-2xl text-gray-600 hover:text-gray-800 hover:bg-white transition-all shadow-lg border border-white/50"
            title="Reset"
          >
            <FiRefreshCw size={24} />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-3">How it works:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-tulsi-500">↑</span>
              <span><strong>Inhale</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-krishna-500">●</span>
              <span><strong>Hold</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">↓</span>
              <span><strong>Exhale</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-500">○</span>
              <span><strong>Hold Empty</strong> for 2 seconds</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Breathe;