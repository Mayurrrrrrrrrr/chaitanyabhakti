//
// FILE: backend/routes/community.js
//
const express = require('express');
const router = express.Router();

module.exports = (db, upload) => { //
  // Create a new post
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { family_id, content, content_en, post_type, video_url } = req.body;
      const user_id = req.user.id; // Use req.user.id
      let image_url = null;

      if (req.file) {
        image_url = `/uploads/images/${req.file.filename}`;
      }

      if (!content && !image_url && !video_url) {
        return res.status(400).json({ error: 'Post must have content, image, or video.' });
      }

      const [result] = await db.query(
        'INSERT INTO community_posts (family_id, user_id, content, content_en, image_url, video_url, post_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [family_id || null, user_id, content, content_en || null, image_url, video_url || null, post_type || 'text']
      );

      res.status(201).json({ message: 'Post created', post_id: result.insertId });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // Get posts for a family
  router.get('/:family_id', async (req, res) => {
    try {
      const { family_id } = req.params;
      const [posts] = await db.query(
        `SELECT p.*, u.name, u.spiritual_name, u.profile_photo 
         FROM community_posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.family_id = ?
         ORDER BY p.created_at DESC
         LIMIT 50`, // Add pagination later
        [family_id]
      );
      res.json(posts);
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // Delete a post
  router.delete('/:post_id', async (req, res) => {
    try {
      const { post_id } = req.params;
      const user_id = req.user.id; // Use req.user.id

      // Optional: Check if user is admin or owner of the post
      const [post] = await db.query('SELECT user_id, family_id FROM community_posts WHERE post_id = ?', [post_id]);
      if (post.length === 0) return res.status(404).json({ error: 'Post not found' });

      // Check if user is family admin
      const [membership] = await db.query('SELECT is_admin FROM family_members WHERE family_id = ? AND user_id = ?', [post[0].family_id, user_id]);
      const is_family_admin = membership.length > 0 && membership[0].is_admin;

      if (post[0].user_id !== user_id && !is_family_admin) {
        return res.status(403).json({ error: 'You are not authorized to delete this post' });
      }

      await db.query('DELETE FROM community_posts WHERE post_id = ?', [post_id]);
      res.json({ message: 'Post deleted' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  return router;
};