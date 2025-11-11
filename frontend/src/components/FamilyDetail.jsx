// frontend/src/components/FamilyDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './FamilyDetail.css'; //

const FamilyDetail = () => {
  const { id: familyId } = useParams(); // Get the family ID from the URL
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for the new post form
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // Memoized fetch function
  const fetchFamilyData = useCallback(async () => {
    // 🛑 FIX: Don't fetch if familyId is not set
    if (!familyId) {
      setLoading(false);
      setError('Invalid Family ID.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      // Use the correct, non-undefined ID
      const res = await api.get(`/families/${familyId}`);
      setFamily(res.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('डेटा लोड करने में विफल: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [familyId]); // Re-run only if familyId changes

  useEffect(() => {
    fetchFamilyData();
  }, [fetchFamilyData]);

  // Handle submitting a new post to the family feed
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postContent && !postImage) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append('family_id', familyId);
    formData.append('content', postContent);
    if (postImage) {
      formData.append('image', postImage);
    }

    try {
      // This route comes from community.js
      await api.post('/community', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPostContent('');
      setPostImage(null);
      fetchFamilyData(); // Refresh the family data (which should include posts)
    } catch (err) {
      setError('Failed to create post.');
    } finally {
      setIsPosting(false);
    }
  };

  // 🛑 FIX: Show loading or error until `family` object exists
  if (loading) {
    return <div>परिवार लोड हो रहा है...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!family) {
    return <div className="error-message">Family not found.</div>;
  }

  const amIAdmin = family.members.find(m => m.user_id === user.id)?.is_admin;

  return (
    <div className="family-detail-container">
      <header className="family-header">
        <h2>{family.family_name}</h2>
        <p>Invite Code: <strong>{family.family_code}</strong></p>
        {amIAdmin && (
          <button onClick={() => navigate(`/admin/family/${family.family_id}`)}>
            Manage Family
          </button>
        )}
      </header>

      {/* New Post Form */}
      <div className="new-post-form">
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share an update with your family..."
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPostImage(e.target.files[0])}
          />
          <button type="submit" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
      
      {/* Member List */}
      <section className="family-members">
        <h3>Members</h3>
        <div className="member-list">
          {family.members.map(member => (
            <div key={member.user_id} className="member-card">
              <img src={api.defaults.baseURL + member.profile_photo} alt={member.name} />
              <strong>{member.name}</strong>
              <span>{member.relation_label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Family Feed (Assuming 'posts' are part of the family data) */}
      <section className="family-feed">
        <h3>Family Feed</h3>
        {family.posts && family.posts.length > 0 ? (
          family.posts.map(post => (
            <div key={post.post_id} className="post-card">
              <div className="post-header">
                <img src={api.defaults.baseURL + post.profile_photo} alt={post.name} />
                <strong>{post.name}</strong>
              </div>
              <p>{post.content}</p>
              {post.image_url && (
                <img src={api.defaults.baseURL + post.image_url} alt="Post content" className="post-image" />
              )}
            </div>
          ))
        ) : (
          <p>No posts in this family yet.</p>
        )}
      </section>
    </div>
  );
};

export default FamilyDetail;