const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // GET japa records for the user
  router.get('/', async (req, res) => {
    try {
      const user_id = req.user.id;
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
      const user_id = req.user.id;

      const [today] = await db.query(
        'SELECT COALESCE(SUM(mala_count), 0) as today_count FROM japa_records WHERE user_id = ? AND japa_date = CURDATE()',
        [user_id]
      );

      const [userStats] = await db.query(
        'SELECT total_japa_count, current_streak, longest_streak FROM users WHERE user_id = ?',
        [user_id]
      );

      const stats = userStats[0] || {};

      res.json({
        today_count: today[0].today_count || 0,
        total_japa_count: stats.total_japa_count || 0,
        current_streak: stats.current_streak || 0,
        longest_streak: stats.longest_streak || 0
      });

    } catch (error) {
      console.error('Get japa summary error:', error);
      res.status(500).json({ error: 'Failed to fetch japa summary' });
    }
  });

  // --- NEW: GLOBAL LEADERBOARD ---
  router.get('/leaderboard/global', async (req, res) => {
    try {
      // Fetch from the view 'global_leaderboard'
      const [leaderboard] = await db.query(
        'SELECT * FROM global_leaderboard ORDER BY total_japa_count DESC LIMIT 50'
      );
      res.json({ leaderboard });
    } catch (error) {
      console.error('Get global leaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // --- NEW: FAMILY LEADERBOARD ---
  router.get('/leaderboard/family/:family_id', async (req, res) => {
    try {
      const { family_id } = req.params;
      // Fetch from the view 'family_leaderboard'
      const [leaderboard] = await db.query(
        'SELECT * FROM family_leaderboard WHERE family_id = ? ORDER BY total_malas DESC',
        [family_id]
      );
      res.json({ leaderboard });
    } catch (error) {
      console.error('Get family leaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch family leaderboard' });
    }
  });

  // POST (add/update) japa for today WITH STREAK LOGIC
  router.post('/', async (req, res) => {
    try {
      const { mala_count, family_id, japa_date } = req.body;
      const user_id = req.user.id;
      const date = japa_date ? new Date(japa_date) : new Date();
      const dateString = date.toISOString().split('T')[0];

      if (mala_count == null) return res.status(400).json({ error: 'mala_count is required' });

      // 1. Insert/Update Japa Record
      await db.query(
        `INSERT INTO japa_records (user_id, family_id, mala_count, japa_date) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE mala_count = ?`,
        [user_id, family_id || null, mala_count, dateString, mala_count]
      );

      // 2. Calculate and Update Streaks (Logic in JS instead of complex SQL triggers)
      if (mala_count > 0) {
        const [userStats] = await db.query(
          'SELECT current_streak, longest_streak FROM users WHERE user_id = ?',
          [user_id]
        );
        const user = userStats[0];

        // Check previous day's record
        const [lastJapa] = await db.query(
          'SELECT japa_date FROM japa_records WHERE user_id = ? AND japa_date < ? AND mala_count > 0 ORDER BY japa_date DESC LIMIT 1',
          [user_id, dateString]
        );

        let newStreak = user.current_streak;

        if (lastJapa.length > 0) {
          const lastJapaDate = new Date(lastJapa[0].japa_date);
          const currentJapaDate = new Date(dateString);

          // Calculate difference in days
          const diffTime = Math.abs(currentJapaDate - lastJapaDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day: Increment streak
            newStreak = user.current_streak + 1;
          } else if (diffDays > 1) {
            // Missed a day: Reset streak to 1
            newStreak = 1;
          }
          // If diffDays === 0, it's the same day update, streak doesn't change
        } else {
          // First time japa
          newStreak = 1;
        }

        // Ensure current streak isn't 0 if they just did japa
        if (newStreak === 0) newStreak = 1;

        let newLongestStreak = Math.max(user.longest_streak, newStreak);

        await db.query(
          'UPDATE users SET current_streak = ?, longest_streak = ? WHERE user_id = ?',
          [newStreak, newLongestStreak, user_id]
        );
      }

      res.status(201).json({ message: 'Japa count saved successfully' });
    } catch (error) {
      console.error('Post japa record error:', error);
      res.status(500).json({ error: 'Failed to save japa count' });
    }
  });

  return router;
};