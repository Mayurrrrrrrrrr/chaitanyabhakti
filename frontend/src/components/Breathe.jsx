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
  const [selectedSound, setSelectedSound] = useState('ocean');
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  const phaseTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const soundNodeRef = useRef(null);

  const TIMINGS = {
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    holdEmpty: 2000,
  };

  const SOUND_OPTIONS = [
    { id: 'ocean', name: '🌊 Ocean', description: 'Calming waves' },
    { id: 'forest', name: '🌳 Forest', description: 'Birds & leaves' },
    { id: 'rain', name: '🌧️ Rain', description: 'Rainfall' },
  ];

  const VOICE_INSTRUCTIONS = {
    en: {
      inhale: 'Breathe in slowly',
      hold: 'Hold',
      exhale: 'Breathe out slowly'
    },
    hi: {
      inhale: 'धीरे से सांस लें',
      hold: 'रुकें',
      exhale: 'धीरे से सांस छोड़ें'
    }
  };

  const [voiceLanguage, setVoiceLanguage] = useState('hi');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return () => {
      stopSound();
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
        startSound(selectedSound);
      }
    } else {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      stopSound();
    }
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      stopSound();
      if (soundEnabled) {
        startSound(selectedSound);
      }
    }
  }, [selectedSound, soundEnabled]);

  const generateOceanSound = (audioContext) => {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

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
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    return noiseBuffer;
  };

  const generateWhiteNoise = (audioContext) => {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return noiseBuffer;
  };

  const startSound = async (soundType) => {
    if (!audioContextRef.current || soundNodeRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      let noiseBuffer;
      let filterFreq = 800;

      switch (soundType) {
        case 'ocean':
          noiseBuffer = generateOceanSound(audioContextRef.current);
          filterFreq = 800;
          break;
        case 'forest':
          noiseBuffer = generateWhiteNoise(audioContextRef.current);
          filterFreq = 1200;
          break;
        case 'rain':
          noiseBuffer = generateWhiteNoise(audioContextRef.current);
          filterFreq = 600;
          break;
        default:
          noiseBuffer = generateOceanSound(audioContextRef.current);
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = audioContextRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;

      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);

      const lfo = audioContextRef.current.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = audioContextRef.current.createGain();
      lfoGain.gain.value = 200;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.start();
      lfo.start();

      soundNodeRef.current = { source, filter, gainNode, lfo, lfoGain };
    } catch (error) {
      console.error('Audio start error:', error);
    }
  };

  const stopSound = () => {
    try {
      if (soundNodeRef.current) {
        soundNodeRef.current.source.stop();
        soundNodeRef.current.lfo.stop();
        soundNodeRef.current.source.disconnect();
        soundNodeRef.current.filter.disconnect();
        soundNodeRef.current.gainNode.disconnect();
        soundNodeRef.current.lfo.disconnect();
        soundNodeRef.current.lfoGain.disconnect();
        soundNodeRef.current = null;
      }
    } catch (error) {
      console.error('Stop audio error:', error);
    }
  };

  const speakInstruction = (phase) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const text = VOICE_INSTRUCTIONS[voiceLanguage][phase];
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.65;
    utterance.pitch = 0.9;
    utterance.volume = 0.6;

    const voices = window.speechSynthesis.getVoices();
    if (voiceLanguage === 'hi') {
      const hindiVoice = voices.find(voice => voice.lang.includes('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const runBreathingCycle = () => {
    setPhase('inhale');
    speakInstruction('inhale');

    phaseTimerRef.current = setTimeout(() => {
      setPhase('hold');
      speakInstruction('hold');

      phaseTimerRef.current = setTimeout(() => {
        setPhase('exhale');
        speakInstruction('exhale');

        phaseTimerRef.current = setTimeout(() => {
          setPhase('holdEmpty');
          speakInstruction('hold');

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

  const saveBreathSession = async () => {
    if (totalTime === 0 || cycleCount === 0) return;

    try {
      await api.post('/breathe', {
        technique_id: '4-4-4-2',
        technique_name: 'Box Breathing (4-4-4-2)',
        duration_seconds: totalTime
      });
    } catch (error) {
      console.error('Failed to save breath session:', error);
    }
  };

  const handleToggle = async () => {
    if (isActive) {
      await saveBreathSession();
      setIsActive(false);
      setPhase('ready');
      window.speechSynthesis.cancel();
      stopSound();
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      setIsActive(true);
    }
  };

  const handleReset = async () => {
    await saveBreathSession();
    setIsActive(false);
    setPhase('ready');
    setCycleCount(0);
    setTotalTime(0);
    window.speechSynthesis.cancel();
    stopSound();
  };

  const getPhaseText = () => {
    const texts = {
      hi: { inhale: 'सांस लें', hold: 'रुकें', exhale: 'सांस छोड़ें', holdEmpty: 'रुकें', ready: 'तैयार' },
      en: { inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out', holdEmpty: 'Hold', ready: 'Ready' }
    };
    return texts[voiceLanguage][phase] || texts.en[phase];
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
      case 'hold':
        return 'scale-110';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-800 mb-1">
          Mindful Breathing
        </h1>
        <p className="text-gray-600 text-sm">4-4-4-2 Box Breathing</p>
      </div>

      {/* Main Circle */}
      <div className="relative mb-6">
        <div className={`
          w-64 h-64 rounded-full 
          bg-gradient-to-br from-blue-400 via-green-400 to-purple-500
          shadow-2xl flex items-center justify-center
          transition-transform duration-[4000ms] ease-in-out
          ${getCircleScale()}
        `}>
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>

          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="3" />
            <circle
              cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - (phase !== 'ready' ? 0.75 : 0))}`}
              className="transition-all duration-300"
            />
          </svg>

          <div className="relative z-10 text-center">
            <div className="text-6xl font-bold text-white drop-shadow-2xl mb-2">
              {phase === 'inhale' && '↑'}
              {phase === 'hold' && '●'}
              {phase === 'exhale' && '↓'}
              {phase === 'holdEmpty' && '○'}
              {phase === 'ready' && '✨'}
            </div>
            <div className="text-white text-xl font-medium">
              {getPhaseText()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-sm">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 text-center shadow-lg border border-white/50">
          <div className="text-3xl font-bold text-blue-600">{cycleCount}</div>
          <div className="text-xs text-gray-600">Cycles</div>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 text-center shadow-lg border border-white/50">
          <div className="text-3xl font-bold text-green-600">{formatTime(totalTime)}</div>
          <div className="text-xs text-gray-600">Time</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all ${isActive ? 'bg-white text-gray-700' : 'bg-gradient-to-r from-blue-500 to-green-500 text-white'}`}
        >
          {isActive ? <><FiPause size={20} />Pause</> : <><FiPlay size={20} />Start</>}
        </button>

        <button onClick={handleReset} className="p-3 bg-white/70 rounded-xl text-gray-600 hover:bg-white shadow-lg">
          <FiRefreshCw size={20} />
        </button>
      </div>

      {/* Options */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <div className="relative">
          <button
            onClick={() => setShowSoundMenu(!showSoundMenu)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium shadow-md ${soundEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
            <span className="text-sm">{soundEnabled ? SOUND_OPTIONS.find(s => s.id === selectedSound)?.name : 'OFF'}</span>
          </button>

          {showSoundMenu && (
            <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl p-2 min-w-[200px] z-50">
              {SOUND_OPTIONS.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => { setSelectedSound(sound.id); setSoundEnabled(true); setShowSoundMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${selectedSound === sound.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                >
                  <div className="font-bold text-sm">{sound.name}</div>
                </button>
              ))}
              <button
                onClick={() => { setSoundEnabled(false); setShowSoundMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600 text-sm"
              >
                🔇 Turn Off
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium shadow-md ${voiceEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          {voiceEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
          <span className="text-sm">Voice</span>
        </button>

        <select
          value={voiceLanguage}
          onChange={(e) => setVoiceLanguage(e.target.value)}
          className="px-3 py-2 bg-white rounded-lg shadow-md font-medium text-gray-700 text-sm"
        >
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Guide */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 max-w-sm border border-white/50">
        <h3 className="font-bold text-sm text-gray-800 mb-2">Technique:</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
          <div className="flex items-center gap-1"><span className="text-blue-500">↑</span> Inhale 4s</div>
          <div className="flex items-center gap-1"><span className="text-green-500">●</span> Hold 4s</div>
          <div className="flex items-center gap-1"><span className="text-purple-500">↓</span> Exhale 4s</div>
          <div className="flex items-center gap-1"><span className="text-gray-500">○</span> Hold 2s</div>
        </div>
      </div>
    </div>
  );
};

export default Breathe;