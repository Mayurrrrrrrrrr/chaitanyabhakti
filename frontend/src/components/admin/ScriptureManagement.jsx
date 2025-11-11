// frontend/src/components/admin/ScriptureManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminForms.css';

const ScriptureManagement = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 🛑 Form state for files
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [coverUrlLink, setCoverUrlLink] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const fetchScriptures = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scriptures');
      setScriptures(res.data);
    } catch (err) {
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
    
    // 🛑 Use FormData for file uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('cover_url_link', coverUrlLink); // Send link (if any)
    
    if (coverFile) {
      formData.append('cover_file', coverFile);
    }
    if (pdfFile) {
      formData.append('pdf_file', pdfFile);
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }

    try {
      await api.post('/admin/scriptures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Reset form
      setTitle('');
      setCategory('Other');
      setDescription('');
      setCoverUrlLink('');
      setCoverFile(null);
      setPdfFile(null);
      setAudioFile(null);
      fetchScriptures(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add scripture.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/admin/scriptures/${id}`);
        fetchScriptures();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete scripture.');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Manage Scriptures</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Add New Scripture</h3>
        <input
          type="text"
          placeholder="Scripture Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Gita">Gita</option>
          <option value="Purana">Purana</option>
          <option value="Stotra">Stotra</option>
          <option value="Upanishad">Upanishad</option>
          <option value="Kirtan">Kirtan</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <label>Cover Image (Link)</label>
        <input
          type="url"
          placeholder="OR paste Cover Image URL"
          value={coverUrlLink}
          onChange={(e) => setCoverUrlLink(e.target.value)}
        />
        
        <label>Cover Image (Upload)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files[0])}
        />
        
        <label>PDF File (Upload)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />
        
        <label>Audio File (Upload)</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
        />
        
        <button type="submit">Add Scripture</button>
      </form>

      <div className="admin-list">
        <h3>Existing Scriptures</h3>
        {loading ? <p>Loading...</p> : (
          <table>
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