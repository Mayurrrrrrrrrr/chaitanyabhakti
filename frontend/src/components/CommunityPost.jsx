//
// FILE: frontend/src/components/CommunityPost.jsx
//
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './CommunityPost.css';
import { FiUser, FiHeart, FiMessageSquare } from 'react-icons/fi';

// Helper to format dates
const formatPostDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const CommunityPost = ({ post }) => {
  const { user } = useAuth();
  const isOwner = post.user_id === user.id;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">
          {post.profile_photo ? (
            <img src={post.profile_photo} alt={post.name} />
          ) : (
            <FiUser />
          )}
        </div>
        <div className="post-user-info">
          <span className="post-user-name">
            {post.name} {post.spiritual_name ? `(${post.spiritual_name})` : ''}
          </span>
          <span className="post-date">{formatPostDate(post.created_at)}</span>
        </div>
        {isOwner && <button className="post-delete-btn">×</button>}
      </div>

      <div className="post-content">
        {post.content && <p>{post.content}</p>}
        {post.post_type === 'image' && post.image_url && (
          <img src={post.image_url} alt="Post" className="post-image" />
        )}
        {post.post_type === 'video' && post.video_url && (
          <div className="post-video-container">
            {/* Basic video link - a proper embed would be better */}
            <a href={post.video_url} target="_blank" rel="noopener noreferrer">
              Watch Video: {post.video_url}
            </a>
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className="action-btn">
          <FiHeart /> Like ({post.likes_count})
        </button>
        <button className="action-btn">
          <FiMessageSquare /> Comment ({post.comments_count})
        </button>
      </div>
    </div>
  );
};

export default CommunityPost;