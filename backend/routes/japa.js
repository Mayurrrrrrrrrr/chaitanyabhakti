//
// FILE: backend/routes/japa.js
//
const express = require('express');
const router = express.Router();

//
// Converted to module.exports = (db) => { ... }
module.exports = (db) => {

  // GET japa records for the user
  router.get('/', async (req, res) => {
    try {
      const user_id = req.user.id; // Use req.user.id
      // Get records for the last 30 days
      const [records] = await db.query(
        'SELECT * FROM japa_records WHERE user_id = ? AND japa_date >= CURDATE() - INTERVAL 30 DAY ORDER BY japa_date DESC',
        [user_id]
      );
      res.json(records);
    } catch (error) {
      console.error('Get japa records error:', error);
      res.status(500).json({ error: 'Failed to fetch japa records' });
    }
  });
  
  // GET japa summary (stats for dashboard)
  router.get('/summary', async (req, res) => {
    try {
      const user_id = req.user.id; // Use req.user.id
      
      // Get today's count
      const [today] = await db.query(
        'SELECT COALESCE(SUM(mala_count), 0) as today_count FROM japa_records WHERE user_id = ? AND japa_date = CURDATE()',
        [user_id]
      );

      // Get user stats (total, streaks)
      const [userStats] = await db.query(
        'SELECT total_japa_count, current_streak, longest_streak FROM users WHERE user_id = ?',
        [user_id]
      );
      
      res.json({
        today_count: today[0].today_count,
        total_japa_count: userStats[0].total_japa_count,
        current_streak: userStats[0].current_streak,
        longest_streak: userStats[0].longest_streak
      });
      
    } catch (error) {
      console.error('Get japa summary error:', error);
      res.status(500).json({ error: 'Failed to fetch japa summary' });
    }
  });


  // POST (add/update) japa for today
  router.post('/', async (req, res) => {
    try {
      const { mala_count, family_id, japa_date } = req.body;
      const user_id = req.user.id; // Use req.user.id
      const date = japa_date ? new Date(japa_date) : new Date(); // Use provided date or today
      const dateString = date.toISOString().split('T')[0];

      if (mala_count == null) return res.status(400).json({ error: 'mala_count is required' });

      // This query will insert a new record or update the existing one for the user/family/date
      await db.query(
        `INSERT INTO japa_records (user_id, family_id, mala_count, japa_date) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE mala_count = ?`,
        [user_id, family_id || null, mala_count, dateString, mala_count]
      );
      
      // Note: Triggers in your SQL should handle updating the 'users' table automatically.
      // If triggers aren't active, you'd need to add logic here to update streaks.
      
      res.status(201).json({ message: 'Japa count saved successfully' });
    } catch (error) {
      console.error('Post japa record error:', error);
      res.status(500).json({ error: 'Failed to save japa count' });
    }
  });

  return router;
};