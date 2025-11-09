import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Satsang.css'; // हम CSS फ़ाइल का नाम भी बदलेंगे

const Satsang = () => {
  const [scriptures, setScriptures] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // एक ही समय में दोनों को लोड करें
        const [scripturesRes, videosRes] = await Promise.all([
          api.get('/scriptures', { params: { lang: 'hi' } }),
          api.get('/media/videos') // यह आपके backend/routes/media.js से आता है
        ]);
        
        setScriptures(scripturesRes.data.scriptures);
        setVideos(videosRes.data.video_links);
        
      } catch (err) {
        console.error('डेटा लोड करने में विफल:', err);
        setError('डेटा लोड करने में विफल।');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="page-container">सत्संग लोड हो रहा है...</div>;
  }
  
  if (error) {
     return <div className="page-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="satsang-page">
      <div className="card">
        <h3 className="card-title">📖 सत्संग एवं शास्त्र</h3>
        <p>पढ़ें, सुनें और देखें। अपनी आध्यात्मिक यात्रा को समृद्ध करें।</p>
      </div>

      {/* --- वीडियो सत्संग --- */}
      <div className="satsang-section">
        <h2>वीडियो सत्संग</h2>
        <div className="video-list">
          {videos.length === 0 ? (
            <p>अभी कोई वीडियो उपलब्ध नहीं है।</p>
          ) : (
            videos.map(video => (
              <a 
                key={video.video_id} 
                href={video.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="video-card-link"
              >
                <div className="video-card card">
                  <img src={video.thumbnail_url} alt={video.title} className="video-thumbnail" />
                  <h4 className="video-title">{video.title}</h4>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* --- पवित्र शास्त्र --- */}
      <div className="satsang-section">
        <h2>पवित्र शास्त्र</h2>
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
    </div>
  );
};

export default Satsang;