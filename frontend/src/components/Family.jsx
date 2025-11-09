import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom'; 
import './Family.css';

const Family = () => {
  const [myFamilies, setMyFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const response = await api.get('/families/my-families');
      setMyFamilies(response.data.families);
      setLoading(false);
    } catch (err) {
      console.error('परिवार लोड करने में विफल:', err);
      setError('आपके परिवार लोड करने में विफल।');
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/families/join', { family_code: joinCode });
      setJoinCode('');
      fetchFamilies(); // लिस्ट रिफ्रेश करें
    } catch (err) { // <-- यहाँ { ब्रैकेट जोड़ दिया गया है
      setError(err.response?.data?.error || 'परिवार में शामिल होने में विफल।');
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/families/create', { family_name: familyName });
      setFamilyName('');
      fetchFamilies(); // लिस्ट रिफ्रेश करें
    } catch (err) {
      setError(err.response?.data?.error || 'परिवार बनाने में विफल।');
    }
  };

  return (
    <div className="family-page">
      {error && <p className="error-message">{error}</p>}

      {/* --- परिवार बनाएँ --- */}
      <div className="card">
        <h3 className="card-title">नया परिवार बनाएँ</h3>
        <form onSubmit={handleCreateFamily} className="form-container">
          <div className="form-group">
            <label className="form-label" htmlFor="fam-name">परिवार का नाम</label>
            <input
              id="fam-name"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="जैसे: श्री कृष्ण परिवार"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-secondary">परिवार बनाएँ</button>
        </form>
      </div>

      {/* --- परिवार से जुड़ें --- */}
      <div className="card">
        <h3 className="card-title">परिवार से जुड़ें</h3>
        <form onSubmit={handleJoinFamily} className="form-container">
          <div className="form-group">
            <label className="form-label" htmlFor="fam-code">परिवार कोड</label>
            <input
              id="fam-code"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="परिवार का इन्वाइट कोड दर्ज करें"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">शामिल हों</button>
        </form>
      </div>

      {/* --- मेरे परिवार की लिस्ट --- */}
      <div className="my-families-list">
        <h2>मेरे परिवार</h2>
        {loading && <p>लोड हो रहा है...</p>}
        
        {myFamilies.length === 0 && !loading && (
          <p>आप अभी तक किसी परिवार का हिस्सा नहीं हैं।</p>
        )}

        {myFamilies.map(family => (
          <Link to={`/family/${family.family_id}`} key={family.family_id} className="family-card-link">
            <div className="family-card card">
              <div className="family-card-content">
                <h4>{family.family_name}</h4>
                <p><strong>मेरी भूमिका:</strong> {family.my_relation || (family.is_admin ? 'एडमिन' : 'सदस्य')}</p>
                <p><strong>कुल सदस्य:</strong> {family.member_count}</p>
              </div>
              <div className="family-card-arrow">
                <span>&gt;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Family;