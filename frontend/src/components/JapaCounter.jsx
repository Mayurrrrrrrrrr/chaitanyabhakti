import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import './JapaCounter.css';
import { useLanguage } from '../context/LanguageContext';
import { FiMic, FiMicOff, FiRotateCcw, FiX, FiTarget, FiTrendingUp, FiPlus, FiSave } from 'react-icons/fi';

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
}

const JapaCounter = () => {
  const { language, t } = useLanguage();
  
  const [beadCount, setBeadCount] = useState(() => {
    const saved = localStorage.getItem('beadCount');
    return saved ? JSON.parse(saved) : 0;
  });
  
  const [malaCount, setMalaCount] = useState(() => {
    const saved = localStorage.getItem('malaCount');
    return saved ? JSON.parse(saved) : 0;
  });
  
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('dailyGoal');
    return saved ? JSON.parse(saved) : 16; // Default 16 malas
  });
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  
  const [offlineQueue, setOfflineQueue] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  
  const malaCountRef = useRef(malaCount);
  const isListeningRef = useRef(isListening);
  
  const bellSound = useRef(null);
  
  useEffect(() => {
    malaCountRef.current = malaCount;
  }, [malaCount]);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  
  useEffect(() => {
    bellSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMHGGS36+OhTgwOUKXi8bllHAU7ldnyzn0vBSd+zPDckjwIEly17OmkUhELSpzg8sFuIwQ1jtL01Ik2Bhlit+zmoVAMEFOp5fK8aiEGPZfZ8tWAMgcsdM3w45NECRxiu+7ro1IPD1Gs5/O9ayMHPJPX8tGFNQgldcvx5pZAChVdu+npo08ODVGo4/K/bSIF');
  }, []);

  // Load API count once
  useEffect(() => {
    api.get('/japa/summary')
      .then(res => {
        if (res.data.today_count !== malaCountRef.current) {
          setMalaCount(res.data.today_count || 0);
          setBeadCount(0);
        }
      })
      .catch(err => console.error("Failed to fetch today's count", err));
  }, []);

  useEffect(() => {
    localStorage.setItem('malaCount', JSON.stringify(malaCount));
  }, [malaCount]);
  
  useEffect(() => {
    localStorage.setItem('beadCount', JSON.stringify(beadCount));
  }, [beadCount]);
  
  useEffect(() => {
    localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  const saveToApi = useCallback(async (countToSave) => {
    setIsSyncing(true);
    try {
      await api.post('/japa', {
        mala_count: countToSave,
        japa_date: new Date().toISOString().split('T')[0],
      });
      setOfflineQueue(0); 
    } catch (err) {
      console.error('Failed to save mala count', err);
      setOfflineQueue(prev => prev + 1);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const playSound = () => {
    if (soundEnabled && bellSound.current) {
      bellSound.current.currentTime = 0;
      bellSound.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const triggerHaptic = () => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleBeadClick = useCallback(() => {
    triggerHaptic();
    
    setBeadCount(prevBeadCount => {
      const newBeadCount = prevBeadCount + 1;
      if (newBeadCount === 108) {
        const newMalaCount = malaCountRef.current + 1;
        setMalaCount(newMalaCount);
        saveToApi(newMalaCount);
        playSound();
        
        // Show celebration if goal reached
        if (newMalaCount === dailyGoal) {
          showCelebration();
        }
        return 0;
      }
      return newBeadCount;
    });
  }, [saveToApi, dailyGoal, soundEnabled, hapticEnabled]);

  const showCelebration = () => {
    // Simple celebration alert (can be enhanced with modal)
    if (window.confirm('🎉 Congratulations! Daily goal achieved! 🙏')) {
      console.log('Goal celebration!');
    }
  };

  const handleMalaReset = () => setBeadCount(0);
  
  const handleFullReset = () => {
    if (window.confirm('Reset all progress for today?')) {
      setMalaCount(0);
      setBeadCount(0);
      saveToApi(0);
    }
  };

  const handleGoalUpdate = () => {
    setDailyGoal(tempGoal);
    setShowGoalModal(false);
  };

  // Voice Recognition
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      const keywords = ["hare", "krishna", "add", "next", "bead", "राम", "एक", "मनका"];
      
      if (keywords.some(k => transcript.includes(k))) {
        handleBeadClick();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setVoiceError(t('japa_voice_denied'));
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch(e) {
          console.error("Recognition restart failed", e);
          setIsListening(false);
        }
      }
    };
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [handleBeadClick, t]);

  const toggleListen = (e) => {
    e.stopPropagation();
    if (!recognition) {
      setVoiceError(t('japa_voice_unsupported'));
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();
        setIsListening(true);
        setVoiceError('');
      } catch (err) {
        console.error('Speech recognition start failed', err);
        setVoiceError('Microphone access denied');
      }
    }
  };

  const goalProgress = (malaCount / dailyGoal) * 100;
  const [malaType, setMalaType] = useState('rudraksh');
  const [selectedMantra, setSelectedMantra] = useState('Hare Krishna');
  const [newMantra, setNewMantra] = useState('');
  const motis = Array.from({ length: 108 }, (_, i) => i + 1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleAdvanceMoti = () => {
    setCurrentIndex(prev => (prev + 1) % motis.length);
  };

  return (
    <div className="japa-container">
      <div className="japa-circle">
        <svg width="300" height="300">
          {motis.map((n, i) => {
            const angle = (2 * Math.PI * i) / motis.length;
            const cx = 150 + 120 * Math.cos(angle);
            const cy = 150 + 120 * Math.sin(angle);
            const isCurrent = i === currentIndex;
            const fill = malaType === 'rudraksh' ? '#8B4513' : malaType === 'tulsi' ? '#2ECC71' : malaType === 'moti' ? '#95A5A6' : '#F1C40F';
            return (
              <g key={i} className={`japa-bead ${isCurrent ? 'current' : ''}`} onClick={() => { handleBeadClick(); handleAdvanceMoti(); }}>
                <circle cx={cx} cy={cy} r={isCurrent ? 8 : 6} fill={fill} />
                {isCurrent && (
                  <text x={cx} y={cy - 14} fontSize="10" textAnchor="middle" fill="#333">{n}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="japa-visual">
        <svg width="280" height="280">
          <defs>
            <radialGradient id="malaGradient">
              <stop offset="0%" stopColor="#FFF8DC" />
              <stop offset="100%" stopColor="#FFE4B5" />
            </radialGradient>
          </defs>
          <circle cx="140" cy="140" r="130" fill="url(#malaGradient)" opacity="0.3" />
          <circle cx="140" cy="20" r="6" fill="#FF6B6B" stroke="#654321" strokeWidth="1" />
          <circle cx="245" cy="80" r="6" fill="#4CAF50" stroke="#654321" strokeWidth="1" />
        </svg>
      </div>

      {/* Goal Progress Bar */}
      <div className="goal-section">
        <div className="goal-header">
          <div>
            <h3>Daily Goal: {dailyGoal} Malas</h3>
            <p>{malaCount} / {dailyGoal} completed ({Math.round(goalProgress)}%)</p>
          </div>
          <button className="btn-goal-settings" onClick={() => setShowGoalModal(true)}>
            <FiTarget />
          </button>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(goalProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Counters */}
      <div className="japa-display">
        <div className="japa-display-box">
          <span className="count">{malaCount}</span>
          <span className="label">{t('malas')}</span>
        </div>
        <div className="japa-display-box">
          <span className="count">{beadCount}</span>
          <span className="label">{t('japa_beads')}</span>
        </div>
      </div>

      {/* Main Counter Button */}
      <div className="japa-controls-wrapper">
        <button className="bead-button" onClick={handleBeadClick}>
          {t('greeting')}
          <span className="bead-progress">{beadCount}/108</span>
        </button>
        
        {recognition && (
          <button 
            className={`voice-toggle-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
            title={isListening ? t('japa_voice_stop') : t('japa_voice_start')}
          >
            {isListening ? <FiMicOff /> : <FiMic />}
            {isListening && <div className="listening-pulse"></div>}
          </button>
        )}
      </div>

      <div className="japa-controls-panel">
        <div className="control-row">
          <button className="control-btn" onClick={() => setMalaType('rudraksh')}>Rudraksh</button>
          <button className="control-btn" onClick={() => setMalaType('tulsi')}>Tulsi</button>
          <button className="control-btn" onClick={() => setMalaType('moti')}>Moti</button>
          <button className="control-btn" onClick={() => setMalaType('haldi')}>Haldi</button>
        </div>
        <div className="control-row">
          <label className="toggle-label">
            <span>Selected Mantra: {selectedMantra}</span>
          </label>
        </div>
        <div className="control-row">
          <button className="control-btn" onClick={() => setSelectedMantra('Hare Krishna')}><FiSave /> Hare Krishna</button>
          <button className="control-btn" onClick={() => setSelectedMantra('Om Namah Shivaya')}><FiSave /> Om Namah Shivaya</button>
        </div>
        <div className="control-row">
          <input
            type="text"
            value={newMantra}
            onChange={(e) => setNewMantra(e.target.value)}
            placeholder="Add mantra"
            style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '2px solid #E0E0E0' }}
          />
          <button className="control-btn" onClick={() => { if (newMantra) { setSelectedMantra(newMantra); setNewMantra(''); } }}>
            <FiPlus /> Add Mantra
          </button>
        </div>
        <div className="control-row">
          <button className="control-btn" onClick={() => { handleBeadClick(); handleAdvanceMoti(); }}>Manual Count</button>
          <button className="control-btn" onClick={(e) => toggleListen(e)}>{isListening ? <FiMicOff /> : <FiMic />} Voice Count</button>
          <button className="control-btn danger" onClick={handleMalaReset}><FiRotateCcw /> Reset</button>
        </div>
      </div>

      {/* Status Messages */}
      <div className="status-messages">
        {isSyncing && <div className="sync-status">Syncing...</div>}
        {offlineQueue > 0 && <div className="sync-status error">Offline: {offlineQueue} malas unsynced</div>}
        {voiceError && <div className="sync-status error">{voiceError}</div>}
      </div>

      {/* Controls */}
      <div className="japa-controls-panel">
        <div className="control-row">
          <button className="control-btn" onClick={handleMalaReset}>
            <FiRotateCcw /> Reset Beads
          </button>
          <button className="control-btn danger" onClick={handleFullReset}>
            <FiX /> Reset All
          </button>
        </div>
        
        <div className="control-row">
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <span>🔔 Sound</span>
          </label>
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={hapticEnabled}
              onChange={(e) => setHapticEnabled(e.target.checked)}
            />
            <span>📳 Vibration</span>
          </label>
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Set Daily Goal</h2>
            <div className="goal-input-group">
              <label>Malas per day:</label>
              <input 
                type="number" 
                min="1" 
                max="64"
                value={tempGoal}
                onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleGoalUpdate}>
                Save Goal
              </button>
              <button className="btn-secondary" onClick={() => setShowGoalModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JapaCounter;
