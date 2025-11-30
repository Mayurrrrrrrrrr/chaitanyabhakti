import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Events.css';

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'info',
        start_date: new Date().toISOString().split('T')[0],
        location: ''
    });

    const isAdmin = user?.is_super_admin || user?.role === 'admin';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        try {
            await api.post('/events', formData);
            setFormData({
                title: '',
                description: '',
                event_type: 'info',
                start_date: new Date().toISOString().split('T')[0],
                location: ''
            });
            setShowForm(false);
            fetchEvents();
        } catch (err) {
            alert("Failed to create event");
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container events-page">
            <header className="page-header">
                <h1>Temple Updates & Events</h1>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Update'}
                    </button>
                )}
            </header>

            {showForm && (
                <div className="card event-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Location (Optional)</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={formData.event_type}
                                onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                            >
                                <option value="info">Info</option>
                                <option value="festival">Festival</option>
                                <option value="alert">Alert</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary">Post Update</button>
                    </form>
                </div>
            )}

            <div className="events-list">
                {events.map(event => (
                    <div key={event.event_id} className={`card event-card ${event.event_type}`}>
                        <div className="event-header">
                            <h3>{event.title}</h3>
                            <span className="event-date">{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                        <p className="event-content">{event.description}</p>
                        {event.location && <p className="event-location">📍 {event.location}</p>}
                        <span className={`tag tag-${event.event_type}`}>{event.event_type}</span>
                    </div>
                ))}
                {events.length === 0 && <p>No updates available.</p>}
            </div>
        </div>
    );
};

export default Events;
