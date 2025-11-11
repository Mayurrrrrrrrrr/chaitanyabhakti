//
// FILE: backend/routes/admin.js
//
const express = require('express');
const bcrypt = require('bcryptjs');
const isSuperAdmin = require('../middleware/isSuperAdmin');
const router = express.Router();

// 🛑 FIX: Change export to accept 'upload'
module.exports = (db, upload) => { 
  
  router.use(isSuperAdmin(db));

  // ... (all other routes: POST /users, PUT /deactivate, etc.) ...

  /*
  -- 🛑 REPLACED: UPDATE CONTENT (Add a new scripture with files)
  -- POST /api/admin/scriptures
  */
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
      res.status(500).send('Server error');
    }
  });

  // ... (DELETE /admin/scriptures/:id route) ...
  // ... (GET /admin/users route) ...

  return router;
};