//
// FILE: frontend/src/components/Calendar.jsx
//
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Calendar.css';
import { FiCalendar } from 'react-icons/fi';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  const date = new Date(dateString);
  
  if (date.getHours() === 0 && date.getMinutes() === 0) {
     // If time is midnight, it's likely an all-day event
     return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  return date.toLocaleDateString('en-IN', options);
};

// Helper to group events by month
const groupEventsByMonth = (events) => {
  return events.reduce((acc, event) => {
    const month = new Date(event.start_date).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(event);
    return acc;
  }, {});
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/events');
        // Sort events by start date, newest first
        const sortedEvents = res.data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setEvents(sortedEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Could not load calendar events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventGroups = groupEventsByMonth(events);

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <FiCalendar size={28} />
        <h1>Vaishnav Calendar</h1>
        <p>Upcoming festivals, Ekadashis, and events.</p>
      </header>

      {loading && <div>Loading events...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="event-list">
        {Object.keys(eventGroups).map(month => (
          <section key={month} className="event-month-group">
            <h2>{month}</h2>
            {eventGroups[month].map(event => (
              <div key={event.event_id} className={`event-card type-${event.event_type}`}>
                <div className="event-card-content">
                  <span className="event-type">{event.event_type}</span>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-date">{formatDate(event.start_date)}</p>
                  {event.description && <p className="event-desc">{event.description}</p>}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Calendar;