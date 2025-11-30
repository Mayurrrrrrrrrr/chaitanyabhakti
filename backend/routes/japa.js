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
        'SELECT u.current_streak, u.longest_streak, up.daily_japa_goal FROM users u LEFT JOIN user_preferences up ON u.user_id = up.user_id WHERE u.user_id = ?',
        [user_id]
      );

      const stats = userStats[0] || {};

      res.json({
        today_count: today[0].today_count || 0,
        current_streak: stats.current_streak || 0,
        longest_streak: stats.longest_streak || 0,
        daily_goal: stats.daily_japa_goal || 16
      });

    } catch (error) {
      console.error('Get japa summary error:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: 'Failed to fetch japa summary', details: error.message });
    }
  });

  // POST update daily goal
  router.post('/goal', async (req, res) => {
    try {
      const { daily_goal } = req.body;
      const user_id = req.user.id;

      if (!daily_goal) return res.status(400).json({ error: 'Daily goal is required' });

      await db.query(
        'INSERT INTO user_preferences (user_id, daily_japa_goal) VALUES (?, ?) ON DUPLICATE KEY UPDATE daily_japa_goal = ?',
        [user_id, daily_goal, daily_goal]
      );

      res.json({ message: 'Daily goal updated', daily_goal });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({ error: 'Failed to update daily goal' });
    }
  });

  // GET history stats
  router.get('/history-stats', async (req, res) => {
    try {
      const user_id = req.user.id;

      // Yesterday
      const [yesterday] = await db.query(
        'SELECT COALESCE(SUM(mala_count), 0) as count FROM japa_records WHERE user_id = ? AND japa_date = CURDATE() - INTERVAL 1 DAY',
        [user_id]
      );

      // This Week
      const [week] = await db.query(
        'SELECT COALESCE(SUM(mala_count), 0) as count FROM japa_records WHERE user_id = ? AND YEARWEEK(japa_date, 1) = YEARWEEK(CURDATE(), 1)',
        [user_id]
      );

      // This Month
      const [month] = await db.query(
        'SELECT COALESCE(SUM(mala_count), 0) as count FROM japa_records WHERE user_id = ? AND MONTH(japa_date) = MONTH(CURDATE()) AND YEAR(japa_date) = YEAR(CURDATE())',
        [user_id]
      );

      // Total
      const [total] = await db.query(
        'SELECT COALESCE(SUM(mala_count), 0) as count FROM japa_records WHERE user_id = ?',
        [user_id]
      );

      res.json({
        yesterday: yesterday[0].count,
        this_week: week[0].count,
        this_month: month[0].count,
        total: total[0].count
      });
    } catch (error) {
      console.error('Get history stats error:', error);
      res.status(500).json({ error: 'Failed to fetch history stats' });
    }
  });

  // --- NEW: GLOBAL LEADERBOARD ---
  router.get('/leaderboard/global', async (req, res) => {
    try {
      const { period } = req.query;
      let dateFilter = '';

      if (period === 'today') {
        dateFilter = 'AND japa_date = CURDATE()';
      } else if (period === 'week') {
        dateFilter = 'AND YEARWEEK(japa_date, 1) = YEARWEEK(CURDATE(), 1)';
      } else if (period === 'month') {
        dateFilter = 'AND MONTH(japa_date) = MONTH(CURDATE()) AND YEAR(japa_date) = YEAR(CURDATE())';
      }

      // We need to join with users table to get names
      // Note: This query aggregates from japa_records directly instead of using the view for flexibility
      const query = `
        SELECT u.user_id, u.name, u.spiritual_name, u.profile_photo, u.current_streak, 
               COALESCE(SUM(jr.mala_count), 0) as total_malas
        FROM users u
        JOIN japa_records jr ON u.user_id = jr.user_id
        WHERE u.is_active = 1 ${dateFilter}
        GROUP BY u.user_id
        ORDER BY total_malas DESC
        LIMIT 50
      `;

      const [leaderboard] = await db.query(query);
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
      const { rounds, family_id, japa_date } = req.body;
      const user_id = req.user.id;
      const date = japa_date ? new Date(japa_date) : new Date();
      const dateString = date.toISOString().split('T')[0];

      if (rounds == null) return res.status(400).json({ error: 'rounds is required' });

      // 1. Insert/Update Japa Record
      await db.query(
        `INSERT INTO japa_records (user_id, family_id, mala_count, japa_date) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE mala_count = ?`,
        [user_id, family_id || null, rounds, dateString, rounds]
      );

      // 2. Calculate and Update Streaks (Logic in JS instead of complex SQL triggers)
      if (rounds > 0) {
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