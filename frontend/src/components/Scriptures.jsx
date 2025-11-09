import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Scriptures.css'; // हम यह CSS फ़ाइल बनाएँगे

const Scriptures = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScriptures = async () => {
      try {
        // हम 'hi' (हिन्दी) के लिए अनुरोध करते हैं
        const response = await api.get('/scriptures', { params: { lang: 'hi' } });
        setScriptures(response.data.scriptures);
      } catch (err) {
        console.error('शास्त्र लोड करने में विफल:', err);
        setError('शास्त्र लोड करने में विफल।');
      }
      setLoading(false);
    };
    fetchScriptures();
  }, []);

  if (loading) {
    return <div className="page-container">शास्त्र लोड हो रहे हैं...</div>;
  }
  
  if (error) {
     return <div className="page-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="scripture-page">
      <div className="card">
        <h3 className="card-title">भक्ति शास्त्र</h3>
        <p>अपनी आध्यात्मिक यात्रा के लिए इन पवित्र ग्रंथों का अध्ययन करें।</p>
      </div>

      <div className="scripture-list">
        {scriptures.length === 0 ? (
          <p>अभी कोई शास्त्र उपलब्ध नहीं है।</p>
        ) : (
          scriptures.map(scripture => (
            <div key={scripture.scripture_id} className="scripture-card card">
              <div className="scripture-content">
                <h4 className="scripture-title">{scripture.title}</h4>
                <p className="scripture-desc">{scripture.description}</p>
                <div className="scripture-buttons">
                  <button className="btn btn-secondary">पढ़ें</button>
                  {scripture.audio_url && (
                    <button className="btn btn-primary">सुनें</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Scriptures;