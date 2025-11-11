//
// FILE: backend/routes/community.js
//
const express = require('express');
const router = express.Router();

module.exports = (db, upload) => {

  // GET all posts for a family (for FamilyDetail page)
  router.get('/family/:family_id', async (req, res) => {
    try {
      const { family_id } = req.params;
      const [posts] = await db.query(
        `SELECT p.*, u.name, u.spiritual_name, u.profile_photo 
         FROM community_posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.family_id = ?
         ORDER BY p.created_at DESC
         LIMIT 50`,
        [family_id]
      );
      res.json(posts);
    } catch (error) {
      console.error('Get family posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // GET all PUBLIC posts (for Satsang page)
  router.get('/satsang', async (req, res) => {
    try {
      // This query can be expanded to include public videos/audios from other tables
      // But for now, we'll use community_posts
      const [posts] = await db.query(
        `SELECT p.*, u.name, u.spiritual_name, u.profile_photo 
         FROM community_posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.family_id IS NULL -- Global posts
         ORDER BY p.created_at DESC
         LIMIT 50`
      );
      res.json(posts);
    } catch (error) {
      console.error('Get satsang posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });


  // POST a new post (handles text, image, video, pdf)
  router.post('/', upload.single('file'), async (req, res) => {
    try {
      const { family_id, content, post_type, video_url } = req.body;
      const user_id = req.user.id;
      let image_url = null;
      let file_url = null; // For PDFs

      if (req.file) {
        if (post_type === 'image') {
          image_url = `/uploads/images/${req.file.filename}`;
        } else if (post_type === 'pdf') {
          file_url = `/uploads/files/${req.file.filename}`; // Assumes a new 'files' upload dir
        }
      }

      const [result] = await db.query(
        'INSERT INTO community_posts (family_id, user_id, content, image_url, video_url, file_url, post_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [family_id || null, user_id, content || null, image_url, video_url || null, file_url, post_type]
      );

      res.status(201).json({ message: 'Post created', post_id: result.insertId });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // DELETE a post (admin or post owner)
  router.delete('/:post_id', async (req, res) => {
    try {
      const { post_id } = req.params;
      const user_id = req.user.id;

      const [post] = await db.query('SELECT user_id, family_id FROM community_posts WHERE post_id = ?', [post_id]);
      if (post.length === 0) return res.status(404).json({ error: 'Post not found' });

      // Check if user is family admin (if it's a family post)
      let is_family_admin = false;
      if (post[0].family_id) {
        const [membership] = await db.query('SELECT is_admin FROM family_members WHERE family_id = ? AND user_id = ?', [post[0].family_id, user_id]);
        is_family_admin = membership.length > 0 && membership[0].is_admin;
      }

      // Check if user is super admin
      const [admin] = await db.query('SELECT is_super_admin FROM users WHERE user_id = ?', [user_id]);
      const is_super_admin = admin[0].is_super_admin;
      
      // Allow delete if:
      // 1. User is the post owner
      // 2. User is a family admin (for family posts)
      // 3. User is a super admin
      if (post[0].user_id !== user_id && !is_family_admin && !is_super_admin) {
        return res.status(403).json({ error: 'You are not authorized to delete this post' });
      }

      // TODO: Delete the associated file from /uploads/
      await db.query('DELETE FROM community_posts WHERE post_id = ?', [post_id]);
      res.json({ message: 'Post deleted' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  return router;
};