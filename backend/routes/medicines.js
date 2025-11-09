// =====================================================
// MEDICINE TRACKER ROUTES
// File: routes/medicines.js
// =====================================================

const express = require('express');
const router = express.Router();

// Get all medicines for user
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.user;
        const [medicines] = await req.db.query(
            'SELECT * FROM medicines WHERE user_id = ? AND is_active = TRUE ORDER BY medicine_name',
            [user_id]
        );
        res.json({ success: true, medicines });
    } catch (error) {
        console.error('Get medicines error:', error);
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
});

// Add a new medicine
router.post('/add', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { 
            medicine_name, dosage, frequency, 
            times, // Expects a JSON array string: '["08:00", "20:00"]'
            start_date, end_date, notes, reminder_enabled 
        } = req.body;

        if (!medicine_name || !times || !start_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await req.db.query(`
            INSERT INTO medicines (
                user_id, medicine_name, dosage, frequency, 
                times, start_date, end_date, notes, reminder_enabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id, medicine_name, dosage || null, frequency || null,
            times, // Store as JSON string
            start_date, end_date || null, notes || null, 
            reminder_enabled === undefined ? true : !!reminder_enabled
        ]);
        
        // TODO: Logic to create reminders in the `reminders` table based on these times

        res.json({ success: true, message: 'Medicine added', medicine_id: result.insertId });

    } catch (error) {
        console.error('Add medicine error:', error);
        res.status(500).json({ error: 'Failed to add medicine' });
    }
});

// Get logs for today
router.get('/logs/today', async (req, res) => {
    try {
        const { user_id } = req.user;
        const today = new Date().toISOString().split('T')[0];

        const [logs] = await req.db.query(`
            SELECT 
                l.*, m.medicine_name, m.dosage
            FROM medicine_logs l
            JOIN medicines m ON l.medicine_id = m.medicine_id
            WHERE l.user_id = ? AND DATE(l.scheduled_time) = ?
            ORDER BY l.scheduled_time ASC
        `, [user_id, today]);
        
        // TODO: Add logic here to auto-generate today's logs if they don't exist
        // This is complex and should be done by a daily cron job or on first app open
        
        res.json({ success: true, logs });

    } catch (error) {
        console.error('Get medicine logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Log medicine as taken/skipped
router.post('/logs/:log_id/update', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { log_id } = req.params;
        const { status, notes } = req.body; // 'taken' or 'skipped'

        if (!['taken', 'skipped'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const [result] = await req.db.query(
            'UPDATE medicine_logs SET status = ?, taken_at = ?, notes = ? WHERE log_id = ? AND user_id = ?',
            [status, status === 'taken' ? new Date() : null, notes || null, log_id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Log entry not found or not yours' });
        }

        res.json({ success: true, message: 'Log updated' });

    } catch (error) {
        console.error('Update medicine log error:', error);
        res.status(500).json({ error: 'Failed to update log' });
    }
});

// Deactivate a medicine
router.put('/:medicine_id/deactivate', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { medicine_id } = req.params;

        await req.db.query(
            'UPDATE medicines SET is_active = FALSE, end_date = CURDATE() WHERE medicine_id = ? AND user_id = ?',
            [medicine_id, user_id]
        );
        
        // TODO: Disable associated reminders in the `reminders` table

        res.json({ success: true, message: 'Medicine deactivated' });
        
    } catch (error) {
        console.error('Deactivate medicine error:', error);
        res.status(500).json({ error: 'Failed to deactivate medicine' });
    }
});

module.exports = router;