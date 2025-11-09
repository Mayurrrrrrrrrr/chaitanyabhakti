// =====================================================
// TASK MANAGEMENT ROUTES
// File: routes/tasks.js
// =====================================================

const express = require('express');
const router = express.Router();

// Get tasks assigned TO the user
router.get('/my-tasks', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id, status } = req.query;
        const lang = req.query.lang || 'hi';

        let query = `
            SELECT 
                t.*, 
                a.name as assigned_by_name,
                f.family_name,
                ${lang === 'en' ? 't.title_en' : 't.title'} as title,
                ${lang === 'en' ? 't.description_en' : 't.description'} as description
            FROM tasks t
            JOIN users a ON t.assigned_by = a.user_id
            LEFT JOIN families f ON t.family_id = f.family_id
            WHERE t.assigned_to = ?
        `;
        const params = [user_id];

        if (family_id) {
            query += ' AND t.family_id = ?';
            params.push(family_id);
        }
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        query += ' ORDER BY t.due_date ASC, t.priority DESC';
        
        const [tasks] = await req.db.query(query, params);
        res.json({ success: true, tasks });

    } catch (error) {
        console.error('Get my-tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get tasks assigned BY the user (for admins)
router.get('/assigned-by-me', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.query;
        const lang = req.query.lang || 'hi';

        let query = `
            SELECT 
                t.*, 
                a.name as assigned_to_name,
                f.family_name,
                 ${lang === 'en' ? 't.title_en' : 't.title'} as title,
                ${lang === 'en' ? 't.description_en' : 't.description'} as description
            FROM tasks t
            JOIN users a ON t.assigned_to = a.user_id
            LEFT JOIN families f ON t.family_id = f.family_id
            WHERE t.assigned_by = ?
        `;
        const params = [user_id];

        if (family_id) {
            query += ' AND t.family_id = ?';
            params.push(family_id);
        }
        
        const [tasks] = await req.db.query(query, params);
        res.json({ success: true, tasks });

    } catch (error) {
        console.error('Get assigned-by-me error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create a new task (Admin only)
router.post('/create', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { 
            family_id, assigned_to, task_type, 
            title, title_en, description, description_en, 
            target_value, due_date, priority 
        } = req.body;

        // Check if user is admin of this family
        const [membership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ? AND is_admin = TRUE',
            [family_id, user_id]
        );
        if (membership.length === 0) {
            return res.status(403).json({ error: 'Only family admins can assign tasks' });
        }

        const [result] = await req.db.query(`
            INSERT INTO tasks (
                family_id, assigned_to, assigned_by, task_type, 
                title, title_en, description, description_en, 
                target_value, due_date, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            family_id, assigned_to, user_id, task_type, 
            title, title_en || null, description || null, description_en || null, 
            target_value || null, due_date || null, priority || 'medium'
        ]);

        res.json({ success: true, message: 'Task created', task_id: result.insertId });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task status by user
router.put('/:task_id/status', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { task_id } = req.params;
        const { status } = req.body; // 'in_progress', 'completed'

        if (!['in_progress', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const completed_at = status === 'completed' ? new Date() : null;

        const [result] = await req.db.query(
            'UPDATE tasks SET status = ?, completed_at = ? WHERE task_id = ? AND assigned_to = ?',
            [status, completed_at, task_id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found or not assigned to you' });
        }

        res.json({ success: true, message: 'Task status updated' });

    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Log progress on a task
router.post('/:task_id/progress', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { task_id } = req.params;
        const { progress_value, notes } = req.body;

        // Check if task is assigned to user
        const [tasks] = await req.db.query(
            'SELECT * FROM tasks WHERE task_id = ? AND assigned_to = ?',
            [task_id, user_id]
        );
        if (tasks.length === 0) {
            return res.status(404).json({ error: 'Task not found or not assigned to you' });
        }
        
        const [result] = await req.db.query(
            'INSERT INTO task_progress (task_id, progress_value, notes) VALUES (?, ?, ?)',
            [task_id, progress_value, notes || null]
        );

        res.json({ success: true, message: 'Progress logged', progress_id: result.insertId });

    } catch (error) {
        console.error('Log progress error:', error);
        res.status(500).json({ error: 'Failed to log progress' });
    }
});

// Delete a task (Admin only)
router.delete('/:task_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { task_id } = req.params;

        const [result] = await req.db.query(
            'DELETE FROM tasks WHERE task_id = ? AND assigned_by = ?',
            [task_id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found or you are not the assigner' });
        }

        res.json({ success: true, message: 'Task deleted' });
        
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});


module.exports = router;