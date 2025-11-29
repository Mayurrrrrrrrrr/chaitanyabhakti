import React, { useState, useEffect, useCallback, useRef } from 'react';
// Switching to utils/api as seen in LoginPage for better consistency
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './JapaCounter.css';

// --- Icons as inline components to avoid external dependencies ---
const IconMic = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const IconMicOff = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const IconVolume2 = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
const IconVolumeX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconRotateCcw = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>;
const IconPlus = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconTarget = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const IconActivity = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IconSmartphone = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;

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

  // --- State Management ---
  const [beadCount, setBeadCount] = useState(() => {
    const saved = localStorage.getItem('beadCount');
    return (saved && saved !== 'undefined') ? JSON.parse(saved) : 0;
  });

  const [malaCount, setMalaCount] = useState(() => {
    const saved = localStorage.getItem('malaCount');
    return (saved && saved !== 'undefined') ? JSON.parse(saved) : 0;
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('dailyGoal');
    return (saved && saved !== 'undefined') ? JSON.parse(saved) : 16;
  });

  const [selectedMantra, setSelectedMantra] = useState(() => {
    return localStorage.getItem('selectedMantra') || 'Hare Krishna';
  });

  const [malaType, setMalaType] = useState(() => {
    return localStorage.getItem('malaType') || 'rudraksh';
  });

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState('');

  // Refs
  const malaCountRef = useRef(malaCount);
  const isListeningRef = useRef(isListening);
  const bellSound = useRef(null);

  // --- Effects ---

  // Persist Data
  useEffect(() => { malaCountRef.current = malaCount; }, [malaCount]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { localStorage.setItem('malaCount', JSON.stringify(malaCount)); }, [malaCount]);
  useEffect(() => { localStorage.setItem('beadCount', JSON.stringify(beadCount)); }, [beadCount]);
  useEffect(() => { localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal)); }, [dailyGoal]);
  useEffect(() => { localStorage.setItem('selectedMantra', selectedMantra); }, [selectedMantra]);
  useEffect(() => { localStorage.setItem('malaType', malaType); }, [malaType]);

  // Load Sound
  useEffect(() => {
    bellSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMHGGS36+OhTgwOUKXi8bllHAU7ldnyzn0vBSd+zPDckjwIEly17OmkUhELSpzg8sFuIwQ1jtL01Ik2Bhlit+zmoVAMEFOp5fK8aiEGPZfZ8tWAMgcsdM3w45NECRxiu+7ro1IPD1Gs5/O9ayMHPJPX8tGFNQgldcvx5pZAChVdu+npo08ODVGo4/K/bSIF');
  }, []);

  // Initial API Sync
  useEffect(() => {
    api.getJapaSummary()
      .then(res => {
        if (!res.data) return;

        const serverTodayCount = res.data.today_count || 0;

        // Sync local state with server
        if (serverTodayCount !== malaCountRef.current) {
          setMalaCount(serverTodayCount);
          // If server count is different, reset beads to 0 to avoid sync issues
          setBeadCount(0);
        }
      })
      .catch(err => {
        console.error("Sync failed", err);
        // Fail silently, use local storage
      });
  }, []);

  // --- Core Logic ---

  const playSound = () => {
    if (soundEnabled && bellSound.current) {
      bellSound.current.currentTime = 0;
      bellSound.current.play().catch(e => console.log('Audio failed', e));
    }
  };

  const triggerHaptic = () => {
    if (hapticEnabled && navigator.vibrate) navigator.vibrate(40);
  };

  const saveToApi = useCallback(async (countToSave) => {
    setIsSyncing(true);
    try {
      await api.logJapa({
        mala_count: countToSave,
        japa_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleBeadClick = useCallback(() => {
    triggerHaptic();
    setBeadCount(prev => {
      const newBead = prev + 1;
      if (newBead >= 108) {
        const newMala = malaCountRef.current + 1;
        setMalaCount(newMala);
        saveToApi(newMala);
        playSound();
        if (newMala === dailyGoal) {
          alert(`Haribol! You reached your daily goal of ${dailyGoal} rounds! 🙏`);
        }
        return 0;
      }
      return newBead;
    });
  }, [saveToApi, dailyGoal, soundEnabled, hapticEnabled]);

  const handleMalaReset = () => {
    if (window.confirm("Reset current round beads to 0?")) setBeadCount(0);
    setShowSettings(false);
  };

  // Voice Logic
  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      const keywords = ["hare", "krishna", "next", "ram", "राम", "एक"];
      if (keywords.some(k => transcript.includes(k))) handleBeadClick();
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setVoiceError('Mic blocked');
        setIsListening(false);
      }
    };
    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start(); } catch (e) { setIsListening(false); }
      }
    };
    return () => { if (recognition) recognition.stop(); };
  }, [handleBeadClick]);

  const toggleListen = () => {
    if (!recognition) { setVoiceError('Not supported'); return; }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();
        setIsListening(true);
        setVoiceError('');
      } catch (err) { setVoiceError('Mic Error'); }
    }
  };

  // --- Visualization Logic ---
  // Generate beads around a circle
  const beads = Array.from({ length: 108 }, (_, i) => i);
  const RADIUS = 140;
  const CENTER = 160;

  // Calculate visual progress (0 to 100%)
  const goalPercentage = Math.min((malaCount / dailyGoal) * 100, 100);

  return (
    <div className="page-container japa-page">

      {/* Top Stats */}
      <div className="japa-header-stats">
        <div className="stat-pill">
          <span className="stat-label">Daily Goal</span>
          <span className="stat-value">{malaCount} / {dailyGoal}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Beads</span>
          <span className="stat-value">{beadCount}</span>
        </div>
      </div>

      {/* Mantra Display */}
      <div className="mantra-display">
        <span className="mantra-text">"{selectedMantra}"</span>
      </div>

      {/* Main Interactive Mala */}
      <div className="mala-visual-container">
        <svg viewBox="0 0 320 320" className="bead-svg">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* The Thread */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#e0e0e0" strokeWidth="1" />

          {/* The Beads */}
          {beads.map((i) => {
            // Logic to start from top (270 degrees) and go clockwise
            const angleDeg = (i * (360 / 108)) - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = CENTER + RADIUS * Math.cos(angleRad);
            const y = CENTER + RADIUS * Math.sin(angleRad);

            // Class logic
            let beadClass = "japa-bead pending";
            if (i < beadCount) beadClass = "japa-bead completed";
            if (i === beadCount) beadClass = "japa-bead current";

            return (
              <g key={i} className={beadClass}>
                <circle
                  cx={x}
                  cy={y}
                  r={i === beadCount ? 8 : 5} /* Pulse size in CSS */
                />
              </g>
            );
          })}

          {/* The Meru Bead (Top Center) */}
          <g className="japa-bead meru">
            <circle cx={CENTER} cy={CENTER - RADIUS - 10} r={10} />
          </g>
        </svg>

        {/* Center Counter */}
        <div className="mala-center-display">
          <div className="bead-counter-large">{beadCount}</div>
          <div className="bead-counter-label">Chants</div>
        </div>

        {/* Invisible Tap Area Over the whole circle */}
        <div className="tap-area-overlay" onClick={handleBeadClick}></div>
      </div>

      {/* Goal Progress Bar */}
      <div className="goal-progress-container">
        <div className="goal-labels">
          <span>Progress</span>
          <span>{Math.round(goalPercentage)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${goalPercentage}%` }}></div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button
          className="action-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title="Toggle Sound"
        >
          {soundEnabled ? <IconVolume2 /> : <IconVolumeX />}
        </button>

        {/* Mic Button */}
        {recognition && (
          <button
            className={`action-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
            title="Voice Count"
          >
            {isListening ? <IconMicOff /> : <IconMic />}
          </button>
        )}

        <button
          className="action-btn active"
          onClick={handleBeadClick}
          title="Add Bead Manual"
        >
          <IconPlus />
        </button>

        <button
          className="action-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <IconSettings />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Japa Settings</h3>

            <div className="setting-row">
              <label><IconTarget /> Daily Goal (Malas)</label>
              <input
                type="number"
                className="setting-input"
                value={dailyGoal}
                min="1"
                max="64"
                onChange={(e) => setDailyGoal(Number(e.target.value))}
              />
            </div>

            <div className="setting-row">
              <label><IconActivity /> Mantra</label>
              <select
                className="setting-select"
                value={selectedMantra}
                onChange={(e) => setSelectedMantra(e.target.value)}
              >
                <option value="Hare Krishna">Hare Krishna</option>
                <option value="Om Namah Shivaya">Om Namah Shivaya</option>
                <option value="Om Namo Bhagavate Vasudevaya">Om Namo Bhagavate Vasudevaya</option>
                <option value="Sri Ram Jai Ram">Sri Ram Jai Ram</option>
              </select>
            </div>

            <div className="setting-row">
              <label><IconSmartphone /> Haptic Feedback</label>
              <input
                type="checkbox"
                checked={hapticEnabled}
                onChange={(e) => setHapticEnabled(e.target.checked)}
              /> Enable Vibration
            </div>

            <div className="modal-actions">
              <button className="btn-text danger" onClick={handleMalaReset}>
                <IconRotateCcw /> Reset Beads
              </button>
              <button className="btn-primary" onClick={() => setShowSettings(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JapaCounter;