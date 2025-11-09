import React, { useState, useEffect, useCallback } from 'react'; // <-- Imported useCallback
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user } = useAuth(); 
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // setScope was removed as it was unused
  const [scope, ] = useState('global'); // <-- Corrected
  const [period, setPeriod] = useState('all'); 

  // <-- Wrapped function in useCallback
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/japa/leaderboard/global?period=${period}&limit=50`;
      
      if (scope === 'family') {
        // TODO: Add family scope logic
      }

      const response = await api.get(url);
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      setError('लीडरबोर्ड लोड करने में विफल।');
    }
    setLoading(false);
  }, [scope, period]); // <-- Added dependencies for useCallback

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]); // <-- Added fetchLeaderboard to dependency array

  const getPeriodLabel = () => {
    if (period === 'today') return 'आज (Today)';
    if (period === 'week') return 'इस सप्ताह (Week)';
    if (period === 'month') return 'इस महीने (Month)';
    return 'कुल (All Time)';
  };

  return (
    <div className="leaderboard-page">
      <div className="card leaderboard-header">
        <h3 className="card-title">🏆 लीडरबोर्ड</h3>
        
        <div className="toggle-group">
          <button onClick={() => setPeriod('today')} className={period === 'today' ? 'active' : ''}>आज</button>
          <button onClick={() => setPeriod('week')} className={period === 'week' ? 'active' : ''}>सप्ताह</button>
          <button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>महीना</button>
          <button onClick={() => setPeriod('all')} className={period === 'all' ? 'active' : ''}>कुल</button>
        </div>
        <p className="period-label">{getPeriodLabel()}</p>
      </div>

      {loading && <p>लोड हो रहा है...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="leaderboard-list">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.user_id} 
            className={`leaderboard-entry card ${entry.user_id === user.user_id ? 'is-user' : ''}`}
          >
            <div className="rank">#{index + 1}</div>
            <div className="user-info">
              <span className="user-name">
                {entry.name} {entry.spiritual_name ? `(${entry.spiritual_name})` : ''}
              </span>
              <span className="user-stats">
                {entry.current_streak} दिन स्ट्रीक 🔥
              </span>
            </div>
            <div className="mala-count">
              {entry.total_malas}
              <span>माला</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;