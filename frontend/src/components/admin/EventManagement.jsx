// frontend/src/components/admin/EventManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminForms.css'; // Ensure this CSS file exists

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('festival');
  const [startDate, setStartDate] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Backend: router.get('/') mounted at /api/events
      const res = await api.get('/events');
      setEvents(res.data);
      setError('');
    } catch (err) {
      console.error("Error fetching events:", err);
      setError('Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // MySQL expects 'YYYY-MM-DD HH:MM:SS'
    // The datetime-local input gives 'YYYY-MM-DDThh:mm'
    const formattedDate = startDate.replace('T', ' ') + ':00';

    try {
      // Backend: router.post('/') mounted at /api/events
      await api.post('/events', {
        title,
        event_type: eventType,
        start_date: formattedDate
      });
      
      setSuccessMsg('Event created successfully!');
      // Reset form
      setTitle('');
      setEventType('festival');
      setStartDate('');
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.error || 'Failed to add event.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Backend: router.delete('/:event_id') mounted at /api/events
        await api.delete(`/events/${id}`);
        fetchEvents();
        setSuccessMsg('Event deleted successfully.');
      } catch (err) {
        console.error("Error deleting event:", err);
        setError(err.response?.data?.error || 'Failed to delete event.');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Manage Global Events</h2>
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Add New Event</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Type</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="festival">Festival</option>
            <option value="ekadashi">Ekadashi</option>
            <option value="purnima">Purnima</option>
            <option value="satsang">Satsang</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date & Time</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-submit">Add Event</button>
      </form>

      <div className="admin-list">
        <h3>Existing Events</h3>
        {loading ? <p>Loading...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="4">No events found.</td></tr>
              ) : (
                events.map(event => (
                  <tr key={event.event_id}>
                    <td>{event.title}</td>
                    <td>{event.event_type}</td>
                    <td>{new Date(event.start_date).toLocaleString()}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(event.event_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventManagement;