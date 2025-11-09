// =====================================================
// TASK MANAGEMENT ROUTES
// File: routes/tasks.js
// =====================================================

const express = require('express');
const router = express.Router();

// =====================================================
// CREATE TASK
// =====================================================
// Creates a task for one or more family members
router.post('/create', async (req, res) => {
    try {
        const { user_id } = req.user;
        const {
            family_id,
            title,
            description,
            due_date,
            assigned_to_users // Array of user_ids to assign the task to
        } = req.body;

        if (!family_id || !title || !assigned_to_users || assigned_to_users.length === 0) {
            return res.status(400).json({ error: 'Missing required fields: family_id, title, and assigned_to_users' });
        }

        // Check if creator is a member of the family (and ideally an admin, but we'll just check membership)
        const [membership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
            [family_id, user_id]
        );
        if (membership.length === 0) {
            return res.status(403).json({ error: 'You are not a member of this family.' });
        }

        // 1. Create the main task
        const [taskResult] = await req.db.query(`
            INSERT INTO tasks (family_id, created_by, title, description, due_date)
            VALUES (?, ?, ?, ?, ?)
        `, [family_id, user_id, title, description || null, due_date || null]);

        const taskId = taskResult.insertId;

        // 2. Create assignments
        const assignmentValues = assigned_to_users.map(assigned_id => {
            return [taskId, assigned_id];
        });

        await req.db.query(
            'INSERT INTO task_assignments (task_id, assigned_to_user_id) VALUES ?',
            [assignmentValues]
        );

        res.json({ success: true, message: 'Task created and assigned', task_id: taskId });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// =====================================================
// GET TASKS
// =====================================================

// Get all tasks assigned to the current user
router.get('/my-tasks', async (req, res) => {
    try {
        const { user_id } = req.user;

        const [tasks] = await req.db.query(`
            SELECT 
                t.task_id,
                t.title,
                t.description,
                t.due_date,
                t.created_at,
                f.family_name,
                u.name as created_by_name,
                ta.status,
                ta.assignment_id,
                ta.completed_at
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.task_id
            JOIN families f ON t.family_id = f.family_id
            JOIN users u ON t.created_by = u.user_id
            WHERE ta.assigned_to_user_id = ?
            ORDER BY ta.status ASC, t.due_date ASC, t.created_at DESC
        `, [user_id]);

        res.json({ success: true, tasks });

    } catch (error) {
        console.error('Get my-tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get all tasks for a specific family
router.get('/family/:family_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.params;

        // Check if user is a member of this family
        const [membership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
            [family_id, user_id]
        );
        if (membership.length === 0) {
            return res.status(403).json({ error: 'You are not a member of this family.' });
        }

        // Get all tasks and their assignment statuses for this family
        const [tasks] = await req.db.query(`
            SELECT 
                t.task_id,
                t.title,
                t.description,
                t.due_date,
                t.created_by,
                creator.name as created_by_name,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'assignment_id', ta.assignment_id,
                        'user_id', ta.assigned_to_user_id,
                        'name', assignee.name,
                        'status', ta.status
                    )
                ) as assignments
            FROM tasks t
            LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
            LEFT JOIN users creator ON t.created_by = creator.user_id
            LEFT JOIN users assignee ON ta.assigned_to_user_id = assignee.user_id
            WHERE t.family_id = ?
            GROUP BY t.task_id
            ORDER BY t.created_at DESC
        `, [family_id]);

        // Parse the JSON string for assignments
        const formattedTasks = tasks.map(task => ({
            ...task,
            assignments: task.assignments ? JSON.parse(`[${task.assignments}]`) : []
        }));

        res.json({ success: true, tasks: formattedTasks });

    } catch (error) {
        console.error('Get family tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch family tasks' });
    }
});


// =====================================================
// UPDATE/COMPLETE TASK
// =====================================================

// Mark a task assignment as complete
router.post('/:assignment_id/complete', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { assignment_id } = req.params;

        const [result] = await req.db.query(`
            UPDATE task_assignments 
            SET status = 'completed', completed_at = NOW()
            WHERE assignment_id = ? AND assigned_to_user_id = ?
        `, [assignment_id, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task assignment not found or not assigned to you.' });
        }

        res.json({ success: true, message: 'Task marked as complete' });

    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// =====================================================
// DELETE TASK
// =====================================================
router.delete('/:task_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { task_id } = req.params;

        // Check if user is the creator of the task
        const [tasks] = await req.db.query(
            'SELECT * FROM tasks WHERE task_id = ? AND created_by = ?',
            [task_id, user_id]
        );

        if (tasks.length === 0) {
            // Or check if user is a family admin (more complex, skipping for now)
            return res.status(403).json({ error: 'Only the task creator can delete this task.' });
        }

        // Delete task (CASCADE will handle assignments)
        await req.db.query('DELETE FROM tasks WHERE task_id = ?', [task_id]);

        res.json({ success: true, message: 'Task deleted' });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});


module.exports = router;