//
// FILE: backend/routes/admin.js
//
const express = require('express');
const bcrypt = require('bcryptjs');
const isSuperAdmin = require('../middleware/isSuperAdmin');
const router = express.Router();

// Wrap in module.exports = (db) => { ... }
module.exports = (db) => {
  
  // All routes in this file are protected by the isSuperAdmin middleware
  // We pass 'db' to the middleware so it can check the user's role
  router.use(isSuperAdmin(db));

  // POST /api/admin/users (ADD NEW USER)
  router.post('/users', async (req, res) => {
    const { mobile_number, name, password, spiritual_name } = req.body;
    const is_super_admin = req.body.is_super_admin || 0;

    if (!mobile_number || !name || !password) {
      return res.status(400).json({ message: 'Mobile, name, and password are required.' });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await db.query(
        'INSERT INTO users (mobile_number, name, password, spiritual_name, is_super_admin, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [mobile_number, name, hashedPassword, spiritual_name, is_super_admin]
      );
      
      // Also create user_preferences for them
      await db.query('INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id', [result.insertId]);

      res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'A user with this mobile number already exists.' });
      }
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // PUT /api/admin/users/:id/deactivate
  router.put('/users/:id/deactivate', async (req, res) => {
    try {
      await db.query(
        'UPDATE users SET is_active = 0 WHERE user_id = ?',
        [req.params.id]
      );
      res.json({ message: 'User deactivated.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // PUT /api/admin/users/:id/reactivate
  router.put('/users/:id/reactivate', async (req, res) => {
    try {
      await db.query(
        'UPDATE users SET is_active = 1 WHERE user_id = ?',
        [req.params.id]
      );
      res.json({ message: 'User reactivated.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // POST /api/admin/scriptures
  router.post('/scriptures', async (req, res) => {
    const { title, title_en, author, category, description, cover_url } = req.body;
    const adminUserId = req.user.id; // From the auth middleware

    try {
      const [result] = await db.query(
        'INSERT INTO scriptures (title, title_en, author, category, description, cover_url, added_by, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [title, title_en, author, category, description, cover_url, adminUserId]
      );
      res.status(201).json({ message: 'Scripture added', scriptureId: result.insertId });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // DELETE /api/admin/scriptures/:id
  router.delete('/scriptures/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM scriptures WHERE scripture_id = ?', [req.params.id]);
      res.json({ message: 'Scripture deleted.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // GET /api/admin/users
  router.get('/users', async (req, res) => {
    try {
      const [users] = await db.query(
        'SELECT user_id, mobile_number, name, profile_photo, spiritual_name, date_of_birth, is_super_admin, created_at, last_login, total_japa_count, current_streak, longest_streak, is_active FROM users'
      );
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Return the router
  return router;
};