// frontend/src/components/Satsang.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Satsang.css';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiYoutube, FiFileText, FiImage, FiMic } from 'react-icons/fi';

const Satsang = () => {
  const { user } = useAuth(); // Get user to check for admin status
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the upload forms
  const [uploadType, setUploadType] = useState('text'); // text, video, image, pdf
  const [postContent, setPostContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      // 🛑 FIX: Use the new single 'satsang' route from community.js
      const res = await api.get('/community/satsang');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch media', err);
      setError('Failed to load media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('post_type', uploadType);
    // family_id is null for global Satsang posts
    
    if (uploadType === 'text') {
      formData.append('content', postContent);
    } else if (uploadType === 'video') {
      formData.append('content', postContent); // Use content for title
      formData.append('video_url', videoUrl);
    } else if (uploadType === 'pdf' || uploadType === 'image') {
      if (!file) {
        setUploadError('Please select a file.');
        return;
      }
      formData.append('content', postContent); // Use content for title/description
      formData.append('file', file);
    }

    try {
      await api.post('/community', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess('Post created!');
      // Reset forms
      setPostContent('');
      setVideoUrl('');
      setFile(null);
      fetchMedia(); // Refresh list
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to create post.');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/community/${postId}`);
        fetchMedia(); // Refresh list
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };
  
  const renderPost = (post) => {
    const isOwner = post.user_id === user.id;
    const canDelete = user.is_super_admin || isOwner;

    return (
      <div className="post-card" key={post.post_id}>
        <div className="post-header">
          <img src={api.defaults.baseURL + post.profile_photo} alt={post.name} />
          <strong>{post.name}</strong>
          {canDelete && (
            <button className="delete-btn" onClick={() => handleDelete(post.post_id)}>
              <FiTrash2 />
            </button>
          )}
        </div>
        <p>{post.content}</p>
        {post.post_type === 'image' && post.image_url && (
          <img src={api.defaults.baseURL + post.image_url} alt="Post" className="post-image" />
        )}
        {post.post_type === 'video' && post.video_url && (
          <a href={post.video_url} target="_blank" rel="noopener noreferrer">Watch Video <FiYoutube/></a>
        )}
        {post.post_type === 'pdf' && post.file_url && (
          <a href={api.defaults.baseURL + post.file_url} target="_blank" rel="noopener noreferrer">View PDF <FiFileText/></a>
        )}
        {/* We can add audio type later */}
      </div>
    );
  };

  const renderUploadForm = () => (
    <form onSubmit={handleSubmit} className="upload-form">
      {uploadType === 'text' && (
        <textarea
          placeholder="Share a quote or thought..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          required
        />
      )}
      {uploadType === 'video' && (
        <>
          <input
            type="text"
            placeholder="Video Title"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
          />
        </>
      )}
      {uploadType === 'image' && (
        <>
          <input
            type="text"
            placeholder="Image description..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </>
      )}
      {uploadType === 'pdf' && (
        <>
          <input
            type="text"
            placeholder="PDF Title"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </>
      )}
      <button type="submit">Post to Satsang</button>
    </form>
  );

  return (
    <div className="satsang-container">
      <h2>Satsang Feed</h2>

      <div className="upload-section">
        <h3>Share to Satsang</h3>
        {uploadError && <p className="error-message">{uploadError}</p>}
        {uploadSuccess && <p className="success-message">{uploadSuccess}</p>}
        
        <div className="upload-toggles">
          <button onClick={() => setUploadType('text')} className={uploadType === 'text' ? 'active' : ''}><FiFileText/> Text</button>
          <button onClick={() => setUploadType('video')} className={uploadType === 'video' ? 'active' : ''}><FiYoutube/> Video</button>
          <button onClick={() => setUploadType('image')} className={uploadType === 'image' ? 'active' : ''}><FiImage/> Image</button>
          <button onClick={() => setUploadType('pdf')} className={uploadType === 'pdf' ? 'active' : ''}><FiFileText/> PDF</button>
        </div>
        
        {renderUploadForm()}
      </div>

      {loading && <p>Loading Satsang feed...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="feed-list">
        {!loading && posts.length === 0 && <p>No posts in the Satsang feed yet.</p>}
        {posts.map(renderPost)}
      </div>
    </div>
  );
};

export default Satsang;