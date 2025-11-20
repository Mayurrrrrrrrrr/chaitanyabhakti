import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import './Satsang.css';

// --- Inline Icons (No external dependencies) ---
const IconPlay = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconPause = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IconMusic = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconVideo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const IconVolume2 = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const IconCheck = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const pickTitle = (item, language) => {
  if (language === 'en') return item.title_en || item.title;
  return item.title;
};

const Satsang = () => {
  const [activeTab, setActiveTab] = useState('video');
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef(null);
  const [language] = useState(localStorage.getItem('appLanguage') || 'hi');

  useEffect(() => {
    let mounted = true;
    api.get('/media/videos').then(res => {
      if (!mounted) return;
      const list = res.data || [];
      setVideos(list);
      setCurrentVideo(list[0] || null);
    }).catch(() => {});
    api.get('/media/audio').then(res => {
      if (!mounted) return;
      setAudios(res.data || []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // --- Audio Logic ---
  const playAudio = (audio) => {
    if (currentAudio?.id === audio.id) {
      togglePlay();
    } else {
      setCurrentAudio(audio);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Auto-play when track changes
  useEffect(() => {
    if (currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio.file_url;
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  }, [currentAudio]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  return (
    <div className="page-container satsang-page">
      <header className="page-header">
        <h1 className="page-title">Satsang & Media</h1>
        <p className="page-subtitle">Immerse yourself in divine sounds</p>
      </header>

      {/* Navigation Tabs */}
      <div className="satsang-tabs">
        <button 
          className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          <IconVideo /> Video Satsang
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <IconMusic /> Kirtan Audio
        </button>
      </div>

      <div className="media-content">
        {/* --- VIDEO SECTION --- */}
        {activeTab === 'video' && (
          <div className="video-section fade-in">
            {/* Main Player */}
            <div className="card main-video-card">
              <div className="video-wrapper">
                <iframe 
                  src={`https://www.youtube.com/embed/${currentVideo.youtube_id || ''}?autoplay=0&rel=0`} 
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <h3>{pickTitle(currentVideo, language)}</h3>
                <p>{currentVideo.description || ''}</p>
              </div>
            </div>

            {/* Video Playlist */}
            <div className="playlist-container">
              <h4 className="section-title">Up Next</h4>
              <div className="playlist-grid">
                {videos.map(video => (
                  <div 
                    key={video.video_id} 
                    className={`card playlist-item ${currentVideo && (currentVideo.video_id === video.video_id) ? 'active-video' : ''}`}
                    onClick={() => { setCurrentVideo(video); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    <div className="thumbnail-container">
                        <img 
                            src={video.thumbnail_url || (video.youtube_id ? `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg` : '')} 
                            alt={video.title} 
                            className="video-thumb"
                        />
                        <div className="play-overlay"><IconPlay /></div>
                    </div>
                    <div className="item-details">
                        <span className="item-title">{pickTitle(video, language)}</span>
                        <span className="item-subtitle">{video.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- AUDIO SECTION --- */}
        {activeTab === 'audio' && (
          <div className="audio-section fade-in">
            {/* Sticky Audio Player */}
            <div className="card audio-player-card">
                <div className="player-top">
                    <div className={`album-art ${isPlaying ? 'spinning' : ''}`}>
                        <IconMusic />
                    </div>
                    <div className="track-info">
                        {currentAudio ? (
                            <>
                                <h3>{currentAudio.title}</h3>
                                <p>{currentAudio.artist}</p>
                            </>
                        ) : (
                            <p className="placeholder-text">Select a track to begin</p>
                        )}
                    </div>
                </div>
                
                <div className="player-controls">
                   <button className="control-btn" disabled>⏮</button>
                   <button 
                        className={`play-btn ${isPlaying ? 'playing' : ''}`} 
                        onClick={togglePlay} 
                        disabled={!currentAudio}
                   >
                       {isPlaying ? <IconPause /> : <IconPlay />}
                   </button>
                   <button className="control-btn" disabled>⏭</button>
                </div>

                <div className="progress-container">
                    <input 
                        type="range" 
                        className="progress-slider" 
                        min="0" 
                        max="100" 
                        value={progress} 
                        onChange={handleSeek}
                        disabled={!currentAudio}
                    />
                </div>
                
                <audio 
                    ref={audioRef} 
                    onTimeUpdate={handleTimeUpdate} 
                    onEnded={() => setIsPlaying(false)} 
                />
            </div>

            {/* Audio Playlist */}
            <div className="playlist-container">
                <h4 className="section-title">Kirtan Library</h4>
                <div className="audio-list">
                    {audios.map(audio => (
                        <div 
                            key={audio.audio_id} 
                            className={`card audio-item ${currentAudio?.audio_id === audio.audio_id ? 'playing-row' : ''}`}
                            onClick={() => playAudio(audio)}
                        >
                            <div className="audio-status-icon">
                                {currentAudio?.audio_id === audio.audio_id && isPlaying ? (
                                    <div className="equalizer">
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                    </div>
                                ) : (
                                    <IconVolume2 />
                                )}
                            </div>
                            <div className="audio-details">
                                <span className="audio-title">{pickTitle(audio, language)}</span>
                                <span className="audio-artist">{audio.category}</span>
                            </div>
                            {currentAudio?.audio_id === audio.audio_id && <div className="now-playing-tag">Playing</div>}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Satsang;