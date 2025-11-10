//
// FILE: backend/routes/medicines.js
//
const express = require('express');
const router = express.Router();

//
// Converted to module.exports = (db) => { ... }
module.exports = (db) => {

  // GET user's active medicines
  router.get('/', async (req, res) => {
    try {
      const user_id = req.user.id; // Use req.user.id
      const [medicines] = await db.query(
        'SELECT * FROM medicines WHERE user_id = ? AND is_active = 1',
        [user_id]
      );
      res.json(medicines);
    } catch (error) {
      console.error('Get medicines error:', error);
      res.status(500).json({ error: 'Failed to fetch medicines' });
    }
  });

  // POST a new medicine
  router.post('/', async (req, res) => {
    try {
      const { medicine_name, dosage, frequency, times, start_date, end_date, notes, reminder_enabled } = req.body;
      const user_id = req.user.id; // Use req.user.id

      if (!medicine_name || !times || !start_date) {
        return res.status(400).json({ error: 'Medicine name, times, and start date are required' });
      }

      const [result] = await db.query(
        'INSERT INTO medicines (user_id, medicine_name, dosage, frequency, times, start_date, end_date, notes, reminder_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, medicine_name, dosage, frequency, JSON.stringify(times), start_date, end_date || null, notes, reminder_enabled ?? 1]
      );
      
      res.status(201).json({ message: 'Medicine added', medicine_id: result.insertId });
    } catch (error) {
      console.error('Add medicine error:', error);
      res.status(500).json({ error: 'Failed to add medicine' });
    }
  });

  // PUT (update) a medicine
  router.put('/:medicine_id', async (req, res) => {
    try {
      const { medicine_id } = req.params;
      const { medicine_name, dosage, frequency, times, start_date, end_date, notes, reminder_enabled, is_active } = req.body;
      const user_id = req.user.id; // Use req.user.id

      // Build update query dynamically
      const updates = [];
      const values = [];
      if (medicine_name) { updates.push('medicine_name = ?'); values.push(medicine_name); }
      if (dosage) { updates.push('dosage = ?'); values.push(dosage); }
      if (frequency) { updates.push('frequency = ?'); values.push(frequency); }
      if (times) { updates.push('times = ?'); values.push(JSON.stringify(times)); }
      if (start_date) { updates.push('start_date = ?'); values.push(start_date); }
      if (end_date) { updates.push('end_date = ?'); values.push(end_date); }
      if (notes) { updates.push('notes = ?'); values.push(notes); }
      if (reminder_enabled !== undefined) { updates.push('reminder_enabled = ?'); values.push(reminder_enabled); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(medicine_id);
      values.push(user_id);

      await db.query(
        `UPDATE medicines SET ${updates.join(', ')} WHERE medicine_id = ? AND user_id = ?`,
        values
      );
      
      res.json({ message: 'Medicine updated' });
    } catch (error) {
      console.error('Update medicine error:', error);
      res.status(500).json({ error: 'Failed to update medicine' });
    }
  });

  // DELETE (deactivate) a medicine
  router.delete('/:medicine_id', async (req, res) => {
    try {
      const { medicine_id } = req.params;
      const user_id = req.user.id; // Use req.user.id
      
      // We'll just deactivate it instead of deleting
      await db.query(
        'UPDATE medicines SET is_active = 0 WHERE medicine_id = ? AND user_id = ?',
        [medicine_id, user_id]
      );
      
      res.json({ message: 'Medicine deactivated' });
    } catch (error) {
      console.error('Deactivate medicine error:', error);
      res.status(500).json({ error: 'Failed to deactivate medicine' });
    }
  });

  // POST /logs (Log medicine intake)
  router.post('/logs', async (req, res) => {
    try {
      const { medicine_id, status, scheduled_time, notes } = req.body;
      const user_id = req.user.id; // Use req.user.id
      const taken_at = (status === 'taken') ? new Date() : null;

      const [result] = await db.query(
        'INSERT INTO medicine_logs (medicine_id, user_id, scheduled_time, taken_at, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [medicine_id, user_id, scheduled_time, taken_at, status, notes || null]
      );
      
      res.status(201).json({ message: 'Medicine log created', log_id: result.insertId });
    } catch (error) {
      console.error('Log medicine error:', error);
      res.status(500).json({ error: 'Failed to log medicine intake' });
    }
  });

  // GET /logs (Get logs for a specific day)
  router.get('/logs', async (req, res) => {
    try {
      const user_id = req.user.id; // Use req.user.id
      const date = req.query.date ? new Date(req.query.date) : new Date();
      const dateString = date.toISOString().split('T')[0];

      const [logs] = await db.query(
        'SELECT l.*, m.medicine_name FROM medicine_logs l JOIN medicines m ON l.medicine_id = m.medicine_id WHERE l.user_id = ? AND DATE(l.scheduled_time) = ? ORDER BY l.scheduled_time',
        [user_id, dateString]
      );
      res.json(logs);
    } catch (error) {
      console.error('Get medicine logs error:', error);
      res.status(500).json({ error: 'Failed to fetch medicine logs' });
    }
  });
  
  return router;
};