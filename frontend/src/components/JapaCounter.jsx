import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './JapaCounter.css'; 

// Key for storing offline japa counts
const OFFLINE_JAPA_KEY = 'offline_japa_counts';

const JapaCounter = () => {
  const [malaCount, setMalaCount] = useState(0);
  const [currentBeads, setCurrentBeads] = useState(0);
  const [lastCountTime, setLastCountTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMalas, setOfflineMalas] = useState(0);

  // --- Settings States ---
  const [vibrate, setVibrate] = useState(true);

  // --- Offline Sync Logic ---
  const syncOfflineCounts = async () => {
    let pendingMalas = parseInt(localStorage.getItem(OFFLINE_JAPA_KEY) || '0');
    if (pendingMalas === 0) {
      setOfflineMalas(0);
      return; // Nothing to sync
    }

    setIsSyncing(true);
    setOfflineMalas(pendingMalas);
    console.log(`Syncing ${pendingMalas} offline malas...`);

    try {
      // We send all pending malas as a single 'add' request.
      // We could also send them one by one in a loop.
      await api.post('/japa/add', { 
        mala_count: pendingMalas,
        family_id: null 
      });

      // Sync successful, clear local storage
      localStorage.setItem(OFFLINE_JAPA_KEY, '0');
      setOfflineMalas(0);
      console.log('Offline sync successful!');
    } catch (error) {
      console.error('Failed to sync offline malas:', error);
      // Don't clear storage, will try again next time
    }
    setIsSyncing(false);
  };

  // Add a mala to the offline queue
  const saveMalaOffline = () => {
    let pendingMalas = parseInt(localStorage.getItem(OFFLINE_JAPA_KEY) || '0');
    pendingMalas += 1;
    localStorage.setItem(OFFLINE_JAPA_KEY, pendingMalas.toString());
    setOfflineMalas(pendingMalas);
    console.log('Saved 1 mala to offline queue.');
  };

  // --- Effects ---

  // Load today's count and sync offline malas when the page opens
  useEffect(() => {
    const loadCounter = async () => {
      setLoading(true);
      try {
        // 1. Fetch today's count from the server
        const response = await api.get('/japa/today');
        if (response.data.today) {
          setMalaCount(response.data.today.mala_count);
        }
        
        // 2. Try to sync any pending offline counts
        await syncOfflineCounts();

      } catch (error) {
        console.error('Failed to fetch today\'s count', error);
        // If this fails, we are offline. Load from local storage.
        let pendingMalas = parseInt(localStorage.getItem(OFFLINE_JAPA_KEY) || '0');
        setOfflineMalas(pendingMalas);
      }
      setLoading(false);
    };
    loadCounter();
  }, []);

  // --- Handlers ---

  const handleBeadClick = async () => {
    // Debounce
    const now = Date.now();
    if (now - lastCountTime < 100) return;
    setLastCountTime(now);

    let newBeadCount = currentBeads + 1;

    if (newBeadCount === 108) {
      newBeadCount = 0; // Reset beads
      if (vibrate && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      // Update state immediately
      setMalaCount(prev => prev + 1);

      // Save to database (or offline)
      await saveMalaIncrement();

    } else {
      if (vibrate && navigator.vibrate) navigator.vibrate(50);
    }

    setCurrentBeads(newBeadCount);
  };
  
  const addFullMala = async () => {
     if (vibrate && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     setMalaCount(prev => prev + 1);
     await saveMalaIncrement();
  };

  // Central function to save a mala
  const saveMalaIncrement = async () => {
    try {
      // We use /increment which is optimized for +1
      await api.post('/japa/increment', { family_id: null });
    } catch (error) {
      console.error('Failed to save mala count (API failed), saving offline.', error);
      // ** OFFLINE FALLBACK **
      saveMalaOffline();
    }
  };

  if (loading) {
    return <div className="page-container">Loading Japa...</div>;
  }

  return (
    <div className="japa-container">
      {/* --- Offline/Syncing Indicator --- */}
      {isSyncing && (
        <div className="japa-sync-banner">
          Syncing {offlineMalas} offline malas...
        </div>
      )}
      {!isSyncing && offlineMalas > 0 && (
         <div className="japa-offline-banner">
          {offlineMalas} malas saved offline. 
          <button onClick={syncOfflineCounts}>Sync Now</button>
        </div>
      )}

      <div className="japa-stats">
        <div className="japa-total">
          <span className="japa-total-label">Today's Malas</span>
          <span className="japa-total-count">{malaCount}</span>
        </div>
      </div>

      <div className="japa-main">
        <button className="japa-bead-button" onClick={handleBeadClick}>
          <div className="japa-bead-count">{currentBeads}</div>
          <div className="japa-bead-label">Tap to count</div>
        </button>
      </div>

      <div className="japa-controls">
        <button onClick={addFullMala} className="japa-control-button">
          +1 Mala
        </button>
        <button 
          onClick={() => setCurrentBeads(0)} 
          className="japa-control-button"
        >
          Reset Beads
        </button>
      </div>
      
      <div className="japa-settings">
        <label>
          <input type="checkbox" checked={vibrate} onChange={() => setVibrate(!vibrate)} />
          Vibrate
        </label>
      </div>
    </div>
  );
};

export default JapaCounter;