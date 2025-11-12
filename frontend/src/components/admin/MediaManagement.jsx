import React, { useState } from 'react';
import api from '../../services/api';
import './AdminForms.css'; // We'll reuse the same CSS

const MediaManagement = () => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  
  const [audioTitle, setAudioTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  
  const [message, setMessage] = useState('');

  // Handle submitting a new video link
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const videoData = {
        title: videoTitle,
        youtube_url: videoUrl,
        description: videoDescription,
        is_public: 1, // Make it public by default
      };
      await api.post('/media/video', videoData); //
      setMessage('Video added successfully!');
      setVideoTitle('');
      setVideoUrl('');
      setVideoDescription('');
    } catch (err) {
      console.error('Failed to add video:', err);
      setMessage('Error adding video. Check console.');
    }
  };

  // Handle uploading a new audio file
  const handleAudioSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!audioFile) {
      setMessage('Please select an audio file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', audioTitle);
    formData.append('audio_file', audioFile); //
    formData.append('is_public', 1); // Make it public by default

    try {
      await api.post('/media/audio', formData, { //
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Audio uploaded successfully!');
      setAudioTitle('');
      setAudioFile(null);
      e.target.reset(); // Clear the file input
    } catch (err) {
      console.error('Failed to upload audio:', err);
      setMessage('Error uploading audio. Check console.');
    }
  };

  return (
    <div className="admin-form-container">
      <h1>Manage Satsang Media</h1>
      {message && <p className="message">{message}</p>}

      {/* --- Add Video Form --- */}
      <form onSubmit={handleVideoSubmit} className="admin-form">
        <h2>Add YouTube Video</h2>
        <div className="form-group">
          <label htmlFor="video-title">Video Title</label>
          <input
            id="video-title"
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            required
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="video-desc">Description (Optional)</label>
          <textarea
            id="video-desc"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-submit">Add Video</button>
      </form>

      {/* --- Upload Audio Form --- */}
      <form onSubmit={handleAudioSubmit} className="admin-form">
        <h2>Upload Audio File</h2>
        <div className="form-group">
          <label htmlFor="audio-title">Audio Title</label>
          <input
            id="audio-title"
            type="text"
            value={audioTitle}
            onChange={(e) => setAudioTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="audio-file">Audio File (MP3, etc.)</label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="btn-submit">Upload Audio</button>
      </form>
    </div>
  );
};

export default MediaManagement;