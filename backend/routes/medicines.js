// =====================================================
// MEDICINE TRACKER ROUTES
// File: routes/medicines.js
// =====================================================

const express = require('express');
const router = express.Router();

// =====================================================
// HELPER: Generate Daily Logs
// =====================================================
/**
 * Checks for and creates pending medicine logs for a user for a given date.
 * This function is "idempotent" - it can be run many times but will only
 * create missing logs.
 */
async function generateDailyLogs(db, user_id, dateString) {
    try {
        // 1. Get all active medicines for the user that are within their date range
        const [activeMedicines] = await db.query(`
            SELECT * FROM medicines 
            WHERE user_id = ? 
              AND is_active = TRUE
              AND start_date <= ?
              AND (end_date IS NULL OR end_date >= ?)
        `, [user_id, dateString, dateString]);

        if (activeMedicines.length === 0) {
            return; // No active medicines, nothing to log.
        }

        // 2. Get all *existing* logs for this user for today
        const [existingLogs] = await db.query(`
            SELECT * FROM medicine_logs
            WHERE user_id = ? AND DATE(scheduled_time) = ?
        `, [user_id, dateString]);

        // 3. Loop through medicines and their scheduled times
        const newLogsToCreate = [];

        for (const med of activeMedicines) {
            const times = JSON.parse(med.times || '[]'); // e.g., ["08:00", "20:00"]
            
            for (const time of times) {
                // '2023-10-27T08:00:00'
                const scheduledTime = `${dateString}T${time}:00`; 

                // Check if a log for this specific medicine at this specific time *already exists*
                const logExists = existingLogs.some(log =>
                    log.medicine_id === med.medicine_id &&
                    new Date(log.scheduled_time).toISOString().startsWith(`${dateString}T${time}`)
                );

                if (!logExists) {
                    // Log doesn't exist, so prepare to create it.
                    newLogsToCreate.push([
                        user_id,
                        med.medicine_id,
                        scheduledTime,
                        'pending', // Default status
                        med.dosage
                    ]);
                }
            }
        }

        // 4. Batch-insert all new logs in a single query
        if (newLogsToCreate.length > 0) {
            await db.query(
                'INSERT INTO medicine_logs (user_id, medicine_id, scheduled_time, status, dosage_details) VALUES ?',
                [newLogsToCreate]
            );
            console.log(`Created ${newLogsToCreate.length} new medicine logs for user ${user_id} on ${dateString}`);
        }

    } catch (error) {
        console.error('Error generating daily logs:', error);
        // We don't throw here, as we want the main route to continue
    }
}


// =====================================================
// ROUTES
// =====================================================

// Get all medicines (the list of prescriptions)
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

// Add a new medicine prescription
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
        
        // IMPORTANT: After adding, generate logs for *today* immediately
        const today = new Date().toISOString().split('T')[0];
        await generateDailyLogs(req.db, user_id, today);

        res.json({ success: true, message: 'Medicine added', medicine_id: result.insertId });

    } catch (error) {
        console.error('Add medicine error:', error);
        res.status(500).json({ error: 'Failed to add medicine' });
    }
});

// Get logs for today (THIS IS THE KEY UPDATE)
router.get('/logs/today', async (req, res) => {
    try {
        const { user_id } = req.user;
        const today = new Date().toISOString().split('T')[0];

        // ** THIS IS THE NEW LOGIC **
        // Run the log generator *before* fetching the logs.
        // This ensures today's logs exist if the user opens the app for the first time.
        await generateDailyLogs(req.db, user_id, today);
        
        // Now, fetch the logs we just ensured exist
        const [logs] = await req.db.query(`
            SELECT 
                l.*, m.medicine_name
            FROM medicine_logs l
            JOIN medicines m ON l.medicine_id = m.medicine_id
            WHERE l.user_id = ? AND DATE(l.scheduled_time) = ?
            ORDER BY l.scheduled_time ASC
        `, [user_id, today]);
        
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