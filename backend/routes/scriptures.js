// =====================================================
// SCRIPTURE & READING LIST ROUTES
// File: routes/scriptures.js
// =====================================================

const express = require('express');
const router = express.Router();

// Get public scriptures
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const lang = req.query.lang || 'hi';

        let query = `
            SELECT 
                scripture_id, 
                ${lang === 'en' ? 'title_en' : 'title'} as title,
                author, category, 
                ${lang === 'en' ? 'description_en' : 'description'} as description,
                content_url, audio_url, thumbnail_url, language
            FROM scriptures 
            WHERE is_public = TRUE
        `;
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY title';

        const [scriptures] = await req.db.query(query, params);
        res.json({ success: true, scriptures });

    } catch (error) {
        console.error('Get scriptures error:', error);
        res.status(500).json({ error: 'Failed to fetch scriptures' });
    }
});

// Get user's reading list
router.get('/my-list', async (req, res) => {
    try {
        const { user_id } = req.user;
        const lang = req.query.lang || 'hi';

        const [list] = await req.db.query(`
            SELECT 
                rl.*, 
                ${lang === 'en' ? 's.title_en' : 's.title'} as title,
                s.author, s.category, s.thumbnail_url, s.audio_url
            FROM reading_list rl
            JOIN scriptures s ON rl.scripture_id = s.scripture_id
            WHERE rl.user_id = ?
            ORDER BY rl.added_at DESC
        `, [user_id]);

        res.json({ success: true, reading_list: list });

    } catch (error) {
        console.error('Get reading list error:', error);
        res.status(500).json({ error: 'Failed to fetch reading list' });
    }
});

// Add to reading list
router.post('/my-list/add', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { scripture_id } = req.body;

        const [result] = await req.db.query(
            'INSERT INTO reading_list (user_id, scripture_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = "to_read"',
            [user_id, scripture_id]
        );
        
        res.json({ success: true, message: 'Added to reading list', reading_id: result.insertId });

    } catch (error) {
        console.error('Add to list error:', error);
        res.status(500).json({ error: 'Failed to add to list' });
    }
});

// Update reading progress
router.put('/my-list/:reading_id/progress', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { reading_id } = req.params;
        const { status, progress_percentage, current_page } = req.body;

        const updates = [], values = [];
        if (status) { updates.push('status = ?'); values.push(status); }
        if (progress_percentage) { updates.push('progress_percentage = ?'); values.push(progress_percentage); }
        if (current_page) { updates.push('current_page = ?'); values.push(current_page); }
        
        if (status === 'reading' && !req.body.started_at) {
             updates.push('started_at = NOW()');
        }
        if (status === 'completed' && !req.body.completed_at) {
             updates.push('completed_at = NOW()');
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(reading_id, user_id);

        const [result] = await req.db.query(
            `UPDATE reading_list SET ${updates.join(', ')} WHERE reading_id = ? AND user_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found in your list' });
        }

        res.json({ success: true, message: 'Progress updated' });

    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Remove from reading list
router.delete('/my-list/:reading_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { reading_id } = req.params;

        await req.db.query(
            'DELETE FROM reading_list WHERE reading_id = ? AND user_id = ?',
            [reading_id, user_id]
        );

        res.json({ success: true, message: 'Removed from list' });

    } catch (error) {
        console.error('Remove from list error:', error);
        res.status(500).json({ error: 'Failed to remove from list' });
    }
});


module.exports = router;