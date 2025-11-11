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

// 🛑 APP MUST BE DEFINED FIRST
const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

// 🛑 FIX: Explicit CORS Configuration for mobile/IP access
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.29.35:5000' // 🛑 REPLACE with your computer's IP + frontend port
  // Add any other IPs you use for testing
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from this origin.'));
    }
  }
}));

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
// 🛑 UPDATED: Create 'uploads/files' directory for PDFs
['uploads', 'uploads/images', 'uploads/audio', 'uploads/videos', 'uploads/files'].forEach(dir => {
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
        } else if (file.mimetype === 'application/pdf') {
            uploadDir = 'uploads/files'; // 🛑 Save PDFs here
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
        // 🛑 UPDATED: Allow PDF files
        const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|mpeg|mp4|mov|avi|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type: ' + file.mimetype));
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
        
        if (decoded.user_id && !decoded.user) {
             req.user = { 
                id: decoded.user_id, 
                mobile_number: decoded.mobile_number,
                is_super_admin: decoded.is_super_admin 
            };
        } 
        else if (decoded.user) {
            req.user = decoded.user;
        } 
        else {
             return res.status(403).json({ error: 'Invalid token payload' });
        }
        
        next();
    });
};

// =====================================================
// IMPORT ROUTES
// =====================================================
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const japaRoutes = require('./routes/japa.js');
const familyRoutes = require('./routes/families.js');
const taskRoutes = require('./routes/tasks.js');
const medicineRoutes = require('./routes/medicines.js');
const scriptureRoutes = require('./routes/scriptures.js');
const communityRoutes = require('./routes/community.js');
const mediaRoutes = require('./routes/media.js');
const userRoutes = require('./routes/user.js');
const eventsRoutes = require('./routes/events.js'); // 🛑 ADDED

// =====================================================
// API ROUTES
// =====================================================

// --- Public Auth Routes (No token needed) ---
app.use('/api/auth', authRoutes(pool));

// --- Protected API Routes (Token required) ---
app.use('/api/japa', authenticateToken, japaRoutes(pool));
app.use('/api/families', authenticateToken, familyRoutes(pool));
app.use('/api/tasks', authenticateToken, taskRoutes(pool));
app.use('/api/medicines', authenticateToken, medicineRoutes(pool));
app.use('/api/scriptures', authenticateToken, scriptureRoutes(pool));
app.use('/api/community', authenticateToken, communityRoutes(pool, upload));
app.use('/api/media', authenticateToken, mediaRoutes(pool, upload)); 
app.use('/api/user', authenticateToken, userRoutes(pool, upload));
app.use('/api/events', authenticateToken, eventsRoutes(pool)); // 🛑 ADDED

// --- Admin Routes (Token + Admin check required) ---
app.use('/api/admin', authenticateToken, adminRoutes(pool, upload)); // 🛑 Pass upload

// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});