//
// FILE: backend/routes/admin.js
//
const express = require('express');
const bcrypt = require('bcryptjs');
const isSuperAdmin = require('../middleware/isSuperAdmin');
const router = express.Router();

module.exports = (db, upload) => { 
  
  // Apply Super Admin middleware to all routes in this file
  router.use(isSuperAdmin(db));

  // ==========================================
  // USER MANAGEMENT ROUTES
  // ==========================================

  // GET /api/admin/users - Fetch all users
  router.get('/users', async (req, res) => {
    try {
      // Added is_active to the select list so the frontend knows the status
      const [rows] = await db.query('SELECT user_id, name, spiritual_name, mobile_number, is_super_admin, is_active FROM users ORDER BY user_id DESC');
      res.json(rows);
    } catch (err) {
      console.error('Admin users fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // POST /api/admin/users - Create a new user manually
  router.post('/users', async (req, res) => {
    const { name, mobile_number, password, spiritual_name } = req.body;

    if (!name || !mobile_number || !password) {
      return res.status(400).json({ error: 'Name, mobile number, and password are required.' });
    }

    try {
      // 1. Check if user already exists
      const [existing] = await db.query('SELECT user_id FROM users WHERE mobile_number = ?', [mobile_number]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'User with this mobile number already exists.' });
      }

      // 2. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Insert into users table
      const [result] = await db.query(
        'INSERT INTO users (name, mobile_number, password, spiritual_name, is_active, is_super_admin) VALUES (?, ?, ?, ?, 1, 0)',
        [name, mobile_number, hashedPassword, spiritual_name || null]
      );

      const newUserId = result.insertId;

      // 4. Initialize user preferences (Important for app stability)
      await db.query('INSERT INTO user_preferences (user_id) VALUES (?)', [newUserId]);

      res.status(201).json({ message: 'User created successfully', user_id: newUserId });

    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  });

  // PUT /api/admin/users/:id/deactivate - Deactivate a user
  router.put('/users/:id/deactivate', async (req, res) => {
    try {
      await db.query('UPDATE users SET is_active = 0 WHERE user_id = ?', [req.params.id]);
      res.json({ message: 'User deactivated successfully' });
    } catch (err) {
      console.error('Deactivate user error:', err);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  });

  // PUT /api/admin/users/:id/reactivate - Reactivate a user
  router.put('/users/:id/reactivate', async (req, res) => {
    try {
      await db.query('UPDATE users SET is_active = 1 WHERE user_id = ?', [req.params.id]);
      res.json({ message: 'User reactivated successfully' });
    } catch (err) {
      console.error('Reactivate user error:', err);
      res.status(500).json({ error: 'Failed to reactivate user' });
    }
  });

  // ==========================================
  // SCRIPTURE MANAGEMENT ROUTES
  // ==========================================

  // POST /api/admin/scriptures - Add new scripture
  router.post('/scriptures', 
    upload.fields([
      { name: 'cover_file', maxCount: 1 },
      { name: 'pdf_file', maxCount: 1 },
      { name: 'audio_file', maxCount: 1 }
    ]), 
    async (req, res) => {
    
    const { title, title_en, author, category, description, cover_url_link } = req.body;
    const adminUserId = req.user.id;
    
    // Handle file URLs
    let cover_url = cover_url_link || null;
    if (req.files['cover_file']) {
      cover_url = `/uploads/images/${req.files['cover_file'][0].filename}`;
    }
    
    let content_url = null; // PDF
    if (req.files['pdf_file']) {
      content_url = `/uploads/files/${req.files['pdf_file'][0].filename}`;
    }
    
    let audio_url = null;
    if (req.files['audio_file']) {
      audio_url = `/uploads/audio/${req.files['audio_file'][0].filename}`;
    }

    try {
      const [result] = await db.query(
        'INSERT INTO scriptures (title, title_en, author, category, description, content_url, cover_url, audio_url, added_by, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [title, title_en, author, category, description, content_url, cover_url, audio_url, adminUserId]
      );
      res.status(201).json({ message: 'Scripture added', scriptureId: result.insertId });
    } catch (err) {
      console.error("Add scripture error:", err.message);
      res.status(500).json({ error: 'Failed to add scripture' });
    }
  });

  // DELETE /api/admin/scriptures/:id
  router.delete('/scriptures/:id', async (req, res) => {
    try {
      // Optionally: You could select the file paths first and delete the files from disk here using fs.unlink
      await db.query('DELETE FROM scriptures WHERE scripture_id = ?', [req.params.id]);
      res.json({ message: 'Scripture deleted successfully' });
    } catch (err) {
      console.error('Delete scripture error:', err);
      res.status(500).json({ error: 'Failed to delete scripture' });
    }
  });

  return router;
};