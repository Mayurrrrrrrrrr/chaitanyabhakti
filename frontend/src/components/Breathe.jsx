import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiVolume2, FiVolumeX } from 'react-icons/fi';

const Breathe = () => {
  const [phase, setPhase] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const phaseTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const whiteNoiseNodeRef = useRef(null);

  const TIMINGS = {
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    holdEmpty: 2000,
  };

  useEffect(() => {
    // Initialize audio context
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return () => {
      stopNaturalSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
      if (soundEnabled) {
        startNaturalSound();
      }
    } else {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      stopNaturalSound();
    }
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      if (soundEnabled) {
        startNaturalSound();
      } else {
        stopNaturalSound();
      }
    }
  }, [soundEnabled]);

  const startNaturalSound = async () => {
    if (!audioContextRef.current || whiteNoiseNodeRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const bufferSize = 2 * audioContextRef.current.sampleRate;
      const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate pink noise (more natural than white noise)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // Reduce volume
        b6 = white * 0.115926;
      }

      // Create buffer source
      const whiteNoise = audioContextRef.current.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Create low-pass filter for ocean wave effect
      const filter = audioContextRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800; // Ocean-like frequency

      // Create gain node
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);

      // Create LFO for wave-like modulation
      const lfo = audioContextRef.current.createOscillator();
      lfo.frequency.value = 0.2; // Slow wave motion
      const lfoGain = audioContextRef.current.createGain();
      lfoGain.gain.value = 200; // Modulation depth

      // Connect nodes
      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Start playback
      whiteNoise.start();
      lfo.start();

      whiteNoiseNodeRef.current = { whiteNoise, filter, gainNode, lfo, lfoGain };

      console.log('Natural ocean sound started');
    } catch (error) {
      console.error('Audio start error:', error);
    }
  };

  const stopNaturalSound = () => {
    try {
      if (whiteNoiseNodeRef.current) {
        whiteNoiseNodeRef.current.whiteNoise.stop();
        whiteNoiseNodeRef.current.lfo.stop();
        whiteNoiseNodeRef.current.whiteNoise.disconnect();
        whiteNoiseNodeRef.current.filter.disconnect();
        whiteNoiseNodeRef.current.gainNode.disconnect();
        whiteNoiseNodeRef.current.lfo.disconnect();
        whiteNoiseNodeRef.current.lfoGain.disconnect();
        whiteNoiseNodeRef.current = null;
        console.log('Natural sound stopped');
      }
    } catch (error) {
      console.error('Stop audio error:', error);
    }
  };

  const speakInstruction = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const calmVoice = voices.find(voice =>
      voice.name.includes('Female') || voice.name.includes('Samantha')
    );
    if (calmVoice) utterance.voice = calmVoice;

    window.speechSynthesis.speak(utterance);
  };

  const runBreathingCycle = () => {
    setPhase('inhale');
    speakInstruction('Breathe in slowly');

    phaseTimerRef.current = setTimeout(() => {
      setPhase('hold');
      speakInstruction('Hold');

      phaseTimerRef.current = setTimeout(() => {
        setPhase('exhale');
        speakInstruction('Breathe out slowly');

        phaseTimerRef.current = setTimeout(() => {
          setPhase('holdEmpty');
          speakInstruction('Hold');

          phaseTimerRef.current = setTimeout(() => {
            setCycleCount(prev => prev + 1);
            if (isActive) {
              runBreathingCycle();
            }
          }, TIMINGS.holdEmpty);
        }, TIMINGS.exhale);
      }, TIMINGS.hold);
    }, TIMINGS.inhale);
  };

  const handleToggle = async () => {
    if (isActive) {
      setIsActive(false);
      setPhase('ready');
      window.speechSynthesis.cancel();
      stopNaturalSound();
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('ready');
    setCycleCount(0);
    setTotalTime(0);
    window.speechSynthesis.cancel();
    stopNaturalSound();
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
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Mindful Breathing
          </h1>
          <p className="text-gray-600 text-lg">
            4-4-4-2 Technique with Ocean Sounds 🌊
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            <div className={`absolute inset-0 rounded-full border-4 border-blue-300/30 ${isActive ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full border-2 border-green-300/30 ${isActive ? 'animate-pulse' : ''}`}></div>

            <div className={`
              absolute inset-8 rounded-full 
              bg-gradient-to-br from-blue-400 via-green-400 to-purple-500
              shadow-2xl
              flex items-center justify-center
              transition-transform duration-[4000ms] ease-in-out
              ${getCircleScale()}
            `}>
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>

              <div className="relative z-10 text-center">
                <div className="text-white text-6xl md:text-7xl font-bold mb-4">
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

        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg
              ${soundEnabled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
            `}
          >
            {soundEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            <span className="font-bold">
              {soundEnabled ? '🌊 Ocean Sound ON' : 'Sound OFF'}
            </span>
          </button>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg
              ${voiceEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
            `}
          >
            {voiceEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            <span className="font-bold">
              {voiceEnabled ? '🗣️ Voice ON' : 'Voice OFF'}
            </span>
          </button>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-3">How it works:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-blue-500 text-xl">↑</span>
              <span><strong>Inhale</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 text-xl">●</span>
              <span><strong>Hold</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500 text-xl">↓</span>
              <span><strong>Exhale</strong> for 4 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-500 text-xl">○</span>
              <span><strong>Hold Empty</strong> for 2 seconds</span>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              <strong>🌊 Background Sound:</strong> Natural ocean wave sounds for relaxation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breathe;