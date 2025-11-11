// frontend/src/components/JapaCounter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './JapaCounter.css'; //
import { useAuth } from '../context/AuthContext'; //

const JapaCounter = () => {
  const { user } = useAuth();
  const [beadCount, setBeadCount] = useState(0);
  const [malaCount, setMalaCount] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load counter from API or localStorage
  const loadCounter = useCallback(async () => {
    try {
      // 🛑 FIX: Get today's count from the summary route
      const res = await api.get('/japa/summary');
      setMalaCount(res.data.today_count || 0);
      setBeadCount(0); // Always reset bead count on load
    } catch (err) {
      console.error("Failed to fetch today's count", err);
      const savedMala = localStorage.getItem('malaCount');
      if (savedMala) {
        setMalaCount(JSON.parse(savedMala));
      }
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('malaCount', JSON.stringify(malaCount));
  }, [malaCount]);

  // API saving logic
  const saveToApi = useCallback(async (countToSave) => {
    setIsSyncing(true);
    try {
      // 🛑 FIX: The route to save is POST /japa, not /japa/increment
      await api.post('/japa', {
        mala_count: countToSave,
        japa_date: new Date().toISOString().split('T')[0],
        family_id: null // Or manage this if you have family selection
      });
      setOfflineQueue(0); // Clear queue on successful sync
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