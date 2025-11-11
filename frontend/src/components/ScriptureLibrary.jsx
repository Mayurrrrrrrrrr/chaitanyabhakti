// frontend/src/components/ScriptureLibrary.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ScriptureLibrary.css'; // We will create this

const ScriptureLibrary = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScriptures = async () => {
      try {
        setLoading(true);
        // This is the correct route from scriptures.js
        const res = await api.get('/scriptures'); 
        setScriptures(res.data);
      } catch (err) {
        setError('Failed to load scriptures.');
      } finally {
        setLoading(false);
      }
    };
    fetchScriptures();
  }, []);

  if (loading) return <p>Loading Library...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="scripture-library-container">
      <h2>Scripture Library</h2>
      <div className="scripture-grid">
        {scriptures.map(scripture => (
          <div key={scripture.scripture_id} className="scripture-card">
            <img src={scripture.cover_url} alt={scripture.title} className="scripture-cover" />
            <div className="scripture-info">
              <h3>{scripture.title}</h3>
              <p>{scripture.description}</p>
              <div className="scripture-links">
                {scripture.content_url && (
                  <a href={api.defaults.baseURL + scripture.content_url} target="_blank" rel="noopener noreferrer">Read PDF</a>
                )}
                {scripture.audio_url && (
                  <a href={api.defaults.baseURL + scripture.audio_url} target="_blank" rel="noopener noreferrer">Listen</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScriptureLibrary;