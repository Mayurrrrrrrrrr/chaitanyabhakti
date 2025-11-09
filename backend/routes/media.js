// =====================================================
// MEDIA (AUDIO/VIDEO) UPLOAD ROUTES
// File: routes/media.js
// =====================================================

const express = require('express');
const router = express.Router();

// Upload audio file
// `req.upload` is the multer instance from server.js
router.post('/upload/audio', (req, res) => {
    // We use the 'upload' middleware injected as req.upload
    req.upload.single('audio')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        try {
            const { user_id } = req.user;
            const { family_id, title, title_en, category = 'other' } = req.body;
            
            const file_url = `/uploads/audio/${req.file.filename}`;
            const file_size = req.file.size;
            // duration would require a library like 'music-metadata', skip for now
            
            const [result] = await req.db.query(`
                INSERT INTO audio_files (
                    user_id, family_id, title, title_en, 
                    file_url, file_size, category
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                user_id, family_id || null, title || req.file.originalname, title_en || null,
                file_url, file_size, category
            ]);

            res.json({ 
                success: true, 
                message: 'Audio uploaded', 
                audio_id: result.insertId,
                file_url: file_url
            });

        } catch (error) {
            console.error('Save audio error:', error);
            res.status(500).json({ error: 'Failed to save audio file info' });
        }
    });
});

// Add YouTube video link
router.post('/add-video', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id, title, title_en, youtube_url, category = 'other' } = req.body;
        
        if (!title || !youtube_url) {
            return res.status(400).json({ error: 'Title and YouTube URL are required' });
        }

        // Extract YouTube ID
        const youtube_id = getYouTubeID(youtube_url);
        if (!youtube_id) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        const thumbnail_url = `https://img.youtube.com/vi/${youtube_id}/0.jpg`;

        const [result] = await req.db.query(`
            INSERT INTO video_links (
                added_by, family_id, title, title_en, 
                youtube_url, youtube_id, category, thumbnail_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id, family_id || null, title, title_en || null,
            youtube_url, youtube_id, category, thumbnail_url
        ]);
        
        res.json({ success: true, message: 'Video link added', video_id: result.insertId });

    } catch (error) {
        console.error('Add video error:', error);
        res.status(500).json({ error: 'Failed to add video link' });
    }
});

// Get audio files
router.get('/audio', async (req, res) => {
    try {
        const { family_id } = req.query;
        let query = 'SELECT * FROM audio_files WHERE is_public = TRUE';
        const params = [];
        
        if (family_id) {
            query = 'SELECT * FROM audio_files WHERE family_id = ?';
            params.push(family_id);
        }
        
        const [files] = await req.db.query(query, params);
        res.json({ success: true, audio_files: files });
        
    } catch (error) {
         console.error('Get audio error:', error);
        res.status(500).json({ error: 'Failed to get audio files' });
    }
});

// Get video links
router.get('/videos', async (req, res) => {
    try {
        const { family_id, category } = req.query;
        let query = 'SELECT * FROM video_links WHERE is_public = TRUE';
        const params = [];
        
        if (family_id) {
            query = 'SELECT * FROM video_links WHERE family_id = ?';
            params.push(family_id);
        }
        
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY added_at DESC';
        
        const [files] = await req.db.query(query, params);
        res.json({ success: true, video_links: files });
        
    } catch (error) {
         console.error('Get videos error:', error);
        res.status(500).json({ error: 'Failed to get video links' });
    }
});


// Helper function for YouTube ID
function getYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

module.exports = router;