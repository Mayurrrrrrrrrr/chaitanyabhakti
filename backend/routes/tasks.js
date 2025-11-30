//
// FILE: backend/routes/tasks.js
//
const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // GET my tasks (personal + assigned)
  router.get('/', async (req, res) => {
    try {
      const user_id = req.user.id;

      // Get tasks created by me (personal) OR assigned to me
      const [tasks] = await db.query(
        `SELECT t.*, ta.status as assignment_status, ta.assignment_id 
         FROM tasks t
         LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
         WHERE t.created_by = ? OR ta.assigned_to_user_id = ?
         ORDER BY t.created_at DESC`,
        [user_id, user_id]
      );

      // Format for frontend
      const formatted = tasks.map(t => ({
        ...t,
        is_completed: t.is_completed || (t.assignment_status === 'completed')
      }));

      res.json(formatted);
    } catch (error) {
      console.error('Get my tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // GET tasks for a family
  router.get('/family/:family_id', async (req, res) => {
    try {
      const { family_id } = req.params;
      // ... existing logic ...
      const [all_tasks] = await db.query(
        `SELECT t.*, u.name as created_by_name 
         FROM tasks t
         JOIN users u ON t.created_by = u.user_id
         WHERE t.family_id = ? ORDER BY t.created_at DESC`,
        [family_id]
      );
      // ...
      res.json(all_tasks); // Simplified for now
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // POST a new task
  router.post('/', async (req, res) => {
    try {
      const { family_id, title, description, due_date, assigned_user_ids, task_type } = req.body;
      const user_id = req.user.id;

      // If family_id is provided, check admin. If not, it's a personal task.
      if (family_id) {
        const [membership] = await db.query('SELECT is_admin FROM family_members WHERE family_id = ? AND user_id = ?', [family_id, user_id]);
        if (membership.length === 0 || !membership[0].is_admin) {
          return res.status(403).json({ error: 'Only family admins can create family tasks' });
        }
      }

      // Use description as title if title is missing (frontend sends description as main text)
      const taskTitle = title || description || 'New Task';

      const [result] = await db.query(
        'INSERT INTO tasks (family_id, created_by, title, description, due_date) VALUES (?, ?, ?, ?, ?)',
        [family_id || null, user_id || null, taskTitle || null, description || null, due_date || null]
      );

      const task_id = result.insertId;

      // For personal tasks, assign to self automatically
      const assignees = assigned_user_ids || [user_id];

      const assignmentValues = assignees.map(uid => [task_id, uid]);
      await db.query(
        'INSERT INTO task_assignments (task_id, assigned_to_user_id) VALUES ?',
        [assignmentValues]
      );

      res.status(201).json({ message: 'Task created', task_id, title: taskTitle });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // PUT (update task status)
  router.put('/assignment/:assignment_id', async (req, res) => {
    try {
      const { assignment_id } = req.params;
      const { status } = req.body;
      const user_id = req.user.id;

      if (!status) return res.status(400).json({ error: 'Status is required' });

      const completed_at = (status === 'completed') ? new Date() : null;

      await db.query(
        'UPDATE task_assignments SET status = ?, completed_at = ? WHERE assignment_id = ? AND assigned_to_user_id = ?',
        [status, completed_at, assignment_id, user_id]
      );

      res.json({ message: 'Task status updated' });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({ error: 'Failed to update task status' });
    }
  });

  // DELETE a task (admin only)
  router.delete('/:task_id', async (req, res) => {
    try {
      const { task_id } = req.params;
      const user_id = req.user.id;

      const [task] = await db.query('SELECT created_by, family_id FROM tasks WHERE task_id = ?', [task_id]);
      if (task.length === 0) return res.status(404).json({ error: 'Task not found' });

      const [membership] = await db.query('SELECT is_admin FROM family_members WHERE family_id = ? AND user_id = ?', [task[0].family_id, user_id]);
      const is_family_admin = membership.length > 0 && membership[0].is_admin;

      if (task[0].created_by !== user_id && !is_family_admin) {
        return res.status(403).json({ error: 'Not authorized to delete this task' });
      }

      await db.query('DELETE FROM tasks WHERE task_id = ?', [task_id]);
      res.json({ message: 'Task deleted' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // 🛑 NEW: GET TASK SUMMARY FOR DASHBOARD
  router.get('/summary/my-pending', async (req, res) => {
    try {
      const user_id = req.user.id;
      const [result] = await db.query(
        `SELECT COUNT(assignment_id) as pending_count 
         FROM task_assignments 
         WHERE assigned_to_user_id = ? AND status = 'pending'`,
        [user_id]
      );
      res.json(result[0]);
    } catch (error) {
      console.error('Get task summary error:', error);
      res.status(500).json({ error: 'Failed to fetch task summary' });
    }
  });

  return router;
};