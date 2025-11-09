// =====================================================
// VAISHNAV BHAKTI APP - BACKEND SERVER
// Node.js + Express + MySQL
// File: server.js (Main entry point)
// =====================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// =====================================================
// DATABASE CONNECTION POOL
// =====================================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vaishnav_bhakti',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
    });

// =====================================================
// FILE UPLOAD CONFIGURATION
// =====================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = file.fieldname === 'audio' ? 'uploads/audio' : 
                         file.fieldname === 'video' ? 'uploads/videos' : 
                         'uploads/images';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|mp4|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// =====================================================
// JWT AUTHENTICATION MIDDLEWARE
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// =====================================================
// LANGUAGE HELPER FUNCTIONS
// =====================================================

const getLocalizedField = (obj, field, lang = 'hi') => {
    if (lang === 'en' && obj[`${field}_en`]) {
        return obj[`${field}_en`];
    }
    return obj[field];
};

// =====================================================
// AUTH ROUTES
// =====================================================

// Generate OTP (for testing, use referral code)
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { mobile_number } = req.body;

        if (!mobile_number) {
            return res.status(400).json({ error: 'Mobile number required' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await pool.query(
            'INSERT INTO otp_verifications (mobile_number, otp_code, expires_at) VALUES (?, ?, ?)',
            [mobile_number, otp, expiresAt]
        );

        // TODO: Integrate WhatsApp API (Twilio/MSG91) to send OTP
        // For now, return OTP in response (REMOVE IN PRODUCTION!)
        console.log(`OTP for ${mobile_number}: ${otp}`);

        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            otp: otp // REMOVE THIS IN PRODUCTION
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP and login/register
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { mobile_number, otp, name, spiritual_name } = req.body;

        // Verify OTP
        const [otpRecords] = await pool.query(
            'SELECT * FROM otp_verifications WHERE mobile_number = ? AND otp_code = ? AND expires_at > NOW() AND is_verified = FALSE ORDER BY created_at DESC LIMIT 1',
            [mobile_number, otp]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as verified
        await pool.query(
            'UPDATE otp_verifications SET is_verified = TRUE WHERE otp_id = ?',
            [otpRecords[0].otp_id]
        );

        // Check if user exists
        let [users] = await pool.query(
            'SELECT * FROM users WHERE mobile_number = ?',
            [mobile_number]
        );

        let user;
        if (users.length === 0) {
            // Register new user
            if (!name) {
                return res.status(400).json({ error: 'Name required for registration' });
            }

            const [result] = await pool.query(
                'INSERT INTO users (mobile_number, name, spiritual_name) VALUES (?, ?, ?)',
                [mobile_number, name, spiritual_name || null]
            );

            user = {
                user_id: result.insertId,
                mobile_number,
                name,
                spiritual_name,
                is_super_admin: false
            };

            // Create default preferences
            await pool.query(
                'INSERT INTO user_preferences (user_id) VALUES (?)',
                [user.user_id]
            );
        } else {
            user = users[0];
            
            // Update last login
            await pool.query(
                'UPDATE users SET last_login = NOW() WHERE user_id = ?',
                [user.user_id]
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, mobile_number: user.mobile_number },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                spiritual_name: user.spiritual_name,
                mobile_number: user.mobile_number,
                profile_photo: user.profile_photo,
                is_super_admin: user.is_super_admin
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Referral code login (for development)
app.post('/api/auth/referral-login', async (req, res) => {
    try {
        const { referral_code, name, spiritual_name } = req.body;

        // Check if referral code matches any family
        const [families] = await pool.query(
            'SELECT * FROM families WHERE family_code = ?',
            [referral_code]
        );

        if (families.length === 0) {
            return res.status(400).json({ error: 'Invalid referral code' });
        }

        // For development: allow login without mobile number
        const tempMobile = `+91${Date.now().toString().slice(-10)}`;
        
        const [result] = await pool.query(
            'INSERT INTO users (mobile_number, name, spiritual_name) VALUES (?, ?, ?)',
            [tempMobile, name, spiritual_name || null]
        );

        const user = {
            user_id: result.insertId,
            mobile_number: tempMobile,
            name,
            spiritual_name,
            is_super_admin: false
        };

        // Add user to family
        await pool.query(
            'INSERT INTO family_members (family_id, user_id, is_admin) VALUES (?, ?, FALSE)',
            [families[0].family_id, user.user_id]
        );

        // Create default preferences
        await pool.query(
            'INSERT INTO user_preferences (user_id) VALUES (?)',
            [user.user_id]
        );

        const token = jwt.sign(
            { user_id: user.user_id, mobile_number: user.mobile_number },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user,
            joined_family: families[0]
        });
    } catch (error) {
        console.error('Referral login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// =====================================================
// USER ROUTES
// =====================================================

// Get current user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT u.*, p.language, p.font_size, p.high_contrast FROM users u LEFT JOIN user_preferences p ON u.user_id = p.user_id WHERE u.user_id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, upload.single('profile_photo'), async (req, res) => {
    try {
        const { name, spiritual_name, date_of_birth } = req.body;
        const profile_photo = req.file ? `/uploads/images/${req.file.filename}` : null;

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (spiritual_name !== undefined) {
            updates.push('spiritual_name = ?');
            values.push(spiritual_name);
        }
        if (date_of_birth) {
            updates.push('date_of_birth = ?');
            values.push(date_of_birth);
        }
        if (profile_photo) {
            updates.push('profile_photo = ?');
            values.push(profile_photo);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.user.user_id);

        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
            values
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update user preferences
app.put('/api/user/preferences', authenticateToken, async (req, res) => {
    try {
        const { language, font_size, high_contrast, voice_commands, text_to_speech, notifications_enabled, daily_reminder_time, theme } = req.body;

        const updates = [];
        const values = [];

        if (language) { updates.push('language = ?'); values.push(language); }
        if (font_size) { updates.push('font_size = ?'); values.push(font_size); }
        if (high_contrast !== undefined) { updates.push('high_contrast = ?'); values.push(high_contrast); }
        if (voice_commands !== undefined) { updates.push('voice_commands = ?'); values.push(voice_commands); }
        if (text_to_speech !== undefined) { updates.push('text_to_speech = ?'); values.push(text_to_speech); }
        if (notifications_enabled !== undefined) { updates.push('notifications_enabled = ?'); values.push(notifications_enabled); }
        if (daily_reminder_time) { updates.push('daily_reminder_time = ?'); values.push(daily_reminder_time); }
        if (theme) { updates.push('theme = ?'); values.push(theme); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No preferences to update' });
        }

        values.push(req.user.user_id);

        await pool.query(
            `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
            values
        );

        res.json({ success: true, message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Continue with more routes...
// (Due to length, I'll provide the complete backend in parts)

// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'vaishnav_bhakti'}`);
    console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
});

// =====================================================
// EXPORT FOR TESTING
// =====================================================

module.exports = { app, pool, authenticateToken };

// =====================================================
// NOTE: This is Part 1 of the backend.
// Additional route files to create:
// - routes/families.js (family management)
// - routes/japa.js (japa counter & leaderboards)
// - routes/tasks.js (task management)
// - routes/scriptures.js (scripture library)
// - routes/community.js (community posts)
// - routes/medicines.js (medicine tracker)
// - routes/media.js (audio/video uploads)
// =====================================================