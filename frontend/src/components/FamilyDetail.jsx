import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './FamilyDetail.css'; // हम यह CSS फ़ाइल बनाएँगे

const FamilyDetail = () => {
  const { familyId } = useParams(); // URL से परिवार ID प्राप्त करें
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members' या 'leaderboard'

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        setLoading(true);
        // परिवार की जानकारी और सदस्य सूची प्राप्त करें
        const detailRes = await api.get(`/families/${familyId}`);
        setFamily(detailRes.data.family);
        setMembers(detailRes.data.members);

        // परिवार का लीडरबोर्ड प्राप्त करें
        const leaderboardRes = await api.get(`/japa/leaderboard/family/${familyId}`);
        setLeaderboard(leaderboardRes.data.leaderboard);

      } catch (err) {
        console.error('डेटा लोड करने में विफल:', err);
        setError('परिवार का डेटा लोड करने में विफल।');
      }
      setLoading(false);
    };

    fetchFamilyData();
  }, [familyId]);

  if (loading) {
    return <div className="page-container">परिवार लोड हो रहा है...</div>;
  }

  if (error) {
    return <div className="page-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="family-detail-page">
      <div className="card family-header-card">
        <Link to="/family" className="back-link">&lt; वापस जाएँ</Link>
        <h2 className="family-name">{family.family_name}</h2>
        <p>दूसरों को आमंत्रित करने के लिए यह कोड साझा करें:</p>
        <strong className="family-invite-code">{family.family_code}</strong>
      </div>

      {/* --- टैब नेविगेशन --- */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          सदस्य ({members.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          लीडरबोर्ड
        </button>
      </div>

      {/* --- टैब सामग्री --- */}
      <div className="tab-content">
        {activeTab === 'members' && (
          <div className="member-list">
            {members.map(member => (
              <div key={member.user_id} className="member-item card">
                <img 
                  src={member.profile_photo || 'https://via.placeholder.com/60'} 
                  alt={member.name} 
                  className="member-photo"
                />
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-relation">{member.relation || 'सदस्य'}</span>
                </div>
                {member.is_admin && <span className="admin-badge">एडमिन</span>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard">
            {leaderboard.map((entry, index) => (
              <div key={entry.user_id} className="leaderboard-item card">
                <span className="rank">{index + 1}</span>
                <img 
                  src={entry.profile_photo || 'https://via.placeholder.com/50'} 
                  alt={entry.name} 
                  className="member-photo"
                />
                <div className="member-info">
                  <span className="member-name">{entry.name}</span>
                  <span className="member-relation">{entry.relation || 'सदस्य'}</span>
                </div>
                <div className="japa-count">
                  {entry.total_malas} 
                  <span>माला</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDetail;