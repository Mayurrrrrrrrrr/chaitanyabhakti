// frontend/src/components/Breathe.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiWind, FiClock } from 'react-icons/fi';

const Breathe = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [selectedTechnique, setSelectedTechnique] = useState('box'); // box, 478, relax

  const techniques = {
    box: { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, color: 'text-blue-500' },
    '478': { name: '4-7-8 Relax', inhale: 4, hold1: 7, exhale: 8, hold2: 0, color: 'text-green-500' },
    relax: { name: 'Coherent', inhale: 6, hold1: 0, exhale: 6, hold2: 0, color: 'text-purple-500' }
  };

  const timerRef = useRef(null);
  const currentTech = techniques[selectedTechnique];

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;

          // Phase transition
          handlePhaseTransition();
          return 0; // Will be reset in handlePhaseTransition
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, phase, selectedTechnique]);

  const handlePhaseTransition = () => {
    const tech = techniques[selectedTechnique];

    if (phase === 'Inhale') {
      if (tech.hold1 > 0) {
        setPhase('Hold');
        setTimeLeft(tech.hold1);
      } else {
        setPhase('Exhale');
        setTimeLeft(tech.exhale);
      }
    } else if (phase === 'Hold' && tech.hold1 > 0 && tech.hold2 > 0) {
      // This logic is tricky for generalized phases. Simplified:
      // If we just finished Hold1, go to Exhale
      setPhase('Exhale');
      setTimeLeft(tech.exhale);
    } else if (phase === 'Hold' && tech.hold1 > 0 && tech.hold2 === 0) {
      // 4-7-8 case: Inhale -> Hold -> Exhale -> (Loop)
      setPhase('Exhale');
      setTimeLeft(tech.exhale);
    } else if (phase === 'Exhale') {
      if (tech.hold2 > 0) {
        setPhase('Hold (Empty)');
        setTimeLeft(tech.hold2);
      } else {
        setPhase('Inhale');
        setTimeLeft(tech.inhale);
        setCycleCount(c => c + 1);
      }
    } else if (phase === 'Hold (Empty)') {
      setPhase('Inhale');
      setTimeLeft(tech.inhale);
      setCycleCount(c => c + 1);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimeLeft(techniques[selectedTechnique].inhale);
    setCycleCount(0);
  };

  const changeTechnique = (techKey) => {
    setIsActive(false);
    setSelectedTechnique(techKey);
    setPhase('Inhale');
    setTimeLeft(techniques[techKey].inhale);
    setCycleCount(0);
  };

  // Visual scaling calculation
  const getScale = () => {
    if (phase === 'Inhale') return 1 + ((currentTech.inhale - timeLeft) / currentTech.inhale) * 0.5;
    if (phase === 'Hold') return 1.5;
    if (phase === 'Exhale') return 1.5 - ((currentTech.exhale - timeLeft) / currentTech.exhale) * 0.5;
    return 1;
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-heading flex items-center justify-center gap-2">
          <FiWind className="text-saffron-500" /> Breathe
        </h1>
        <p className="text-gray-500">Center your mind and body</p>
      </div>

      {/* Technique Selector */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
        {Object.entries(techniques).map(([key, tech]) => (
          <button
            key={key}
            onClick={() => changeTechnique(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTechnique === key
                ? 'bg-white text-saffron-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tech.name}
          </button>
        ))}
      </div>

      {/* Main Circle Animation */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Outer pulsing rings */}
        <div
          className={`absolute inset-0 rounded-full opacity-20 transition-transform duration-1000 ${isActive ? 'bg-saffron-400' : 'bg-gray-200'}`}
          style={{ transform: `scale(${getScale()})` }}
        />
        <div
          className={`absolute inset-4 rounded-full opacity-30 transition-transform duration-1000 delay-75 ${isActive ? 'bg-saffron-500' : 'bg-gray-300'}`}
          style={{ transform: `scale(${getScale()})` }}
        />

        {/* Center Circle */}
        <div className="relative z-10 w-48 h-48 bg-white rounded-full shadow-xl flex flex-col items-center justify-center border-4 border-saffron-50">
          <span className={`text-2xl font-bold mb-1 transition-colors duration-500 ${isActive ? 'text-saffron-600' : 'text-gray-400'}`}>
            {phase}
          </span>
          <span className="text-6xl font-bold text-gray-800 font-mono">
            {timeLeft}
          </span>
          <span className="text-xs text-gray-400 mt-2">seconds</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 mb-8 text-gray-600">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-800">{cycleCount}</span>
          <span className="text-xs uppercase tracking-wider">Cycles</span>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-800">
            {Math.floor((cycleCount * (currentTech.inhale + currentTech.exhale + currentTech.hold1 + currentTech.hold2)) / 60)}:
            {((cycleCount * (currentTech.inhale + currentTech.exhale + currentTech.hold1 + currentTech.hold2)) % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-xs uppercase tracking-wider">Time</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95
            ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-saffron-500 hover:bg-saffron-600'}
          `}
        >
          {isActive ? <FiPause size={28} /> : <FiPlay size={28} className="ml-1" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <FiRefreshCw size={24} />
        </button>
      </div>
    </div>
  );
};

export default Breathe;