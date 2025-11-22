// =====================================================
// VAISHNAV BHAKTI APP - BACKEND SERVER
// File: server.js (Updated for Render + Vercel)
// =====================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); 

// 🛑 APP MUST BE DEFINED FIRST
const app = express();

// =====================================================
// MIDDLEWARE & CORS
// =====================================================

// Define allowed origins explicitly
const allowedOrigins = [
  'https://chaitanyabhakti.vercel.app',   // Your Production Frontend
  'https://chaitanyabhakti.onrender.com', // Your Backend URL
  'http://localhost:3000',                  // Local React
  'http://localhost:5173',                  // Local Vite (if you switch)
  process.env.CLIENT_URL                    // Fallback from Env Var
].filter(Boolean); // Removes empty values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check explicit list
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Check Dynamic Localhost & LAN IPs (192.168.x.x) for testing on phone
    const isDevLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const isDevLan = /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin);

    if (isDevLocalhost || isDevLan) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin); // Helpful for debugging logs in Render
      callback(new Error('CORS policy does not allow access from this origin.'));
    }
  },
  credentials: true // Important for cookies/sessions if you use them
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// NOTE: On Render Free Tier, these files vanish on redeploy!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// DATABASE CONNECTION POOL
// =====================================================

// Ensure you put these DB_ details in Render "Environment Variables"
const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Added Port just in case
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

// Ensure directories exist (Critical for Linux/Render environments)
['uploads', 'uploads/images', 'uploads/audio', 'uploads/videos', 'uploads/files'].forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir = 'uploads/images'; 
        if (file.mimetype.startsWith('audio/')) {
            uploadDir = 'uploads/audio';
        } else if (file.mimetype.startsWith('video/')) {
            uploadDir = 'uploads/videos';
        } else if (file.mimetype === 'application/pdf') {
            uploadDir = 'uploads/files'; 
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to remove spaces/special chars for safer web URLs
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + sanitizedName;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
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
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        // Normalize the user object for consistent access in routes
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
// Ensure these files exist in your repo!
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
const eventsRoutes = require('./routes/events.js'); 

// =====================================================
// API ROUTES
// =====================================================

// Root Route (Good for checking if server is alive on Render)
app.get('/', (req, res) => {
    res.send("Vaishnav Bhakti API is Live!");
});

app.use('/api/auth', authRoutes(pool));
app.use('/api/japa', authenticateToken, japaRoutes(pool));
app.use('/api/families', authenticateToken, familyRoutes(pool));
app.use('/api/tasks', authenticateToken, taskRoutes(pool));
app.use('/api/medicines', authenticateToken, medicineRoutes(pool));
app.use('/api/scriptures', authenticateToken, scriptureRoutes(pool));
app.use('/api/community', authenticateToken, communityRoutes(pool, upload));
app.use('/api/media', authenticateToken, mediaRoutes(pool, upload)); 
app.use('/api/user', authenticateToken, userRoutes(pool, upload));
app.use('/api/events', authenticateToken, eventsRoutes(pool)); 

app.use('/api/admin', authenticateToken, adminRoutes(pool, upload)); 

// =====================================================
// SERVER START
// =====================================================

// Render sets process.env.PORT automatically
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
    console.log(`🌐 CORS Allowed for: ${allowedOrigins.join(', ')}`);
});