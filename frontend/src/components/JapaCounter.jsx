import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import './JapaCounter.css';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiMic, FiMicOff, FiRotateCcw, FiX } from 'react-icons/fi';

// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
}

const JapaCounter = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  
  // Load initial state from localStorage
  const [beadCount, setBeadCount] = useState(() => {
    const savedBeads = localStorage.getItem('beadCount');
    return savedBeads ? JSON.parse(savedBeads) : 0;
  });
  const [malaCount, setMalaCount] = useState(() => {
    const savedMala = localStorage.getItem('malaCount');
    return savedMala ? JSON.parse(savedMala) : 0;
  });
  
  const [offlineQueue, setOfflineQueue] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Voice Commands State ---
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  
  // Use refs to ensure event handlers get the latest state
  const malaCountRef = useRef(malaCount);
  useEffect(() => { malaCountRef.current = malaCount; }, [malaCount]);

  const isListeningRef = useRef(isListening);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // Load API count *once* on load
  useEffect(() => {
    api.get('/japa/summary')
      .then(res => {
        if (res.data.today_count !== malaCountRef.current) {
          setMalaCount(res.data.today_count || 0);
          setBeadCount(0);
        }
      })
      .catch(err => console.error("Failed to fetch today's count", err));
  }, []); // Empty dependency array

  // Save to localStorage on *every* change
  useEffect(() => {
    localStorage.setItem('malaCount', JSON.stringify(malaCount));
  }, [malaCount]);
  
  useEffect(() => {
    localStorage.setItem('beadCount', JSON.stringify(beadCount));
  }, [beadCount]);

  // API saving logic
  const saveToApi = useCallback(async (countToSave) => {
    setIsSyncing(true);
    try {
      await api.post('/japa', {
        mala_count: countToSave,
        japa_date: new Date().toISOString().split('T')[0],
      });
      setOfflineQueue(0); 
    } catch (err) {
      console.error('Failed to save mala count (API failed), saving offline.', err);
      setOfflineQueue(prev => prev + 1);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Main Japa counting logic
  const handleBeadClick = useCallback(() => {
    setBeadCount(prevBeadCount => {
      const newBeadCount = prevBeadCount + 1;
      if (newBeadCount === 108) {
        const newMalaCount = malaCountRef.current + 1;
        setMalaCount(newMalaCount);
        saveToApi(newMalaCount);
        return 0; // Reset bead count
      }
      return newBeadCount;
    });
  }, [saveToApi]);

  const handleMalaReset = () => setBeadCount(0);
  
  const handleFullReset = () => {
    setMalaCount(0);
    setBeadCount(0);
    saveToApi(0);
  };

  // --- Voice Command Functions ---
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      
      // 🛑 FIX: Add more keywords for reliability
      const keywords = ["hare", "krishna", "add", "next", "bead", "राम", "एक"];
      
      if (keywords.some(k => transcript.includes(k))) {
        handleBeadClick();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Ignore common errors, just restart
      } else {
        console.error('Speech recognition error', event.error);
        setVoiceError(`Error: ${event.error}`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        // Automatically restart if it stops
        try {
          recognition.start();
        } catch(e) {
          console.error("Recognition restart failed", e);
          setIsListening(false);
        }
      }
    };
    
    // Cleanup on unmount
    return () => {
      recognition.stop();
    };
  }, [handleBeadClick]);

  const toggleListen = (e) => {
    e.stopPropagation(); // Prevent japa button from firing
    if (!recognition) {
      setVoiceError('Voice commands not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        // 🛑 FIX: Set language based on app context
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();
        setIsListening(true);
        setVoiceError('');
      } catch (err) {
        console.error('Speech recognition start failed', err);
        setVoiceError('Microphone permission denied?');
      }
    }
  };

  return (
    <div className="japa-container">
      <div className="japa-display">
        <div className="japa-display-box">
          <span className="count">{malaCount}</span>
          <span className="label">{t('malas')}</span>
        </div>
        <div className="japa-display-box">
          <span className="count">{beadCount}</span>
          <span className="label">Beads</span>
        </div>
      </div>

      {/* --- NEW LAYOUT: Main Japa Button --- */}
      <div className="japa-controls-wrapper">
        <button className="bead-button" onClick={handleBeadClick}>
          {t('greeting')}
        </button>
        
        {/* --- NEW LAYOUT: Integrated Voice Button --- */}
        {recognition && (
          <button 
            className={`voice-toggle-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
          >
            {isListening ? <FiMicOff /> : <FiMic />}
            {isListening && <div className="listening-pulse"></div>}
          </button>
        )}
      </div>

      <div className="status-messages">
        {isSyncing && <div className="sync-status">Syncing...</div>}
        {offlineQueue > 0 && <div className="sync-status error">Offline: {offlineQueue} malas unsynced.</div>}
        {voiceError && <div className="sync-status error">{voiceError}</div>}
      </div>

      <div className="reset-controls">
        <button className="reset-btn" onClick={handleMalaReset}>
          <FiRotateCcw /> Reset Beads
        </button>
        <button className="reset-btn full-reset" onClick={handleFullReset}>
          <FiX /> Reset All
        </button>
      </div>
      
    </div>
  );
};

export default JapaCounter;