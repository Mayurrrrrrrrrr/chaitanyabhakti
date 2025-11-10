//
// FILE: backend/routes/user.js
//
const express = require('express');
const router = express.Router();

// We export a function that takes (db, upload)
module.exports = (db, upload) => {

    // GET /api/user/profile
    router.get('/profile', async (req, res) => {
        try {
            const [users] = await db.query(
                'SELECT u.*, p.language, p.font_size, p.high_contrast, p.voice_commands, p.text_to_speech, p.notifications_enabled, p.daily_reminder_time, p.theme FROM users u LEFT JOIN user_preferences p ON u.user_id = p.user_id WHERE u.user_id = ?',
                [req.user.id] // Use req.user.id from authenticateToken
            );
            if (users.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json({ user: users[0] });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    // PUT /api/user/profile (with photo upload)
    router.put('/profile', upload.single('profile_photo'), async (req, res) => {
        try {
            const { name, spiritual_name, date_of_birth } = req.body;
            // req.file.filename comes from multer
            const profile_photo_url = req.file ? `/uploads/images/${req.file.filename}` : null; 
            
            const updates = [];
            const values = [];
            
            if (name) { updates.push('name = ?'); values.push(name); }
            if (spiritual_name !== undefined) { updates.push('spiritual_name = ?'); values.push(spiritual_name); }
            if (date_of_birth) { updates.push('date_of_birth = ?'); values.push(date_of_birth); }
            if (profile_photo_url) { updates.push('profile_photo = ?'); values.push(profile_photo_url); }
            
            if (updates.length === 0) {
              return res.status(400).json({ error: 'No fields to update' });
            }
            
            values.push(req.user.id);
            await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, values);
            
            // Fetch the updated user data to send back
            const [users] = await db.query(
              'SELECT u.*, p.language, p.font_size, p.high_contrast, p.voice_commands, p.text_to_speech, p.notifications_enabled, p.daily_reminder_time, p.theme FROM users u LEFT JOIN user_preferences p ON u.user_id = p.user_id WHERE u.user_id = ?',
              [req.user.id]
            );
            res.json({ success: true, message: 'Profile updated', user: users[0] });
            
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    });

    // PUT /api/user/preferences
    router.put('/preferences', async (req, res) => {
        try {
            const { language, font_size, high_contrast, voice_commands, text_to_speech, notifications_enabled, daily_reminder_time, theme } = req.body;
            const updates = [], values = [];
            
            if (language) { updates.push('language = ?'); values.push(language); }
            if (font_size) { updates.push('font_size = ?'); values.push(font_size); }
            if (high_contrast !== undefined) { updates.push('high_contrast = ?'); values.push(high_contrast); }
            if (voice_commands !== undefined) { updates.push('voice_commands = ?'); values.push(voice_commands); }
            if (text_to_speech !== undefined) { updates.push('text_to_speech = ?'); values.push(text_to_speech); }
            if (notifications_enabled !== undefined) { updates.push('notifications_enabled = ?'); values.push(notifications_enabled); }
            if (daily_reminder_time) { updates.push('daily_reminder_time = ?'); values.push(daily_reminder_time); }
            if (theme) { updates.push('theme = ?'); values.push(theme); }
            
            if (updates.length === 0) return res.status(400).json({ error: 'No preferences to update' });
            
            values.push(req.user.id);
            // Use INSERT ... ON DUPLICATE KEY UPDATE to handle cases where user_preferences row might not exist
            await db.query(
              `INSERT INTO user_preferences (user_id, ${updates.map(u => u.split(' = ')[0]).join(', ')}) 
               VALUES (?, ${Array(updates.length).fill('?').join(', ')})
               ON DUPLICATE KEY UPDATE ${updates.join(', ')}`,
              [req.user.id, ...values.slice(0, -1), ...values]
            );
            
            res.json({ success: true, message: 'Preferences updated' });
        } catch (error) {
            console.error('Update preferences error:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    });

    return router;
};