// frontend/src/components/Satsang.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Satsang.css'; //

const Satsang = () => {
  // 🛑 FIX: Initialize state with empty arrays [] to prevent .map error
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        // 🛑 FIX: Use the correct API paths from media.js
        const videoRes = await api.get('/media/videos');
        const audioRes = await api.get('/media/audio');
        
        setVideos(videoRes.data);
        setAudios(audioRes.data);
      } catch (err) {
        console.error('Failed to fetch media', err);
        setError('Failed to load media.');
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  if (loading) {
    return <div>Loading Satsang...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="satsang-container">
      <h2>Satsang Media</h2>

      <section className="media-section">
        <h3>Videos</h3>
        <div className="media-grid">
          {videos.map((video) => (
            <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" key={video.video_id} className="media-card">
              <img src={video.thumbnail_url} alt={video.title} />
              <h4>{video.title}</h4>
            </a>
          ))}
        </div>
      </section>

      <section className="media-section">
        <h3>Audio</h3>
        <div className="media-list">
          {audios.map((audio) => (
            <div key={audio.audio_id} className="audio-card">
              <h4>{audio.title}</h4>
              <audio controls src={api.defaults.baseURL + audio.file_url}>
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Satsang;