// =====================================================
// VAISHNAV BHAKTI APP - BACKEND SERVER
// File: server.js (Main entry point) - CORRECTED
// =====================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        // IMPORTANT: The user payload is nested inside 'user' in your other code
        // But your JWT might just be the user object. We'll check both.
        // My auth routes create { user: { id: ... } }
        // Your old auth routes create { user_id: ... }
        // Let's standardize on the { user: { ... } } payload from my previous code.
        
        // If the token payload is { user_id: 1, ... }, adapt it
        if (decoded.user_id && !decoded.user) {
             req.user = { 
                id: decoded.user_id, 
                mobile_number: decoded.mobile_number,
                is_super_admin: decoded.is_super_admin 
            };
        } 
        // If the token payload is { user: { id: 1, ... } }
        else if (decoded.user) {
            req.user = decoded.user;
        } 
        // Otherwise, invalid token structure
        else {
             return res.status(403).json({ error: 'Invalid token payload' });
        }
        
        next();
    });
};

// =====================================================
// IMPORT ROUTES
// =====================================================
// These files must export a function: module.exports = (db, upload) => { ... }
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const japaRoutes = require('./routes/japa.js');
const familyRoutes = require('./routes/families.js');
const taskRoutes = require('./routes/tasks.js');
const medicineRoutes = require('./routes/medicines.js');
const scriptureRoutes = require('./routes/scriptures.js');
const communityRoutes = require('./routes/community.js');
const mediaRoutes = require('./routes/media.js');
const userRoutes = require('./routes/user.js'); // Assuming you create this

// =====================================================
// API ROUTES
// =====================================================

// --- Public Auth Routes (No token needed) ---
// We pass the 'pool' (db connection) to the route file.
// The authRoutes file handles its own public/private logic.
app.use('/api/auth', authRoutes(pool));

// --- Protected API Routes (Token required) ---
// These routes are protected by `authenticateToken`
// We pass both 'pool' and 'upload' to the routes that need them.
app.use('/api/japa', authenticateToken, japaRoutes(pool));
app.use('/api/families', authenticateToken, familyRoutes(pool));
app.use('/api/tasks', authenticateToken, taskRoutes(pool));
app.use('/api/medicines', authenticateToken, medicineRoutes(pool));
app.use('/api/scriptures', authenticateToken, scriptureRoutes(pool));
app.use('/api/community', authenticateToken, communityRoutes(pool, upload));
app.use('/api/media', authenticateToken, mediaRoutes(pool, upload));

// --- User Profile Routes (Token required) ---
// These are special because one of them uses the 'upload' middleware
app.use('/api/user', authenticateToken, userRoutes(pool, upload));

// --- Admin Routes (Token + Admin check required) ---
// `authenticateToken` runs first, then `adminRoutes` will use
// the `isSuperAdmin` middleware internally.
app.use('/api/admin', authenticateToken, adminRoutes(pool));


// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});