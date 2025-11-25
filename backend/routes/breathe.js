const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // POST /api/breathe (Save a session)
    router.post('/', async (req, res) => {
        try {
            const { technique_id, technique_name, duration_seconds } = req.body;
            const user_id = req.user.id; // From authenticateToken middleware

            if (!technique_id || !duration_seconds) {
                return res.status(400).json({ error: 'Technique ID and duration are required' });
            }

            await db.query(
                'INSERT INTO breath_records (user_id, technique_id, technique_name, duration_seconds) VALUES (?, ?, ?, ?)',
                [user_id, technique_id, technique_name, duration_seconds]
            );

            res.status(201).json({ message: 'Session saved successfully' });
        } catch (error) {
            console.error('Save breath session error:', error);
            res.status(500).json({ error: 'Failed to save session' });
        }
    });

    // GET /api/breathe/history (Get user's history)
    router.get('/history', async (req, res) => {
        try {
            const user_id = req.user.id;
            const [history] = await db.query(
                'SELECT * FROM breath_records WHERE user_id = ? ORDER BY completed_at DESC LIMIT 50',
                [user_id]
            );
            res.json(history);
        } catch (error) {
            console.error('Get breath history error:', error);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    });

    return router;
};
