import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Satsang.css'; 

const Satsang = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScriptures();
  }, []);

  const fetchScriptures = async () => {
    setLoading(true);
    try {
      const response = await api.get('/scriptures');
      setScriptures(response.data.scriptures);
    } catch (err) {
      setError('सत्संग सामग्री लोड करने में विफल।');
    }
    setLoading(false);
  };

  return (
    <div className="satsang-page">
      <div className="card">
        <h3 className="card-title">📚 सत्संग एवं शास्त्र</h3>
        <p>भजन, कीर्तन और पवित्र ग्रंथ खोजें।</p>
      </div>

      {loading && <p>लोड हो रहा है...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="scripture-list">
        {scriptures.map(item => (
          <div key={item.scripture_id} className="scripture-card card">
            <div className="scripture-image">
              {/* This now correctly uses cover_url */}
              <img src={item.cover_url} alt={item.title} />
            </div>
            <div className="scripture-info">
              {/* This now correctly uses category */}
              <span className="scripture-type">{item.category}</span>
              <h4 className="scripture-title">{item.title}</h4>
              <p className="scripture-desc">{item.description}</p>
              <p className="scripture-author">{item.author}</p>
              <button 
                className="btn btn-primary" 
                disabled={!item.content_url}
                onClick={() => item.content_url && window.open(item.content_url, '_blank')}
              >
                {/* This now correctly uses category */}
                {item.category === 'book' ? 'पढ़ें' : 'सुनें'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Satsang;