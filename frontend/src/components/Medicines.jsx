import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Medicines.css'; // We will update this CSS file

const Medicines = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New medicine form state
  const [showForm, setShowForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState([{ time: '08:00' }]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTodayLogs();
  }, []);

  // Fetch today's schedule
  const fetchTodayLogs = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/medicines/logs?date=${today}`);
      setLogs(response.data);
      setError('');
    } catch (err) {
      setError('आज की दवाएँ लोड करने में विफल।');
    }
    setLoading(false);
  };

  // Mark a log as 'taken' or 'skipped'
  const handleLogUpdate = async (log, status) => {
    try {
      await api.post(`/medicines/logs`, { medicine_id: log.medicine_id, status, scheduled_time: log.scheduled_time });
      setLogs(currentLogs =>
        currentLogs.map(l =>
          l.log_id === log.log_id ? { ...l, status } : l
        )
      );
    } catch (err) {
      setError('अपडेट करने में विफल।');
    }
  };

  // --- Add New Medicine Form Logic ---
  const handleTimeChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index].time = value;
    setTimes(newTimes);
  };

  const addTimeSlot = () => setTimes([...times, { time: '14:00' }]);
  
  const removeTimeSlot = (index) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setFormError('');
    const timeArray = times.map(t => t.time); // ["08:00", "14:00"]
    
    try {
      await api.post('/medicines/add', {
        medicine_name: medName,
        dosage: dosage,
        times: JSON.stringify(timeArray),
        start_date: new Date().toISOString().split('T')[0],
        frequency: `${timeArray.length} बार प्रतिदिन`
      });
      
      // Reset form & refresh list
      setMedName('');
      setDosage('');
      setTimes([{ time: '08:00' }]);
      setShowForm(false);
      fetchTodayLogs(); // Re-fetch logs, as new logs for today might have been created
    } catch (err) {
      setFormError(err.response?.data?.error || 'दवा जोड़ने में विफल।');
    }
  };
  
  // Helper to format time
  const formatTime = (isoString) => {
     try {
       const date = new Date(isoString);
       return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
     } catch (e) {
       return 'Invalid Time';
     }
  };

  return (
    <div className="medicine-page">
      <div className="card">
        <h3 className="card-title">💊 आज की दवाएँ</h3>
        <p>यहाँ आपकी आज की दवा का शेड्यूल है।</p>
      </div>

      {/* --- Today's Log List --- */}
      <div className="medicine-log-list">
        {loading && <p>लोड हो रहा है...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && logs.length === 0 && (
          <div className="card"><p>आज के लिए कोई दवा शेड्यूल नहीं है।</p></div>
        )}

        {logs.map(log => (
          <div key={log.log_id} className={`log-card card ${log.status}`}>
            <div className="log-info">
              <span className="log-time">{formatTime(log.scheduled_time)}</span>
              <h4 className="log-title">{log.medicine_name}</h4>
              <p className="log-dosage">{log.dosage_details}</p>
            </div>
            
            {/* --- Log Actions --- */}
            <div className="log-actions">
              {log.status === 'pending' ? (
                <>
                  <button 
                    className="btn-log btn-skip"
                    onClick={() => handleLogUpdate(log, 'skipped')}
                  >
                    छोड़ें (Skip)
                  </button>
                  <button 
                    className="btn-log btn-take"
                    onClick={() => handleLogUpdate(log, 'taken')}
                  >
                    लें (Take)
                  </button>
                </>
              ) : (
                <div className={`log-status-badge ${log.status}`}>
                  {log.status === 'taken' ? '✅ ले ली' : '❌ छोड़ी'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- Add New Medicine Section --- */}
      <div className="card">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'फॉर्म बंद करें' : '+ नई दवा जोड़ें'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="card-title">नई दवा जोड़ें</h3>
          <form onSubmit={handleAddMedicine} className="form-container">
            {formError && <p className="error-message">{formError}</p>}
            <div className="form-group">
              <label className="form-label">दवा का नाम</label>
              <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="जैसे: पैरासिटामोल" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">खुराक (Dosage)</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="जैसे: 1 गोली, 5ml" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">लेने का समय</label>
              {times.map((item, index) => (
                <div key={index} className="time-slot">
                  <input type="time" value={item.time} onChange={(e) => handleTimeChange(index, e.target.value)} className="form-input time-input" required />
                  {index > 0 && (
                    <button type="button" onClick={() => removeTimeSlot(index)} className="btn-remove-time">X</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTimeSlot} className="btn-add-time">+ और समय जोड़ें</button>
            </div>
            <button type="submit" className="btn btn-secondary">दवा सेव करें</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Medicines;