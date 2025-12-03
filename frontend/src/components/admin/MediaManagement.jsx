// frontend/src/components/admin/MediaManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaList, setMediaList] = useState({ videos: [], audio: [] });

  const fileInputRef = useRef();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const [videosRes, audioRes] = await Promise.all([
        api.get('/media/videos'),
        api.get('/media/audio')
      ]);
      setMediaList({
        videos: videosRes.data || [],
        audio: audioRes.data || []
      });
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/media/${type}/${id}`);
      setMessage({ text: 'Item deleted successfully', type: 'success' });
      fetchMedia();
    } catch (err) {
      console.error('Delete error:', err);
      setMessage({ text: 'Failed to delete item', type: 'error' });
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const videoData = {
        title: videoTitle,
        video_url: videoUrl,
        description: videoDescription,
        is_public: 1,
        category: 'satsang'
      };
      await api.post('/media/video', videoData);

      setMessage({ text: 'Video added successfully!', type: 'success' });
      setVideoTitle('');
      setVideoUrl('');
      setVideoDescription('');
      fetchMedia();
    } catch (err) {
      console.error('Failed to add video:', err);
      setMessage({ text: err.response?.data?.error || 'Error adding video.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAudioSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!audioFile) {
      setMessage({ text: 'Please select an audio file.', type: 'error' });
      return;
    }

    // ✅ FIX: Validate file size (max 50MB for audio)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (audioFile.size > maxSize) {
      setMessage({ text: 'Audio file is too large. Maximum size is 50MB.', type: 'error' });
      return;
    }

    // ✅ FIX: Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.type)) {
      setMessage({ text: 'Invalid file type. Please upload MP3, WAV, or OGG files.', type: 'error' });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', audioTitle);
    formData.append('audio_file', audioFile);
    formData.append('is_public', 1);
    formData.append('category', 'kirtan');

    try {
      await api.post('/media/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setMessage({ text: 'Audio uploaded successfully!', type: 'success' });
      setAudioTitle('');
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadProgress(0);
      fetchMedia();
    } catch (err) {
      console.error('Failed to upload audio:', err);
      setMessage({ text: err.response?.data?.error || 'Error uploading audio. Check file size and format.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="admin-page-container">
      <h2>Manage Satsang Media</h2>

      {message.text && (
        <p className={message.type === 'error' ? "error-message" : "success-message"}>
          {message.text}
        </p>
      )}

      {/* Add Video Form */}
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

      {/* Upload Audio Form */}
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
          <label htmlFor="audio-file">Audio File (MP3, WAV, OGG - Max 50MB)</label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={(e) => setAudioFile(e.target.files[0])}
            required
          />
          {audioFile && (
            <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
              Selected: {audioFile.name} ({formatFileSize(audioFile.size)})
            </small>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress" style={{ marginBottom: '16px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FF9933, #E67E22)',
                transition: 'width 0.3s'
              }}></div>
            </div>
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
              Uploading... {uploadProgress}%
            </small>
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? `Uploading... ${uploadProgress}%` : 'Upload Audio'}
        </button>
      </form>

      <hr className="divider" />

      {/* Media List */}
      <div className="admin-list">
        <h3>Existing Media</h3>

        <div className="media-section">
          <h4>Videos</h4>
          {mediaList.videos.length === 0 ? (
            <p>No videos found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mediaList.videos.map(v => (
                  <tr key={v.video_id || v.media_id}>
                    <td>{v.title}</td>
                    <td className="truncate-cell" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.youtube_url || v.video_url}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete('video', v.video_id || v.media_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="media-section" style={{ marginTop: '32px' }}>
          <h4>Audio</h4>
          {mediaList.audio.length === 0 ? (
            <p>No audio files found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mediaList.audio.map(a => (
                  <tr key={a.audio_id || a.media_id}>
                    <td>{a.title}</td>
                    <td>{a.category}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete('audio', a.audio_id || a.media_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaManagement;