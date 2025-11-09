import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css'; // हम यह CSS फ़ाइल बनाएँगे

const Profile = () => {
  // हम AuthContext से उपयोगकर्ता की जानकारी और फ़ॉन्ट फ़ंक्शन लाते हैं
  const { user, logout, fontSize, changeFontSize } = useAuth();
  
  // स्टेट्स को उपयोगकर्ता के मौजूदा डेटा के साथ शुरू करें
  const [name, setName] = useState(user.name);
  const [spiritualName, setSpiritualName] = useState(user.spiritual_name || '');
  const [message, setMessage] = useState('');

  // प्रोफ़ाइल अपडेट करने के लिए
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', {
        name: name,
        spiritual_name: spiritualName,
      });
      setMessage('प्रोफ़ाइल सफलतापूर्वक अपडेट हो गयी है।');
      // हम यहाँ यूज़र स्टेट को भी अपडेट कर सकते हैं, लेकिन पेज रिफ्रेश आसान है
    } catch (error) {
      setMessage('अपडेट करने में विफल।');
    }
  };

  return (
    <div className="profile-page">
      {/* 1. प्रोफ़ाइल जानकारी कार्ड */}
      <div className="card profile-card">
        <img
          src={user.profile_photo || 'https://via.placeholder.com/100'}
          alt="Profile"
          className="profile-photo"
        />
        <h3 className="profile-name">{user.name}</h3>
        <p className="profile-mobile">{user.mobile_number}</p>
      </div>

      {/* 2. फ़ॉन्ट साइज़ चुनने का कार्ड */}
      <div className="card">
        <h3 className="card-title">अक्षर का आकार (Font Size)</h3>
        <p>पढ़ने में आसानी के लिए अक्षर का आकार चुनें।</p>
        <div className="font-selector">
          <button
            onClick={() => changeFontSize('font-medium')}
            className={`font-btn ${fontSize === 'font-medium' ? 'active' : ''}`}
          >
            मध्यम
          </button>
          <button
            onClick={() => changeFontSize('font-large')}
            className={`font-btn ${fontSize === 'font-large' ? 'active' : ''}`}
          >
            बड़ा
          </button>
          <button
            onClick={() => changeFontSize('font-xlarge')}
            className={`font-btn ${fontSize === 'font-xlarge' ? 'active' : ''}`}
          >
            अतिरिक्त बड़ा
          </button>
        </div>
      </div>

      {/* 3. प्रोफ़ाइल एडिट करने का कार्ड */}
      <div className="card">
        <h3 className="card-title">प्रोफ़ाइल एडिट करें</h3>
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleProfileUpdate} className="form-container">
          <div className="form-group">
            <label className="form-label" htmlFor="name">आपका नाम</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sname">आध्यात्मिक नाम (वैकल्पिक)</label>
            <input
              id="sname"
              type="text"
              value={spiritualName}
              onChange={(e) => setSpiritualName(e.target.value)}
              placeholder="जैसे: गोविंद दास"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">सेव करें</button>
        </form>
      </div>
      
      {/* 4. लॉगआउट बटन */}
      <button onClick={logout} className="btn-logout">
        लॉग आउट
      </button>
    </div>
  );
};

export default Profile;