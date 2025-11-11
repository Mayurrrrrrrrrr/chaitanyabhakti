//
// FILE: backend/routes/events.js
//
const express = require('express');
const router = express.Router();
const isSuperAdmin = require('../middleware/isSuperAdmin');

module.exports = (db) => {

  // GET all global events
  router.get('/', async (req, res) => {
    try {
      const [events] = await db.query(
        'SELECT * FROM global_events ORDER BY start_date DESC'
      );
      res.json(events);
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // POST a new event (admin only)
  router.post('/', isSuperAdmin(db), async (req, res) => {
    try {
      const { title, event_type, start_date, end_date } = req.body;
      const user_id = req.user.id;

      if (!title || !event_type || !start_date) {
        return res.status(400).json({ error: 'Title, type, and start date are required' });
      }

      const [result] = await db.query(
        'INSERT INTO global_events (title, event_type, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?)',
        [title, event_type, start_date, end_date || null, user_id]
      );
      
      res.status(201).json({ message: 'Event created', event_id: result.insertId });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // DELETE an event (admin only)
  router.delete('/:event_id', isSuperAdmin(db), async (req, res) => {
    try {
      const { event_id } = req.params;
      await db.query('DELETE FROM global_events WHERE event_id = ?', [event_id]);
      res.json({ message: 'Event deleted' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  return router;
};