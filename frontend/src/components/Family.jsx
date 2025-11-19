import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api'; // Corrected path
import './Family.css';

// --- Inline Icons (No external dependencies) ---
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconLogIn = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconHash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;

const Family = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'join', 'create'

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/families');
      setFamilies(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to load families:', err);
      setError('Could not load spiritual families.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if(!joinCode.trim()) return;
    
    try {
      setLoading(true);
      await api.post('/families/join', { family_code: joinCode });
      setJoinCode('');
      setActiveTab('list');
      fetchFamilies();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid Family Code');
      setLoading(false);
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if(!createName.trim()) return;

    try {
      setLoading(true);
      await api.post('/families', { family_name: createName });
      setCreateName('');
      setActiveTab('list');
      fetchFamilies(); 
    } catch (err) {
      setError('Could not create family group.');
      setLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="page-container family-page">
      <header className="page-header">
        <h1 className="page-title">Spiritual Associations</h1>
        <p className="page-subtitle">Connect with your Satsang groups</p>
      </header>

      {/* Glassmorphic Navigation Tabs */}
      <div className="family-nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('list'); setError(''); }}
          >
            <IconUsers /> My Groups
          </button>
          <button 
            className={`nav-tab ${activeTab === 'join' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('join'); setError(''); }}
          >
            <IconLogIn /> Join
          </button>
          <button 
            className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('create'); setError(''); }}
          >
            <IconPlus /> Create
          </button>
      </div>

      {/* Error Banner */}
      {error && <div className="family-error-banner">{error}</div>}

      <div className="family-content-area">
        
        {/* --- LIST TAB --- */}
        {activeTab === 'list' && (
          <div className="family-list-view fade-in">
            {loading ? (
              <div className="loading-pulse">Loading connections...</div>
            ) : families.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><IconUsers /></div>
                <h3>No families yet</h3>
                <p>Join an existing group or create a new one to start connecting.</p>
                <button className="btn-primary" onClick={() => setActiveTab('create')}>Create New</button>
              </div>
            ) : (
              <div className="family-grid">
                {families.map((family) => (
                  <Link to={`/family/${family.family_id}`} key={family.family_id} className="card family-card">
                    <div className="family-card-header">
                        <div className="family-avatar" style={{ backgroundColor: `hsl(${(family.family_id * 137) % 360}, 70%, 80%)` }}>
                            {getInitials(family.family_name)}
                        </div>
                        <div className="family-info">
                            <h3>{family.family_name}</h3>
                            <span className="member-count">Click to view details</span>
                        </div>
                        <div className="family-arrow">
                            <IconArrowRight />
                        </div>
                    </div>
                    <div className="family-card-footer">
                        <div className="code-pill">
                            <IconHash /> Code: {family.family_code}
                        </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- JOIN TAB --- */}
        {activeTab === 'join' && (
          <div className="family-form-view fade-in">
            <div className="card form-card centered-card">
              <div className="form-icon-header join-bg">
                <IconLogIn />
              </div>
              <h3>Join a Family</h3>
              <p>Enter the unique 6-character code shared by your group admin.</p>
              
              <form onSubmit={handleJoinFamily}>
                <div className="form-group">
                    <input
                        type="text"
                        className="input-large text-center"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        maxLength={8}
                        required
                    />
                </div>
                <button className="btn-primary full-width" type="submit" disabled={loading}>
                    {loading ? 'Joining...' : 'Join Family'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- CREATE TAB --- */}
        {activeTab === 'create' && (
          <div className="family-form-view fade-in">
            <div className="card form-card centered-card">
              <div className="form-icon-header create-bg">
                <IconPlus />
              </div>
              <h3>Create New Group</h3>
              <p>Start a new spiritual circle. You will be the administrator.</p>
              
              <form onSubmit={handleCreateFamily}>
                <div className="form-group">
                    <label>Group Name</label>
                    <input
                        type="text"
                        className="input-field"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="e.g. Vrindavan Dham Yatra"
                        required
                    />
                </div>
                <button className="btn-primary full-width" type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Family;