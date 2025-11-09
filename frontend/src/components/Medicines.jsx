import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Medicines.css'; // हम यह CSS फ़ाइल बनाएँगे

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // नए मेडिसिन फॉर्म के लिए स्टेट
  const [showForm, setShowForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState([{ time: '08:00' }]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data.medicines);
    } catch (err) {
      setError('दवाएँ लोड करने में विफल।');
    }
    setLoading(false);
  };

  // समय जोड़ने/घटाने के लिए हेल्पर्स
  const handleTimeChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index].time = value;
    setTimes(newTimes);
  };

  const addTimeSlot = () => {
    setTimes([...times, { time: '14:00' }]);
  };

  const removeTimeSlot = (index) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  // नई दवा सेव करें
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    const timeArray = times.map(t => t.time); // ["08:00", "14:00"]
    
    try {
      await api.post('/medicines/add', {
        medicine_name: medName,
        dosage: dosage,
        times: JSON.stringify(timeArray), // JSON स्ट्रिंग के रूप में भेजें
        start_date: new Date().toISOString().split('T')[0], // आज से शुरू करें
        frequency: `${timeArray.length} बार प्रतिदिन`
      });
      
      // फॉर्म रीसेट करें और लिस्ट रिफ्रेश करें
      setMedName('');
      setDosage('');
      setTimes([{ time: '08:00' }]);
      setShowForm(false);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.error || 'दवा जोड़ने में विफल।');
    }
  };

  return (
    <div className="medicine-page">
      <div className="card">
        <h3 className="card-title">💊 मेरी दवाएँ</h3>
        <p>अपनी दवाओं और उनके समय का ध्यान रखें।</p>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'फॉर्म बंद करें' : '+ नई दवा जोड़ें'}
        </button>
      </div>

      {/* --- नई दवा का फॉर्म --- */}
      {showForm && (
        <div className="card">
          <form onSubmit={handleAddMedicine} className="form-container">
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label className="form-label">दवा का नाम</label>
              <input
                type="text"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="जैसे: पैरासिटामोल"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">खुराक (Dosage)</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="जैसे: 1 गोली, 5ml"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">लेने का समय</label>
              {times.map((item, index) => (
                <div key={index} className="time-slot">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="form-input time-input"
                    required
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => removeTimeSlot(index)} className="btn-remove-time">
                      X
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTimeSlot} className="btn-add-time">
                + और समय जोड़ें
              </button>
            </div>
            
            <button type="submit" className="btn btn-secondary">दवा सेव करें</button>
          </form>
        </div>
      )}

      {/* --- दवाओं की सूची --- */}
      <div className="medicine-list">
        <h2>मेरी दवा की सूची</h2>
        {loading && <p>लोड हो रहा है...</p>}
        {medicines.length === 0 && !loading && (
          <p>आपने अभी तक कोई दवा नहीं जोड़ी है।</p>
        )}
        {medicines.map(med => (
          <div key={med.medicine_id} className="medicine-card card">
            <h4 className="med-title">{med.medicine_name}</h4>
            <p className="med-dosage">{med.dosage}</p>
            <div className="med-times">
              {JSON.parse(med.times).map((time, idx) => (
                <span key={idx} className="med-time-tag">{time}</span>
              ))}
            </div>
            {/* हम यहाँ 'taken' बटन भी जोड़ सकते हैं */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medicines;