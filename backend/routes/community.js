// =====================================================
// COMMUNITY FEED ROUTES
// File: routes/community.js
// =====================================================

const express = require('express');
const router = express.Router();

// Get community posts (global or family)
router.get('/', async (req, res) => {
    try {
        const { family_id, limit = 20, offset = 0 } = req.query;
        const lang = req.query.lang || 'hi';
        
        let query = `
            SELECT 
                p.post_id,
                ${lang === 'en' ? 'p.content_en' : 'p.content'} as content,
                p.image_url, p.video_url, p.post_type,
                p.likes_count, p.comments_count, p.created_at,
                u.user_id, u.name, u.spiritual_name, u.profile_photo,
                f.family_id, f.family_name
            FROM community_posts p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN families f ON p.family_id = f.family_id
        `;
        const params = [];

        if (family_id) {
            query += ' WHERE p.family_id = ?';
            params.push(family_id);
        } else {
            // Global feed - only show non-family posts
            query += ' WHERE p.family_id IS NULL';
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [posts] = await req.db.query(query, params);
        res.json({ success: true, posts });

    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
router.post('/create', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id, content, content_en, post_type = 'text' } = req.body;
        
        // Use `req.upload` which was injected by server.js
        // This endpoint needs to handle file uploads
        // For simplicity, we assume image_url/video_url are passed in body
        // A better way is to use `req.upload.single('post_image')`
        const { image_url, video_url } = req.body; // Simplified

        if (!content) {
            return res.status(400).json({ error: 'Post content is required' });
        }
        
        // If posting to a family, check if member
        if (family_id) {
             const [membership] = await req.db.query(
                'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
                [family_id, user_id]
            );
            if (membership.length === 0) {
                return res.status(403).json({ error: 'Not a member of this family' });
            }
        }

        const [result] = await req.db.query(`
            INSERT INTO community_posts (
                family_id, user_id, content, content_en, 
                image_url, video_url, post_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            family_id || null, user_id, content, content_en || null,
            image_url || null, video_url || null, post_type
        ]);

        res.json({ success: true, message: 'Post created', post_id: result.insertId });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Delete a post
router.delete('/:post_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { post_id } = req.params;

        // Check if user is OP or super admin
        const [posts] = await req.db.query(
            'SELECT * FROM community_posts WHERE post_id = ?', [post_id]
        );
        if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

        const [user] = await req.db.query('SELECT is_super_admin FROM users WHERE user_id = ?', [user_id]);

        if (posts[0].user_id !== user_id && !user[0].is_super_admin) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }
        
        await req.db.query('DELETE FROM community_posts WHERE post_id = ?', [post_id]);
        res.json({ success: true, message: 'Post deleted' });

    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// TODO: Add routes for likes and comments

module.exports = router;