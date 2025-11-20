import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import CommunityPost from './CommunityPost';
import CommunityPostForm from './CommunityPostForm';
import './FamilyDetail.css';

const FamilyDetail = () => {
  const { family_id } = useParams();
  const [family, setFamily] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [famRes, postRes] = await Promise.all([
        api.get(`/families/${family_id}`),
        api.get(`/community/family/${family_id}`)
      ]);
      setFamily(famRes.data);
      setPosts(postRes.data || []);
      setError('');
    } catch (e) {
      setError('Failed to load family details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [family_id]);

  return (
    <div className="family-detail-page">
      {loading && <div className="loading-pulse">Loading...</div>}
      {error && <div className="family-error-banner">{error}</div>}
      {family && (
        <div className="card family-header-card">
          <div className="family-header-left">
            <div className="family-avatar-large">{family.family_name?.slice(0,2).toUpperCase()}</div>
            <div>
              <h2>{family.family_name}</h2>
              <div className="code-pill">Code: {family.family_code}</div>
            </div>
          </div>
          <div className="family-members">
            {family.members?.map(m => (
              <div key={m.user_id} className="member-chip">
                <span className="member-name">{m.name}</span>
                {m.is_admin ? <span className="member-role">Admin</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Share with family</h3>
        <CommunityPostForm family_id={family_id} onPostCreated={loadData} />
      </div>

      <div className="post-list">
        {posts.map(p => <CommunityPost key={p.post_id} post={p} />)}
        {posts.length === 0 && <div className="card"><p>No posts yet.</p></div>}
      </div>
    </div>
  );
};

export default FamilyDetail;