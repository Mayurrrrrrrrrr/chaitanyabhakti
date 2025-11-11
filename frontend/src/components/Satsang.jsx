import React, { useEffect, useState } from 'react';
import api, { baseURL } from '../services/api';
import ReactPlayer from 'react-player'; // 🛑 FIX: Correct import path
import './Satsang.css';
import { FiVideo, FiMusic } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

// A reusable component for video items
const VideoCard = ({ item }) => (
  <div className="media-card video-card">
    <div className="media-player-wrapper">
      {/* 🛑 FIX: Use ReactPlayer to embed the video */}
      <ReactPlayer
        className="react-player"
        url={item.youtube_url}
        width="100%"
        height="100%"
        controls={true}
      />
    </div>
    <div className="media-info">
      <h3>{item.title}</h3>
      <p>{item.description || 'Satsang Video'}</p>
    </div>
  </div>
);

// A reusable component for audio items
const AudioCard = ({ item }) => (
  <div className="media-card audio-card">
    <div className="media-info">
      <FiMusic size={24} className="media-icon" />
      <h3>{item.title || 'Audio Recording'}</h3>
      {/* 🛑 FIX: Prepend baseURL to the file_url */}
      <audio controls src={`${baseURL}${item.file_url}`}>
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
);

const Satsang = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage(); // Get translation function

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        // Fetch public videos and audios
        const [videosRes, audiosRes] = await Promise.all([
          api.get('/media/videos'), // Fetches public videos
          api.get('/media/audio')   // Fetches public audios
        ]);

        // Combine and sort by date
        const combined = [
          ...videosRes.data.map(v => ({ ...v, type: 'video', date: v.added_at })),
          ...audiosRes.data.map(a => ({ ...a, type: 'audio', date: a.uploaded_at }))
        ];

        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMedia(combined);
      } catch (err) {
        console.error('Failed to fetch media:', err);
        setError('Failed to load satsang feed.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="satsang-container">
      <header className="satsang-header">
        <h1>{t('satsang')}</h1>
        <p>{t('community_feed')}</p>
      </header>

      {loading && <div>Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="media-list">
        {media.map((item) => (
          item.type === 'video' 
            ? <VideoCard key={`video-${item.video_id}`} item={item} />
            : <AudioCard key={`audio-${item.audio_id}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Satsang;