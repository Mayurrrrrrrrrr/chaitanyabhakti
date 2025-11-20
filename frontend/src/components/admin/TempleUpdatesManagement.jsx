import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminForms.css';

const TempleUpdatesManagement = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement', // 'announcement', 'blog', 'alert'
  });
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/satsang'); 
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', formData.content);
      fd.append('post_type', 'text');
      await api.post('/community', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData({ title: '', content: '', type: 'announcement' });
      alert('Update posted successfully!');
      fetchPosts();
    } catch (err) {
      alert('Failed to post update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-management">
      <div className="admin-section-header">
        <h3>Manage Temple Updates</h3>
      </div>

      <div className="card form-card mb-4">
        <h4>Post New Update</h4>
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
                <div className="form-group flex-2">
                    <label>Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="form-group flex-1">
                    <label>Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="announcement">Announcement</option>
                        <option value="blog">Blog</option>
                        <option value="alert">Alert</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label>Content</label>
                <textarea rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required></textarea>
            </div>
            <button type="submit" className="admin-btn" disabled={loading}>{loading ? 'Posting...' : 'Publish'}</button>
        </form>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
            <thead><tr><th>Title</th><th>Type</th><th>Date</th></tr></thead>
            <tbody>
                {posts.map(post => (
                    <tr key={post.post_id}>
                        <td>{post.title}</td>
                        <td><span className={`badge badge-${post.type}`}>{post.type}</span></td>
                        <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan="3" className="text-center">No updates found.</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default TempleUpdatesManagement;