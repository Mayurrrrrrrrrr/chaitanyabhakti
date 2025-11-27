//
// FILE: backend/routes/media.js
//
const express = require('express');
const router = express.Router();

//
// Converted to module.exports = (db, upload) => { ... }
module.exports = (db, upload) => {

  // POST /api/media/audio (Upload audio)
  router.post('/audio', upload.single('audio_file'), async (req, res) => {
    try {
      const { family_id, title, title_en, category, is_public } = req.body;
      const user_id = req.user.id; // Use req.user.id

      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required.' });
      }

      const file_url = `/uploads/audio/${req.file.filename}`;
      // Note: duration and file_size would ideally be extracted using a library like 'music-metadata'

      const [result] = await db.query(
        'INSERT INTO audio_files (user_id, family_id, title, title_en, file_url, category, is_public, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, family_id || null, title, title_en || null, file_url, category || 'other', is_public || 0, req.file.size]
      );

      res.status(201).json({ message: 'Audio uploaded', audio_id: result.insertId, file_url });
    } catch (error) {
      console.error('Upload audio error:', error);
      res.status(500).json({ error: 'Failed to upload audio' });
    }
  });

  // POST /api/media/video (Add video link)
  router.post('/video', async (req, res) => {
    try {
      const { family_id, title, title_en, video_url, category, is_public, description } = req.body;
      const user_id = req.user.id;

      if (!video_url) {
        return res.status(400).json({ error: 'Video URL is required.' });
      }

      // Basic YouTube ID extraction
      let youtube_id = null;
      try {
        const url = new URL(video_url);
        if (url.hostname === 'youtu.be') {
          youtube_id = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
          youtube_id = url.searchParams.get('v');
        }
      } catch (e) { /* ignore invalid URL, save it anyway */ }

      const thumbnail_url = youtube_id ? `https://img.youtube.com/vi/${youtube_id}/0.jpg` : null;

      const [result] = await db.query(
        'INSERT INTO video_links (added_by, family_id, title, title_en, video_url, youtube_id, category, is_public, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, family_id || null, title, title_en || null, video_url, youtube_id, category || 'other', is_public || 1, description || null]
      );

      res.status(201).json({ message: 'Video link added', video_id: result.insertId });
    } catch (error) {
      console.error('Add video link error:', error);
      res.status(500).json({ error: 'Failed to add video link' });
    }
  });

  // GET /api/media/audio
  router.get('/audio', async (req, res) => {
    try {
      const family_id = req.query.family_id;
      let query = 'SELECT * FROM audio_files WHERE is_public = 1';
      let params = [];

      if (family_id) {
        query += ' OR family_id = ?';
        params.push(family_id);
      }
      query += ' ORDER BY uploaded_at DESC';

      const [audios] = await db.query(query, params);
      res.json(audios);
    } catch (error) {
      console.error('Get audios error:', error);
      res.status(500).json({ error: 'Failed to fetch audios' });
    }
  });

  // GET /api/media/videos
  router.get('/videos', async (req, res) => {
    try {
      const family_id = req.query.family_id;
      let query = 'SELECT * FROM video_links WHERE is_public = 1';
      let params = [];

      if (family_id) {
        query += ' OR family_id = ?';
        params.push(family_id);
      }
      query += ' ORDER BY added_at DESC';

      const [videos] = await db.query(query, params);
      res.json(videos);
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  return router;
};