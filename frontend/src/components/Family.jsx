// frontend/src/components/Family.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🛑 FIX: Was 'in', changed to 'from'
import api from '../services/api';
import './Family.css'; //

const Family = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      // This is the correct path we fixed before
      const res = await api.get('/families');
      setFamilies(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to load families:', err);
      setError('परिवार लोड करने में विफल: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    try {
      await api.post('/families/join', { family_code: joinCode });
      setJoinCode('');
      fetchFamilies(); // Refresh list after joining
    } catch (err) {
      setError('परिवार से जुड़ने में विफल: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      await api.post('/families', { family_name: createName });
      setCreateName('');
      fetchFamilies(); // Refresh list after creating
    } catch (err) {
      setError('परिवार बनाने में विफल: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div>Loading families...</div>;
  }

  return (
    <div className="family-container">
      <h2>मेरे परिवार</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="family-list">
        {families.map((family) => (
          <Link to={`/family/${family.family_id}`} key={family.family_id} className="family-card">
            <h3>{family.family_name}</h3>
            <p>Code: {family.family_code}</p>
          </Link>
        ))}
      </div>

      <div className="family-actions">
        <form onSubmit={handleJoinFamily} className="family-form">
          <h3>परिवार से जुड़ें</h3>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Family Code"
            required
          />
          <button type="submit">Join</button>
        </form>

        <form onSubmit={handleCreateFamily} className="family-form">
          <h3>नया परिवार बनाएं</h3>
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Family Name"
            required
          />
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default Family;