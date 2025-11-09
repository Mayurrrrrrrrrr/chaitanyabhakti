// =====================================================
// JAPA COUNTER & LEADERBOARD ROUTES
// File: routes/japa.js
// =====================================================

const express = require('express');
const router = express.Router();

// Import database pool and auth middleware from server.js
// const { pool, authenticateToken } = require('../server');

// =====================================================
// ADD/UPDATE JAPA COUNT
// =====================================================

// Add or update today's japa count
router.post('/add', async (req, res) => {
    try {
        const { user_id } = req.user; // from JWT token
        const { family_id, mala_count, bead_count, notes } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Check if record exists for today
        const [existing] = await req.db.query(
            'SELECT * FROM japa_records WHERE user_id = ? AND family_id <=> ? AND japa_date = ?',
            [user_id, family_id || null, today]
        );

        if (existing.length > 0) {
            // Update existing record
            await req.db.query(
                'UPDATE japa_records SET mala_count = mala_count + ?, bead_count = ?, notes = ?, updated_at = NOW() WHERE japa_id = ?',
                [mala_count || 0, bead_count || 0, notes || null, existing[0].japa_id]
            );

            res.json({ 
                success: true, 
                message: 'Japa count updated',
                japa_id: existing[0].japa_id,
                total_malas: existing[0].mala_count + (mala_count || 0)
            });
        } else {
            // Insert new record
            const [result] = await req.db.query(
                'INSERT INTO japa_records (user_id, family_id, mala_count, bead_count, japa_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, family_id || null, mala_count || 0, bead_count || 0, today, notes || null]
            );

            res.json({ 
                success: true, 
                message: 'Japa count added',
                japa_id: result.insertId,
                total_malas: mala_count || 0
            });
        }

        // Update user's streak
        await updateUserStreak(req.db, user_id);

    } catch (error) {
        console.error('Add japa error:', error);
        res.status(500).json({ error: 'Failed to add japa count' });
    }
});

// Increment mala count (for counter button)
router.post('/increment', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const [existing] = await req.db.query(
            'SELECT * FROM japa_records WHERE user_id = ? AND family_id <=> ? AND japa_date = ?',
            [user_id, family_id || null, today]
        );

        if (existing.length > 0) {
            await req.db.query(
                'UPDATE japa_records SET mala_count = mala_count + 1, updated_at = NOW() WHERE japa_id = ?',
                [existing[0].japa_id]
            );
            
            res.json({ 
                success: true, 
                total_malas: existing[0].mala_count + 1
            });
        } else {
            const [result] = await req.db.query(
                'INSERT INTO japa_records (user_id, family_id, mala_count, japa_date) VALUES (?, ?, 1, ?)',
                [user_id, family_id || null, today]
            );
            
            res.json({ 
                success: true, 
                total_malas: 1,
                japa_id: result.insertId
            });
        }

        await updateUserStreak(req.db, user_id);

    } catch (error) {
        console.error('Increment japa error:', error);
        res.status(500).json({ error: 'Failed to increment count' });
    }
});

// =====================================================
// GET JAPA HISTORY
// =====================================================

// Get user's japa history
router.get('/history', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id, start_date, end_date, limit = 30 } = req.query;

        let query = 'SELECT * FROM japa_records WHERE user_id = ?';
        const params = [user_id];

        if (family_id) {
            query += ' AND family_id = ?';
            params.push(family_id);
        }

        if (start_date) {
            query += ' AND japa_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND japa_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY japa_date DESC LIMIT ?';
        params.push(parseInt(limit));

        const [records] = await req.db.query(query, params);

        res.json({ 
            success: true, 
            records,
            total: records.length 
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get today's japa count
router.get('/today', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.query;
        const today = new Date().toISOString().split('T')[0];

        const [records] = await req.db.query(
            'SELECT * FROM japa_records WHERE user_id = ? AND family_id <=> ? AND japa_date = ?',
            [user_id, family_id || null, today]
        );

        res.json({ 
            success: true, 
            today: records[0] || { mala_count: 0, bead_count: 0 }
        });

    } catch (error) {
        console.error('Get today error:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s count' });
    }
});

// =====================================================
// LEADERBOARDS
// =====================================================

// Family leaderboard
router.get('/leaderboard/family/:family_id', async (req, res) => {
    try {
        const { family_id } = req.params;
        const { period = 'all', limit = 10 } = req.query;
        const lang = req.query.lang || 'hi';

        let dateFilter = '';
        if (period === 'today') {
            dateFilter = 'AND jr.japa_date = CURDATE()';
        } else if (period === 'week') {
            dateFilter = 'AND jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (period === 'month') {
            dateFilter = 'AND jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        const [leaderboard] = await req.db.query(`
            SELECT 
                u.user_id,
                u.name,
                u.spiritual_name,
                u.profile_photo,
                fm.relation_label${lang === 'en' ? '_en' : ''} as relation,
                COALESCE(SUM(jr.mala_count), 0) as total_malas,
                COUNT(DISTINCT jr.japa_date) as days_active,
                u.current_streak
            FROM family_members fm
            JOIN users u ON fm.user_id = u.user_id
            LEFT JOIN japa_records jr ON jr.user_id = u.user_id AND jr.family_id = fm.family_id ${dateFilter}
            WHERE fm.family_id = ?
            GROUP BY u.user_id
            ORDER BY total_malas DESC
            LIMIT ?
        `, [family_id, parseInt(limit)]);

        res.json({ 
            success: true, 
            leaderboard,
            period,
            family_id: parseInt(family_id)
        });

    } catch (error) {
        console.error('Family leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Global leaderboard
router.get('/leaderboard/global', async (req, res) => {
    try {
        const { period = 'all', limit = 50 } = req.query;

        let dateFilter = '';
        if (period === 'today') {
            dateFilter = 'AND jr.japa_date = CURDATE()';
        } else if (period === 'week') {
            dateFilter = 'AND jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (period === 'month') {
            dateFilter = 'AND jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        const [leaderboard] = await req.db.query(`
            SELECT 
                u.user_id,
                u.name,
                u.spiritual_name,
                u.profile_photo,
                ${period === 'all' ? 'u.total_japa_count' : 'COALESCE(SUM(jr.mala_count), 0)'} as total_malas,
                COUNT(DISTINCT jr.japa_date) as days_active,
                u.current_streak,
                u.longest_streak
            FROM users u
            LEFT JOIN japa_records jr ON u.user_id = jr.user_id ${dateFilter}
            ${period === 'all' ? 'WHERE u.total_japa_count > 0' : ''}
            GROUP BY u.user_id
            ORDER BY total_malas DESC
            LIMIT ?
        `, [parseInt(limit)]);

        res.json({ 
            success: true, 
            leaderboard,
            period,
            total_users: leaderboard.length
        });

    } catch (error) {
        console.error('Global leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch global leaderboard' });
    }
});

// User's rank in family
router.get('/rank/family/:family_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.params;
        const { period = 'all' } = req.query;

        let dateFilter = '';
        if (period === 'today') {
            dateFilter = 'AND jr.japa_date = CURDATE()';
        } else if (period === 'week') {
            dateFilter = 'AND jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (period === 'month') {
            dateFilter = 'AND jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        const [ranks] = await req.db.query(`
            SELECT 
                user_id,
                total_malas,
                RANK() OVER (ORDER BY total_malas DESC) as rank
            FROM (
                SELECT 
                    fm.user_id,
                    COALESCE(SUM(jr.mala_count), 0) as total_malas
                FROM family_members fm
                LEFT JOIN japa_records jr ON jr.user_id = fm.user_id AND jr.family_id = fm.family_id ${dateFilter}
                WHERE fm.family_id = ?
                GROUP BY fm.user_id
            ) as family_stats
        `, [family_id]);

        const userRank = ranks.find(r => r.user_id === user_id);

        res.json({ 
            success: true, 
            rank: userRank ? userRank.rank : null,
            total_malas: userRank ? userRank.total_malas : 0,
            total_members: ranks.length
        });

    } catch (error) {
        console.error('Get rank error:', error);
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

// =====================================================
// STATISTICS
// =====================================================

// User's statistics
router.get('/stats', async (req, res) => {
    try {
        const { user_id } = req.user;

        const [stats] = await req.db.query(`
            SELECT 
                u.total_japa_count,
                u.current_streak,
                u.longest_streak,
                COUNT(DISTINCT jr.japa_date) as total_days,
                COALESCE(SUM(CASE WHEN jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN jr.mala_count ELSE 0 END), 0) as malas_this_week,
                COALESCE(SUM(CASE WHEN jr.japa_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN jr.mala_count ELSE 0 END), 0) as malas_this_month,
                COALESCE(AVG(jr.mala_count), 0) as avg_malas_per_day
            FROM users u
            LEFT JOIN japa_records jr ON u.user_id = jr.user_id
            WHERE u.user_id = ?
            GROUP BY u.user_id
        `, [user_id]);

        res.json({ 
            success: true, 
            stats: stats[0] || {
                total_japa_count: 0,
                current_streak: 0,
                longest_streak: 0,
                total_days: 0,
                malas_this_week: 0,
                malas_this_month: 0,
                avg_malas_per_day: 0
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Update user's streak (consecutive days)
async function updateUserStreak(db, user_id) {
    try {
        // Get last 100 days of japa records
        const [records] = await db.query(
            'SELECT DISTINCT japa_date FROM japa_records WHERE user_id = ? ORDER BY japa_date DESC LIMIT 100',
            [user_id]
        );

        if (records.length === 0) {
            await db.query('UPDATE users SET current_streak = 0 WHERE user_id = ?', [user_id]);
            return;
        }

        // Calculate current streak
        let currentStreak = 0;
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < records.length; i++) {
            const recordDate = new Date(records[i].japa_date);
            recordDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            
            if (recordDate.getTime() === expectedDate.getTime()) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;
        
        for (let i = 1; i < records.length; i++) {
            const prevDate = new Date(records[i - 1].japa_date);
            const currDate = new Date(records[i].japa_date);
            const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Update user
        await db.query(
            'UPDATE users SET current_streak = ?, longest_streak = GREATEST(longest_streak, ?) WHERE user_id = ?',
            [currentStreak, longestStreak, user_id]
        );

    } catch (error) {
        console.error('Update streak error:', error);
    }
}

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;

// =====================================================
// USAGE IN server.js:
// const japaRoutes = require('./routes/japa');
// app.use('/api/japa', authenticateToken, japaRoutes);
// =====================================================