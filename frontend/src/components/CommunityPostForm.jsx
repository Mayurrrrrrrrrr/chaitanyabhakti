//
// FILE: frontend/src/components/CommunityPostForm.jsx
//
import React, { useState } from 'react';
import api from '../services/api';
import './CommunityPostForm.css';
import { FiSend, FiImage } from 'react-icons/fi';

const CommunityPostForm = ({ family_id, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !image) {
      setError('Please write a message or upload an image.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('family_id', family_id);
    
    if (content) {
      formData.append('content', content);
    }
    if (image) {
      formData.append('file', image);
      formData.append('post_type', 'image');
    } else {
      formData.append('post_type', 'text');
    }

    try {
      await api.post('/community', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Clear form
      setContent('');
      setImage(null);
      // Reset file input
      document.getElementById(`file-input-${family_id}`).value = null;
      
      onPostCreated(); // Tell the parent to refresh the feed
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Could not submit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      <textarea
        placeholder="Share something with your family..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      {image && <div className="image-preview">{image.name}</div>}
      <div className="form-actions">
        <label htmlFor={`file-input-${family_id}`} className="file-label">
          <FiImage />
          <span>{image ? 'Change' : 'Add'} Image</span>
        </label>
        <input
          type="file"
          id={`file-input-${family_id}`}
          accept="image/*"
          onChange={handleImageChange}
        />
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : <FiSend />}
        </button>
      </div>
    </form>
  );
};

export default CommunityPostForm;