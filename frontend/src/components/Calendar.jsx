import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { fetchVaishnavaEvents } from '../utils/vaishnavaData';
import './Calendar.css';

// --- Inline Icon for Serene Lotus/Om ---
const IconOm = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 4C14 4 15.5 5 15.5 7C15.5 9 14 10 12 10C10 10 8.5 9 8.5 7C8.5 5 10 4 12 4Z" />
    <path d="M12 10V14" />
    <path d="M12 14C9 14 7 16 7 19" />
    <path d="M12 14C15 14 17 16 17 19" />
    <circle cx="12" cy="2" r="1.5" fill="currentColor" />
  </svg>
);

// --- Other Icons ---
const IconCalendar = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconEdit2 = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const IconPlus = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconRefreshCw = ({ className }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (date.getHours() === 0 && date.getMinutes() === 0) return null;
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null); // The event being edited

  // Fetch and Merge Logic
  const loadCalendar = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Local DB Events (Customized)
      const localRes = await api.get('/events').catch(() => ({ data: [] }));
      const localEvents = localRes.data || [];

      // 2. Fetch Default Vaishnava Events (Static/Internet)
      const defaultEvents = await fetchVaishnavaEvents();

      // 3. Merge: Local events override defaults if names match (simple logic for now)
      // Or simply combine them. Here we combine, but mark local ones as 'custom'
      const localMap = new Map(localEvents.map(e => [e.title.toLowerCase(), e]));
      
      const mergedEvents = [...localEvents];
      
      defaultEvents.forEach(defEvent => {
        if (!localMap.has(defEvent.title.toLowerCase())) {
            mergedEvents.push(defEvent);
        }
      });

      // Sort by date
      const sorted = mergedEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      setEvents(sorted);
    } catch (err) {
      console.error('Calendar Error:', err);
      setError('Could not synchronize calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  // Grouping Logic
  const groupEventsByMonth = (eventsList) => {
    return eventsList.reduce((acc, event) => {
      const date = new Date(event.start_date);
      if (isNaN(date)) return acc; // Skip invalid dates
      const month = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {});
  };

  const handleEditClick = (event) => {
    setEditData({
      ...event,
      start_date: event.start_date.substring(0, 16) // Format for datetime-local input
    });
    setIsEditing(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
        // If it has an 'id' starting with 'v-', it's a default event we are "customizing" -> Create new
        // If it has a numeric 'event_id', it's a local event -> Update existing
        
        const payload = {
            title: editData.title,
            description: editData.description,
            event_type: editData.event_type,
            start_date: editData.start_date,
            end_date: editData.start_date, // Simplifying for single day events
            location: 'Local Temple', // Default
        };

        if (editData.event_id) {
            // Update existing
            await api.put(`/events/${editData.event_id}`, payload);
        } else {
            // Create new (Override default)
            await api.post('/events', payload);
        }
        
        setIsEditing(false);
        setEditData(null);
        loadCalendar(); // Refresh
    } catch (err) {
        alert('Failed to save event: ' + err.message);
    }
  };

  const eventGroups = groupEventsByMonth(events);

  return (
    <div className="page-container calendar-page">
      <div className="page-header calendar-header-row">
        <div>
            <h1 className="page-title">Vaishnava Calendar</h1>
            <p className="page-subtitle">Festivals & Ekadashis</p>
        </div>
        <button className="refresh-btn" onClick={loadCalendar} title="Sync Calendar">
            <IconRefreshCw className={loading ? 'spin' : ''} />
        </button>
      </div>

      {error && <div className="error-message card">{error}</div>}

      <div className="calendar-timeline">
        {Object.keys(eventGroups).map(month => (
          <div key={month} className="month-section fade-in">
            <h2 className="month-title sticky-month">{month}</h2>
            <div className="events-grid">
                {eventGroups[month].map((event, idx) => (
                <div key={idx} className={`card event-card type-${event.event_type}`}>
                    <div className="event-date-column">
                        <span className="day">{new Date(event.start_date).getDate()}</span>
                        <span className="weekday">{new Date(event.start_date).toLocaleString('en-US', {weekday: 'short'})}</span>
                    </div>
                    
                    <div className="event-details">
                        <div className="event-top-row">
                            <span className={`tag tag-${event.event_type}`}>
                                {event.event_type === 'ekadashi' ? 'Ekadashi' : 'Festival'}
                            </span>
                            {event.is_default && <span className="tag tag-default">Global</span>}
                        </div>
                        
                        <h3 className="event-title">{event.title}</h3>
                        
                        <div className="event-meta">
                             {formatTime(event.start_date) && (
                                <span className="meta-item"><IconClock /> {formatTime(event.start_date)}</span>
                             )}
                             {event.description && (
                                <p className="event-desc">{event.description}</p>
                             )}
                        </div>
                    </div>

                    <button className="edit-event-btn" onClick={() => handleEditClick(event)}>
                        <IconEdit2 />
                    </button>
                </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Customize Modal */}
      {isEditing && editData && (
          <div className="modal-overlay">
              <div className="card modal-card">
                  <h3>{editData.event_id ? 'Edit Event' : 'Customize Festival'}</h3>
                  <form onSubmit={handleSaveEvent}>
                      <div className="form-group">
                          <label>Title</label>
                          <input 
                             type="text" 
                             className="input-field" 
                             value={editData.title} 
                             onChange={e => setEditData({...editData, title: e.target.value})}
                             required
                          />
                      </div>
                      <div className="form-group">
                          <label>Date & Time</label>
                          <input 
                             type="datetime-local" 
                             className="input-field" 
                             value={editData.start_date} 
                             onChange={e => setEditData({...editData, start_date: e.target.value})}
                             required
                          />
                      </div>
                      <div className="form-group">
                          <label>Type</label>
                          <select 
                             className="input-field"
                             value={editData.event_type} 
                             onChange={e => setEditData({...editData, event_type: e.target.value})}
                          >
                              <option value="festival">Festival</option>
                              <option value="ekadashi">Ekadashi</option>
                              <option value="appearance">Appearance Day</option>
                          </select>
                      </div>
                      <div className="form-group">
                          <label>Description / Fasting Rules</label>
                          <textarea 
                             className="input-field" 
                             rows="3"
                             value={editData.description} 
                             onChange={e => setEditData({...editData, description: e.target.value})}
                          ></textarea>
                      </div>
                      <div className="modal-actions">
                          <button type="button" className="btn-text" onClick={() => setIsEditing(false)}>Cancel</button>
                          <button type="submit" className="btn-primary">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {/* Floating Add Button */}
      <button 
        className="floating-add-btn" 
        onClick={() => {
            setEditData({ title: '', start_date: '', event_type: 'festival', description: '' });
            setIsEditing(true);
        }}
      >
        <IconPlus />
      </button>
    </div>
  );
};

export default Calendar;