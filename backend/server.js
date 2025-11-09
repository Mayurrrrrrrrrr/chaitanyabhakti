// =====================================================
// VAISHNAV BHAKTI APP - BACKEND SERVER
// File: server.js (Main entry point) - CORRECTED
// =====================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Keep for future use
const multer = require('multer');
const path = require('path');
require('dotenv').config(); // Loads .env file credentials

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// DATABASE CONNECTION POOL
// =====================================================

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log(`✅ Database connected successfully to "${process.env.DB_NAME}"`);
        connection.release();
    })
    .catch(err => {
        console.error('❌ DATABASE CONNECTION FAILED:', err.message);
    });

// =====================================================
// FILE UPLOAD CONFIGURATION
// =====================================================
// Create upload directories if they don't exist
const fs = require('fs');
['uploads', 'uploads/images', 'uploads/audio', 'uploads/videos'].forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir = 'uploads/images'; // Default
        if (file.mimetype.startsWith('audio/')) {
            uploadDir = 'uploads/audio';
        } else if (file.mimetype.startsWith('video/')) {
            uploadDir = 'uploads/videos';
        }
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
        // Allow common images, audio, and video
        const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|mpeg|mp4|mov|avi/;
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

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // { user_id: ..., mobile_number: ... }
        next();
    });
};

// =====================================================
// DATABASE & UPLOAD INJECTION MIDDLEWARE
// =====================================================
// This middleware makes `req.db` and `req.upload` available in all routes
const injectDb = (req, res, next) => {
    req.db = pool;
    req.upload = upload;
    next();
};

// =====================================================
// IMPORT ROUTES
// =====================================================
const japaRoutes = require('./routes/japa.js');
const familyRoutes = require('./routes/families.js');
const taskRoutes = require('./routes/tasks.js'); // <-- THIS LINE
const medicineRoutes = require('./routes/medicines.js');
const scriptureRoutes = require('./routes/scriptures.js');
const communityRoutes = require('./routes/community.js');
const mediaRoutes = require('./routes/media.js');

// =====================================================
// API ROUTES
// =====================================================

// --- Public Auth Routes (No token needed) ---
app.post('/api/auth/send-otp', injectDb, async (req, res) => {
    // ... (Your existing send-otp code) ...
     try {
        const { mobile_number } = req.body;
        if (!mobile_number) return res.status(400).json({ error: 'Mobile number required' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await req.db.query(
            'INSERT INTO otp_verifications (mobile_number, otp_code, expires_at) VALUES (?, ?, ?)',
            [mobile_number, otp, expiresAt]
        );
        
        console.log(`OTP for ${mobile_number}: ${otp}`); // For testing
        res.json({ success: true, message: 'OTP sent', otp: otp }); // Send OTP for testing
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/auth/verify-otp', injectDb, async (req, res) => {
    // ... (Your existing verify-otp code) ...
    try {
        const { mobile_number, otp, name, spiritual_name } = req.body;

        const [otpRecords] = await req.db.query(
            'SELECT * FROM otp_verifications WHERE mobile_number = ? AND otp_code = ? AND expires_at > NOW() AND is_verified = FALSE ORDER BY created_at DESC LIMIT 1',
            [mobile_number, otp]
        );

        if (otpRecords.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });
        await req.db.query('UPDATE otp_verifications SET is_verified = TRUE WHERE otp_id = ?', [otpRecords[0].otp_id]);

        let [users] = await req.db.query('SELECT * FROM users WHERE mobile_number = ?', [mobile_number]);
        let user;

        if (users.length === 0) {
            if (!name) return res.status(400).json({ error: 'Name required for registration' });

            const [result] = await req.db.query(
                'INSERT INTO users (mobile_number, name, spiritual_name) VALUES (?, ?, ?)',
                [mobile_number, name, spiritual_name || null]
            );
            user = { user_id: result.insertId, mobile_number, name, spiritual_name, is_super_admin: false };
            await req.db.query('INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id', [user.user_id]);
        } else {
            user = users[0];
            await req.db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
        }

        const token = jwt.sign({ user_id: user.user_id, mobile_number: user.mobile_number }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true, token,
            user: {
                user_id: user.user_id, name: user.name, spiritual_name: user.spiritual_name,
                mobile_number: user.mobile_number, profile_photo: user.profile_photo, is_super_admin: user.is_super_admin
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

app.post('/api/auth/referral-login', injectDb, async (req, res) => {
    // ... (Your existing referral-login code) ...
    try {
        const { referral_code, name, spiritual_name } = req.body;
        const [families] = await req.db.query('SELECT * FROM families WHERE family_code = ?', [referral_code]);
        if (families.length === 0) return res.status(400).json({ error: 'Invalid referral code' });

        const tempMobile = `+91${Date.now().toString().slice(-10)}`;
        const [result] = await req.db.query(
            'INSERT INTO users (mobile_number, name, spiritual_name) VALUES (?, ?, ?)',
            [tempMobile, name, spiritual_name || null]
        );
        const user = { user_id: result.insertId, mobile_number: tempMobile, name, spiritual_name, is_super_admin: false };

        await req.db.query(
            'INSERT INTO family_members (family_id, user_id, is_admin) VALUES (?, ?, FALSE)',
            [families[0].family_id, user.user_id]
        );
        await req.db.query('INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id', [user.user_id]);

        const token = jwt.sign({ user_id: user.user_id, mobile_number: user.mobile_number }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, user, joined_family: families[0] });
    } catch (error) {
        console.error('Referral login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});


// --- Protected API Routes (Token required) ---
// All these routes will have `req.db`, `req.upload`, and `req.user`
app.use('/api/user', injectDb, authenticateToken, async (req, res, next) => {
    // Handle /api/user/profile and /api/user/preferences here
    if (req.path === '/profile' && req.method === 'GET') {
        try {
            const [users] = await req.db.query(
                'SELECT u.*, p.language, p.font_size, p.high_contrast FROM users u LEFT JOIN user_preferences p ON u.user_id = p.user_id WHERE u.user_id = ?',
                [req.user.user_id]
            );
            if (users.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json({ user: users[0] });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    } else if (req.path === '/profile' && req.method === 'PUT') {
        // This needs to be handled by the multer upload middleware first
        next();
    } else if (req.path === '/preferences' && req.method === 'PUT') {
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
            values.push(req.user.user_id);
            await req.db.query(`UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`, values);
            res.json({ success: true, message: 'Preferences updated' });
        } catch (error) {
            console.error('Update preferences error:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    } else {
        next();
    }
});

// Handle profile photo upload separately
app.put('/api/user/profile', injectDb, authenticateToken, upload.single('profile_photo'), async (req, res) => {
    try {
        const { name, spiritual_name, date_of_birth } = req.body;
        const profile_photo = req.file ? `/uploads/images/${req.file.filename}` : null;
        const updates = [], values = [];
        if (name) { updates.push('name = ?'); values.push(name); }
        if (spiritual_name !== undefined) { updates.push('spiritual_name = ?'); values.push(spiritual_name); }
        if (date_of_birth) { updates.push('date_of_birth = ?'); values.push(date_of_birth); }
        if (profile_photo) { updates.push('profile_photo = ?'); values.push(profile_photo); }
        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
        values.push(req.user.user_id);
        await req.db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, values);
        res.json({ success: true, message: 'Profile updated', profile_photo: profile_photo });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});


// Use the imported routes
app.use('/api/japa', injectDb, authenticateToken, japaRoutes);
app.use('/api/families', injectDb, authenticateToken, familyRoutes);
app.use('/api/tasks', injectDb, authenticateToken, taskRoutes); // <-- THIS LINE
app.use('/api/medicines', injectDb, authenticateToken, medicineRoutes);
app.use('/api/scriptures', injectDb, authenticateToken, scriptureRoutes);
app.use('/api/community', injectDb, authenticateToken, communityRoutes);
app.use('/api/media', injectDb, authenticateToken, mediaRoutes);


// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});