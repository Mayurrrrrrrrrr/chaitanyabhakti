import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiVolume2, FiVolumeX } from 'react-icons/fi';

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
    { id: 'ocean', name: '🌊 Ocean Waves', description: 'Calming ocean sounds' },
    { id: 'forest', name: '🌳 Forest', description: 'Birds and rustling leaves' },
    { id: 'rain', name: '🌧️ Rain', description: 'Gentle rainfall' },
    { id: 'white', name: '⚪ White Noise', description: 'Pure white noise' },
    { id: 'pink', name: '🎵 Pink Noise', description: 'Deeper, softer noise' },
    { id: 'brown', name: '🟤 Brown Noise', description: 'Deep rumbling sound' }
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

  const generatePinkNoise = (audioContext) => {
    return generateOceanSound(audioContext);
  };

  const generateBrownNoise = (audioContext) => {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
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
          noiseBuffer = generatePinkNoise(audioContextRef.current);
          filterFreq = 1200;
          break;
        case 'rain':
          noiseBuffer = generateWhiteNoise(audioContextRef.current);
          filterFreq = 600;
          break;
        case 'white':
          noiseBuffer = generateWhiteNoise(audioContextRef.current);
          filterFreq = 20000;
          break;
        case 'pink':
          noiseBuffer = generatePinkNoise(audioContextRef.current);
          filterFreq = 1000;
          break;
        case 'brown':
          noiseBuffer = generateBrownNoise(audioContextRef.current);
          filterFreq = 500;
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
    utterance.rate = 0.65; // Even slower for calmness
    utterance.pitch = 0.9; // Lower pitch for soothing effect
    utterance.volume = 0.6; // Quieter volume

    const voices = window.speechSynthesis.getVoices();
    if (voiceLanguage === 'hi') {
      const hindiVoice = voices.find(voice => voice.lang.includes('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const calmVoice = voices.find(voice =>
        voice.name.includes('Female') || voice.name.includes('Samantha')
      );
      if (calmVoice) utterance.voice = calmVoice;
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

  const handleToggle = async () => {
    if (isActive) {
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

  const handleReset = () => {
    setIsActive(false);
    setPhase('ready');
    setCycleCount(0);
    setTotalTime(0);
    window.speechSynthesis.cancel();
    stopSound();
  };

  const getPhaseText = () => {
    const texts = {
      hi: {
        inhale: 'सांस लें',
        hold: 'रुकें',
        exhale: 'सांस छोड़ें',
        holdEmpty: 'रुकें',
        ready: 'तैयार'
      },
      en: {
        inhale: 'Breathe In',
        hold: 'Hold',
        exhale: 'Breathe Out',
        holdEmpty: 'Hold',
        ready: 'Ready'
      }
    };
    return texts[voiceLanguage][phase] || texts.en[phase];
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
            4-4-4-2 Technique with Ambient Sounds
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
            {isActive ? <><FiPause size={24} />Pause</> : <><FiPlay size={24} />Start</>}
          </button>

          <button
            onClick={handleReset}
            className="p-4 bg-white/70 backdrop-blur-md rounded-2xl text-gray-600 hover:text-gray-800 hover:bg-white transition-all shadow-lg border border-white/50"
            title="Reset"
          >
            <FiRefreshCw size={24} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="relative">
            <button
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg
                ${soundEnabled
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
              `}
            >
              {soundEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
              <span className="font-bold">
                {soundEnabled ? SOUND_OPTIONS.find(s => s.id === selectedSound)?.name : 'Sound OFF'}
              </span>
            </button>

            {showSoundMenu && (
              <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl p-2 min-w-[250px] z-50">
                {SOUND_OPTIONS.map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => {
                      setSelectedSound(sound.id);
                      setSoundEnabled(true);
                      setShowSoundMenu(false);
                    }}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors
                      ${selectedSound === sound.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                    `}
                  >
                    <div className="font-bold">{sound.name}</div>
                    <div className="text-xs text-gray-500">{sound.description}</div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSoundEnabled(false);
                    setShowSoundMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                >
                  <div className="font-bold">🔇 Turn Off Sound</div>
                </button>
              </div>
            )}
          </div>

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

          <select
            value={voiceLanguage}
            onChange={(e) => setVoiceLanguage(e.target.value)}
            className="px-4 py-3 bg-white rounded-xl shadow-lg font-medium text-gray-700 border-2 border-gray-200 focus:border-purple-500 outline-none"
          >
            <option value="hi">हिंदी (Hindi)</option>
            <option value="en">English</option>
          </select>
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
        </div>
      </div>
    </div>
  );
};

export default Breathe;