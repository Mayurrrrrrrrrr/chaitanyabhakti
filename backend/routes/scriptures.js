//
// FILE: backend/routes/scriptures.js
//
const express = require('express');
const router = express.Router();

//
// Converted to module.exports = (db) => { ... }
module.exports = (db) => {

  // GET all public scriptures
  router.get('/', async (req, res) => {
    try {
      const [scriptures] = await db.query(
        'SELECT * FROM scriptures WHERE is_public = 1'
      );
      res.json(scriptures);
    } catch (error) {
      console.error('Get scriptures error:', error);
      res.status(500).json({ error: 'Failed to fetch scriptures' });
    }
  });

  // GET user's reading list
  router.get('/my-list', async (req, res) => {
    try {
      const user_id = req.user.id; // Use req.user.id
      const [list] = await db.query(
        'SELECT s.*, rl.status, rl.progress_percentage FROM scriptures s JOIN reading_list rl ON s.scripture_id = rl.scripture_id WHERE rl.user_id = ?',
        [user_id]
      );
      res.json(list);
    } catch (error) {
      console.error('Get reading list error:', error);
      res.status(500).json({ error: 'Failed to fetch reading list' });
    }
  });

  // POST (add/update) to reading list
  router.post('/my-list', async (req, res) => {
    try {
      const { scripture_id, status, progress_percentage } = req.body;
      const user_id = req.user.id; // Use req.user.id

      if (!scripture_id || !status) {
        return res.status(400).json({ error: 'Scripture ID and status are required' });
      }

      await db.query(
        'INSERT INTO reading_list (user_id, scripture_id, status, progress_percentage) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), progress_percentage = VALUES(progress_percentage)',
        [user_id, scripture_id, status, progress_percentage || 0]
      );
      
      res.status(201).json({ message: 'Reading list updated' });
    } catch (error) {
      console.error('Update reading list error:', error);
      res.status(500).json({ error: 'Failed to update reading list' });
    }
  });

  return router;
};