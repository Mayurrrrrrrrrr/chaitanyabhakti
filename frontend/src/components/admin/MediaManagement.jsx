// frontend/src/components/admin/MediaManagement.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import './AdminForms.css'; 

const MediaManagement = () => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  
  const [audioTitle, setAudioTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Helper to reset file input
  const fileInputRef = React.useRef();

  // Handle submitting a new video link
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);
    
    try {
      const videoData = {
        title: videoTitle,
        youtube_url: videoUrl,
        description: videoDescription,
        is_public: 1, // Default to public
        category: 'satsang'
      };
      // Backend: router.post('/video') mounted at /api/media
      await api.post('/media/video', videoData);
      
      setMessage({ text: 'Video added successfully!', type: 'success' });
      setVideoTitle('');
      setVideoUrl('');
      setVideoDescription('');
    } catch (err) {
      console.error('Failed to add video:', err);
      setMessage({ text: err.response?.data?.error || 'Error adding video.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle uploading a new audio file
  const handleAudioSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!audioFile) {
      setMessage({ text: 'Please select an audio file.', type: 'error' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', audioTitle);
    formData.append('audio_file', audioFile); 
    formData.append('is_public', 1);
    formData.append('category', 'kirtan'); // Default category

    try {
      // Backend: router.post('/audio') mounted at /api/media
      await api.post('/media/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage({ text: 'Audio uploaded successfully!', type: 'success' });
      setAudioTitle('');
      setAudioFile(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Failed to upload audio:', err);
      setMessage({ text: err.response?.data?.error || 'Error uploading audio.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Manage Satsang Media</h2>
      
      {message.text && (
        <p className={message.type === 'error' ? "error-message" : "success-message"}>
          {message.text}
        </p>
      )}

      {/* --- Add Video Form --- */}
      <form onSubmit={handleVideoSubmit} className="admin-form">
        <h3>Add YouTube Video</h3>
        <div className="form-group">
          <label htmlFor="video-title">Video Title</label>
          <input
            id="video-title"
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            required
            placeholder="e.g., Morning Satsang"
          />
        </div>
        <div className="form-group">
          <label htmlFor="video-url">YouTube URL</label>
          <input
            id="video-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="video-desc">Description (Optional)</label>
          <textarea
            id="video-desc"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            rows="3"
          />
        </div>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processing...' : 'Add Video'}
        </button>
      </form>

      <hr className="divider" />

      {/* --- Upload Audio Form --- */}
      <form onSubmit={handleAudioSubmit} className="admin-form">
        <h3>Upload Audio File</h3>
        <div className="form-group">
          <label htmlFor="audio-title">Audio Title</label>
          <input
            id="audio-title"
            type="text"
            value={audioTitle}
            onChange={(e) => setAudioTitle(e.target.value)}
            required
            placeholder="e.g., Kirtan Recording"
          />
        </div>
        <div className="form-group">
          <label htmlFor="audio-file">Audio File (MP3)</label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={(e) => setAudioFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="btn-submit" disabled={loading}>
           {loading ? 'Uploading...' : 'Upload Audio'}
        </button>
      </form>
    </div>
  );
};

export default MediaManagement;