// =====================================================
// SCRIPTURE & LEARNING ROUTES
// File: routes/scriptures.js (CORRECTED)
// =====================================================

const express = require('express');
const router = express.Router();

// Get all scriptures
router.get('/', async (req, res) => {
    try {
        // This query is now 100% correct for your database schema
        const [scriptures] = await req.db.query(`
            SELECT 
                scripture_id,
                title,
                description,
                author,
                category, 
                content_url,
                cover_url 
            FROM scriptures
            ORDER BY scripture_id ASC
        `);

        res.json({ success: true, scriptures });

    } catch (error) {
        console.error('Get scriptures error:', error);
        res.status(500).json({ error: 'Failed to fetch scriptures' });
    }
});

// Get single scripture details (for future use)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [scriptures] = await req.db.query(
            'SELECT * FROM scriptures WHERE scripture_id = ?',
            [id]
        );

        if (scriptures.length === 0) {
            return res.status(404).json({ error: 'Scripture not found' });
        }

        res.json({ success: true, scripture: scriptures[0] });

    } catch (error) {
        console.error('Get scripture detail error:', error);
        res.status(500).json({ error: 'Failed to fetch scripture' });
    }
});

module.exports = router;