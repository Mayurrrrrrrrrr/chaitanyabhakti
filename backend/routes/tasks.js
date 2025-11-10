//
// FILE: backend/routes/tasks.js
//
const express = require('express');
const router = express.Router();

//
// Converted to module.exports = (db) => { ... }
module.exports = (db) => {

  // GET tasks for a family
  router.get('/:family_id', async (req, res) => {
    try {
      const { family_id } = req.params;
      const user_id = req.user.id; // Use req.user.id

      // Get all tasks for the family, and join the user's assignment status
      const [tasks] = await db.query(
        `SELECT 
          t.*, 
          u.name as created_by_name,
          ta.status,
          ta.assignment_id,
          ta.assigned_to_user_id
         FROM tasks t
         JOIN users u ON t.created_by = u.user_id
         LEFT JOIN task_assignments ta ON t.task_id = ta.task_id AND ta.assigned_to_user_id = ?
         WHERE t.family_id = ?
         ORDER BY t.created_at DESC`,
        [user_id, family_id]
      );
      
      // This is complex. We might need to get *all* assignments.
      // Let's refine: Get all tasks, and all assignments for those tasks.
      const [all_tasks] = await db.query(
        `SELECT t.*, u.name as created_by_name 
         FROM tasks t
         JOIN users u ON t.created_by = u.user_id
         WHERE t.family_id = ? ORDER BY t.created_at DESC`,
        [family_id]
      );
      
      const [all_assignments] = await db.query(
        `SELECT ta.*, u.name as assigned_to_name
         FROM task_assignments ta
         JOIN users u ON ta.assigned_to_user_id = u.user_id
         WHERE ta.task_id IN (SELECT task_id FROM tasks WHERE family_id = ?)`,
        [family_id]
      );

      // Combine them
      const taskMap = all_tasks.map(task => {
        return {
          ...task,
          assignments: all_assignments.filter(a => a.task_id === task.task_id)
        };
      });

      res.json(taskMap);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // POST a new task (admin only)
  router.post('/', async (req, res) => {
    try {
      const { family_id, title, description, due_date, assigned_user_ids } = req.body;
      const user_id = req.user.id; // Use req.user.id

      // Check if user is admin
      const [membership] = await db.query('SELECT is_admin FROM family_members WHERE family_id = ? AND user_id = ?', [family_id, user_id]);
      if (membership.length === 0 || !membership[0].is_admin) {
        return res.status(403).json({ error: 'Only family admins can create tasks' });
      }
      
      if (!title || !assigned_user_ids || assigned_user_ids.length === 0) {
        return res.status(400).json({ error: 'Title and at least one assigned user are required' });
      }

      const [result] = await db.query(
        'INSERT INTO tasks (family_id, created_by, title, description, due_date) VALUES (?, ?, ?, ?, ?)',
        [family_id, user_id, title, description, due_date || null]
      );
      
      const task_id = result.insertId;
      
      // Create assignments
      const assignmentValues = assigned_user_ids.map(uid => [task_id, uid]);
      await db.query(
        'INSERT INTO task_assignments (task_id, assigned_to_user_id) VALUES ?',
        [assignmentValues]
      );

      res.status(201).json({ message: 'Task created', task_id });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // PUT (update task status)
  router.put('/assignment/:assignment_id', async (req, res) => {
    try {
      const { assignment_id } = req.params;
      const { status } = req.body; // 'pending' or 'completed'
      const user_id = req.user.id; // Use req.user.id

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

      // Check if user is admin or creator
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

  return router;
};