// backend/routes/notifications.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // GET user's notifications
    router.get('/', async (req, res) => {
        try {
            const user_id = req.user.id;

            const [notifications] = await db.query(
                `SELECT * FROM notifications 
         WHERE user_id = ? OR user_id IS NULL 
         ORDER BY created_at DESC 
         LIMIT 50`,
                [user_id]
            );

            res.json(notifications);
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    });

    // GET unread count
    router.get('/unread-count', async (req, res) => {
        try {
            const user_id = req.user.id;

            const [result] = await db.query(
                `SELECT COUNT(*) as count FROM notifications 
         WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`,
                [user_id]
            );

            res.json({ count: result[0].count });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({ error: 'Failed to fetch unread count' });
        }
    });

    // PUT mark as read
    router.put('/:id/read', async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            await db.query(
                'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
                [id, user_id]
            );

            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            console.error('Mark read error:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    });

    // PUT mark all as read
    router.put('/mark-all-read', async (req, res) => {
        try {
            const user_id = req.user.id;

            await db.query(
                'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
                [user_id]
            );

            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Mark all read error:', error);
            res.status(500).json({ error: 'Failed to mark all as read' });
        }
    });

    // DELETE notification
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            await db.query(
                'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
                [id, user_id]
            );

            res.json({ message: 'Notification deleted' });
        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    });

    return router;
};