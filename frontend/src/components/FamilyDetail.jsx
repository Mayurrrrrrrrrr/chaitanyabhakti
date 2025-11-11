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

  useEffect(() => {
    localStorage.setItem('malaCount', JSON.stringify(malaCount));
  }, [malaCount]);
  
  useEffect(() => {
    localStorage.setItem('beadCount', JSON.stringify(beadCount));
  }, [beadCount]);

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

  const handleBeadClick = useCallback(() => {
    setBeadCount(prevBeadCount => {
      const newBeadCount = prevBeadCount + 1;
      if (newBeadCount === 108) {
        const newMalaCount = malaCountRef.current + 1;
        setMalaCount(newMalaCount);
        saveToApi(newMalaCount);
        return 0;
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
      const keywords = ["hare", "krishna", "add", "next", "bead", "राम", "एक", "push", "pop"];
      
      if (keywords.some(k => transcript.includes(k))) {
        // Vibrate for feedback
        if (navigator.vibrate) navigator.vibrate(50);
        handleBeadClick();
      }
    };

    recognition.onerror = (event) => {
      // 🛑 FIX: Improved error handling
      if (event.error === 'not-allowed') {
        setVoiceError(t('japa_voice_denied'));
        setIsListening(false);
      } else if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Ignore common, recoverable errors
      } else {
        console.error('Speech recognition error', event.error);
        setVoiceError(`${t('japa_voice_error')}${event.error}`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        // Automatically restart if it was supposed to be on
        try {
          recognition.start();
        } catch(e) {
          console.error("Recognition restart failed", e);
          setIsListening(false); // Stop if restart fails
        }
      }
    };
    
    // Cleanup on unmount
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [handleBeadClick, t]); // Add `t` dependency

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
        // 🛑 FIX: Set language based on app context
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();
        setIsListening(true);
        setVoiceError('');
      } catch (err) {
        console.error('Speech recognition start failed', err);
        if (err.name === 'NotAllowedError') {
          setVoiceError(t('japa_voice_denied'));
        } else {
          setVoiceError(err.message);
        }
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
          <span className="label">{t('japa_beads')}</span>
        </div>
      </div>

      <div className="japa-controls-wrapper">
        <button className="bead-button" onClick={handleBeadClick}>
          {t('greeting')}
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

      <div className="status-messages">
        {isSyncing && <div className="sync-status">Syncing...</div>}
        {offlineQueue > 0 && <div className="sync-status error">Offline: {offlineQueue} malas unsynced.</div>}
        {voiceError && <div className="sync-status error">{voiceError}</div>}
        {!recognition && <div className="sync-status">{t('japa_voice_unsupported')}</div>}
      </div>

      <div className="reset-controls">
        <button className="reset-btn" onClick={handleMalaReset}>
          <FiRotateCcw /> {t('japa_reset_beads')}
        </button>
        <button className="reset-btn full-reset" onClick={handleFullReset}>
          <FiX /> {t('japa_reset_all')}
        </button>
      </div>
      
    </div>
  );
};

export default JapaCounter;