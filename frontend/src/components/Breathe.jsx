import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '../utils/api';

const Breathe = () => {
  const [phase, setPhase] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0); // New state for total sessions

  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Breathing cycle timings (in milliseconds)
  const TIMINGS = {
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    holdEmpty: 2000,
  };

  // Initialize Web Audio API for peaceful background sound
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    fetchTotalSessions(); // Fetch total sessions on mount

    return () => {
      stopBackgroundSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const fetchTotalSessions = async () => {
    try {
      const res = await api.get('/breathe/history');
      if (res.data) {
        setTotalSessions(res.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch breathe history:', error);
    }
  };

  // Timer for total session time
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Main breathing cycle
  useEffect(() => {
    if (isActive) {
      runBreathingCycle();
      if (soundEnabled) {
        startBackgroundSound();
      }
    } else {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      stopBackgroundSound();
    }
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [isActive, soundEnabled]);

  const startBackgroundSound = () => {
    if (!audioContextRef.current || oscillatorRef.current) return;

    try {
      // Create a peaceful ambient sound (sine wave at low frequency)
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(432, audioContextRef.current.currentTime); // 432 Hz Healing frequency

      gainNodeRef.current.gain.setValueAtTime(0.05, audioContextRef.current.currentTime); // Very quiet

      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      oscillatorRef.current.start();
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  const stopBackgroundSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        console.error('Stop audio error:', error);
      }
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  const speakInstruction = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  };

  const runBreathingCycle = () => {
    // Inhale phase
    setPhase('inhale');
    speakInstruction('Breathe in slowly');

    phaseTimerRef.current = setTimeout(() => {
      // Hold phase
      setPhase('hold');
      speakInstruction('Hold');

      phaseTimerRef.current = setTimeout(() => {
        // Exhale phase
        setPhase('exhale');
        speakInstruction('Breathe out slowly');

        phaseTimerRef.current = setTimeout(() => {
          // Hold Empty phase
          setPhase('holdEmpty');
          speakInstruction('Hold');

          phaseTimerRef.current = setTimeout(() => {
            // Complete cycle
            setCycleCount(prev => prev + 1);
            if (isActive) {
              runBreathingCycle();
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
      window.speechSynthesis.cancel();
    } else {
      setIsActive(true);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('ready');
    setCycleCount(0);
    setTotalTime(0);
    window.speechSynthesis.cancel();
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdEmpty': return 'Hold';
      default: return 'Ready';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
      case 'hold':
        return 'scale-125';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

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
            <div className={`absolute inset-0 rounded-full border-4 border-blue-300/30 ${isActive ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full border-2 border-green-300/30 ${isActive ? 'animate-pulse' : ''}`}></div>

            {/* Main breathing circle */}
            <div className={`
              absolute inset-8 rounded-full 
              bg-gradient-to-br from-blue-400 via-green-400 to-purple-500
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
            <div className="text-4xl font-bold text-blue-600">{cycleCount}</div>
            <div className="text-sm text-gray-600 mt-1">Cycles</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50">
            <div className="text-4xl font-bold text-green-600">{formatTime(totalTime)}</div>
            <div className="text-sm text-gray-600 mt-1">Time</div>
          </div>
        </div>

        {/* Total Sessions Dashboard */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg border border-white/50 mb-8">
          <div className="text-4xl font-bold text-purple-600">{totalSessions}</div>
          <div className="text-sm text-gray-600 mt-1">Total Sessions Completed</div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleToggle}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl
              transition-all duration-300 hover:scale-105
              ${isActive
                ? 'bg-white text-gray-700 hover:bg-gray-50'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-2xl'
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

        {/* Sound Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
              ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
            `}
          >
            {soundEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            Background Sound
          </button>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
              ${voiceEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
            `}
          >
            {voiceEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            Voice Guide
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-3">How it works:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">↑</span>
              <span><strong>Inhale</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              <span><strong>Hold</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">↓</span>
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