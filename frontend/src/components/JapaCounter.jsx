import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './JapaCounter.css'; 

// NO MORE SOUND URL

const JapaCounter = () => {
  const [malaCount, setMalaCount] = useState(0);
  const [currentBeads, setCurrentBeads] = useState(0);
  const [lastCountTime, setLastCountTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  // --- Settings States ---
  const [vibrate, setVibrate] = useState(true);
  // 'playSound' state has been removed

  // Load today's count when the page opens
  useEffect(() => {
    const fetchTodayCount = async () => {
      try {
        const response = await api.get('/japa/today');
        if (response.data.today) {
          setMalaCount(response.data.today.mala_count);
        }
      } catch (error) {
        console.error('Failed to fetch today\'s count', error);
      }
      setLoading(false);
    };
    fetchTodayCount();
  }, []);

  // This is the main function
  const handleBeadClick = async () => {
    // Debounce to prevent accidental double-clicks
    const now = Date.now();
    if (now - lastCountTime < 100) return; // 100ms debounce
    setLastCountTime(now);

    let newBeadCount = currentBeads + 1;

    // --- A Mala is Completed! ---
    if (newBeadCount === 108) {
      newBeadCount = 0; // Reset beads
      
      // Vibrate for a full mala
      if (vibrate && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
      // Update the state on the screen immediately
      setMalaCount(prev => prev + 1);

      // Save to database
      try {
        // We increment by 1 mala. We pass 'null' for family_id for now.
        await api.post('/japa/increment', { family_id: null });
      } catch (error) {
        console.error('Failed to save mala count', error);
        // TODO: Add offline save logic here
      }
    } else {
      // Vibrate for a single bead
      if (vibrate && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    // --- ALL SOUND LOGIC REMOVED ---

    // Update bead count state
    setCurrentBeads(newBeadCount);
  };
  
  // Manual function to add a full mala
  const addFullMala = async () => {
     if (vibrate && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     setMalaCount(prev => prev + 1);
     try {
        await api.post('/japa/increment', { family_id: null });
     } catch (error) {
        console.error('Failed to save mala count', error);
     }
  }

  if (loading) {
    return <div>Loading Japa...</div>;
  }

  return (
    <div className="japa-container">
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
        {/* "Sound" checkbox is now gone */}
        <label>
          <input type="checkbox" checked={vibrate} onChange={() => setVibrate(!vibrate)} />
          Vibrate
        </label>
      </div>
    </div>
  );
};

export default JapaCounter;