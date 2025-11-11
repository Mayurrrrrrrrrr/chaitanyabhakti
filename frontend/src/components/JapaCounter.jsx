// frontend/src/components/JapaCounter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './JapaCounter.css';
import { useAuth } from '../context/AuthContext';

const JapaCounter = () => {
  const { user } = useAuth();
  
  // 🛑 FIX: Load initial state from localStorage
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

  // Load API count *once* on load
  useEffect(() => {
    const loadApiCount = async () => {
      try {
        const res = await api.get('/japa/summary');
        // Check if API count is different from local, this handles first-time load
        if (res.data.today_count !== malaCount) {
          setMalaCount(res.data.today_count || 0);
          setBeadCount(0); // Reset beads if loading from API
        }
      } catch (err) {
        console.error("Failed to fetch today's count", err);
        // If API fails, we trust the localStorage version we already loaded
      }
    };
    loadApiCount();
    // We only want this to run once on load, so we disable the exhaustive-deps warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🛑 FIX: Save to localStorage on *every* change
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

  const handleBeadClick = () => {
    if (beadCount + 1 === 108) {
      const newMalaCount = malaCount + 1;
      setMalaCount(newMalaCount);
      setBeadCount(0);
      saveToApi(newMalaCount); // Save the new total
    } else {
      setBeadCount(beadCount + 1);
    }
  };

  const handleMalaReset = () => {
    setBeadCount(0);
  };
  
  const handleFullReset = () => {
    setMalaCount(0);
    setBeadCount(0);
    saveToApi(0); // Save the reset
  };

  return (
    <div className="japa-container">
      <div className="japa-display">
        <div className="mala-count-display">
          <span className="count">{malaCount}</span>
          <span className="label">Malas Completed</span>
        </div>
        <div className="bead-count-display">
          <span className="count">{beadCount}</span>
          <span className="label">Beads</span>
        </div>
      </div>

      <div className="japa-controls">
        <button className="bead-button" onClick={handleBeadClick}>
          Hare Krishna
        </button>
      </div>

      <div className="reset-controls">
        <button className="reset-btn" onClick={handleMalaReset}>Reset Beads</button>
        <button className="reset-btn full-reset" onClick={handleFullReset}>Reset All</button>
      </div>
      
      {isSyncing && <div className="sync-status">Syncing...</div>}
      {offlineQueue > 0 && <div className="sync-status error">Offline: {offlineQueue} malas unsynced.</div>}
    </div>
  );
};

export default JapaCounter;