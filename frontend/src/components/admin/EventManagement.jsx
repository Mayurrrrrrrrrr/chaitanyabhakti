// frontend/src/components/admin/EventManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminForms.css'; // We'll create this new CSS file

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('festival');
  const [startDate, setStartDate] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // This is the new route we created
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
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
    try {
      // This is the new admin route
      await api.post('/events', {
        title,
        event_type: eventType,
        start_date: startDate
      });
      // Reset form and refresh list
      setTitle('');
      setEventType('festival');
      setStartDate('');
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add event.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event.');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Manage Global Events</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Add New Event</h3>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="festival">Festival</option>
          <option value="ekadashi">Ekadashi</option>
          <option value="purnima">Purnima</option>
          <option value="satsang">Satsang</option>
          <option value="other">Other</option>
        </select>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <button type="submit">Add Event</button>
      </form>

      <div className="admin-list">
        <h3>Existing Events</h3>
        {loading ? <p>Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventManagement;