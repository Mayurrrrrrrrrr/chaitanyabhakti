// frontend/src/components/admin/ScriptureManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './AdminForms.css';

const ScriptureManagement = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [coverUrlLink, setCoverUrlLink] = useState('');
  
  // File refs to clear inputs after submit
  const coverInputRef = useRef();
  const pdfInputRef = useRef();
  const audioInputRef = useRef();

  // State for files
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const fetchScriptures = async () => {
    try {
      setLoading(true);
      // Get public scriptures list
      // Backend: router.get('/') mounted at /api/scriptures
      const res = await api.get('/scriptures');
      setScriptures(res.data);
    } catch (err) {
      console.error("Fetch scriptures error:", err);
      setError('Failed to fetch scriptures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScriptures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    // Backend expects multipart/form-data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('cover_url_link', coverUrlLink); // Optional link
    
    // Field names MUST match backend upload.fields configuration
    if (coverFile) formData.append('cover_file', coverFile);
    if (pdfFile) formData.append('pdf_file', pdfFile);
    if (audioFile) formData.append('audio_file', audioFile);

    try {
      setLoading(true);
      // Backend: router.post('/scriptures') mounted at /api/admin
      await api.post('/admin/scriptures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccessMsg('Scripture added successfully!');
      
      // Reset form
      setTitle('');
      setCategory('Other');
      setDescription('');
      setCoverUrlLink('');
      setCoverFile(null);
      setPdfFile(null);
      setAudioFile(null);
      
      // Clear file inputs visually
      if(coverInputRef.current) coverInputRef.current.value = '';
      if(pdfInputRef.current) pdfInputRef.current.value = '';
      if(audioInputRef.current) audioInputRef.current.value = '';

      fetchScriptures(); 
    } catch (err) {
      console.error("Add scripture error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to add scripture.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scripture?')) {
      try {
        // Backend: router.delete('/scriptures/:id') mounted at /api/admin
        await api.delete(`/admin/scriptures/${id}`);
        setSuccessMsg('Scripture deleted.');
        fetchScriptures();
      } catch (err) {
        console.error("Delete scripture error:", err);
        setError(err.response?.data?.message || 'Failed to delete scripture.');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Manage Scriptures</h2>
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Add New Scripture</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Scripture Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Gita">Gita</option>
            <option value="Purana">Purana</option>
            <option value="Stotra">Stotra</option>
            <option value="Upanishad">Upanishad</option>
            <option value="Kirtan">Kirtan</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Cover Image (Link)</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={coverUrlLink}
            onChange={(e) => setCoverUrlLink(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>OR Upload Cover Image</label>
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={(e) => setCoverFile(e.target.files[0])}
          />
        </div>
        
        <div className="form-group">
          <label>Upload PDF (Content)</label>
          <input
            type="file"
            accept="application/pdf"
            ref={pdfInputRef}
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
        </div>
        
        <div className="form-group">
          <label>Upload Audio (Optional)</label>
          <input
            type="file"
            accept="audio/*"
            ref={audioInputRef}
            onChange={(e) => setAudioFile(e.target.files[0])}
          />
        </div>
        
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Add Scripture'}
        </button>
      </form>

      <div className="admin-list">
        <h3>Existing Scriptures</h3>
        {loading && !scriptures.length ? <p>Loading...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scriptures.map(s => (
                <tr key={s.scripture_id}>
                  <td>{s.title}</td>
                  <td>{s.category}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(s.scripture_id)}>
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
  );
};

export default ScriptureManagement;