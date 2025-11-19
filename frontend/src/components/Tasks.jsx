import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Assuming consistent path
import './Tasks.css';

// --- Inline Icons ---
const IconCheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>;
const IconPlus = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconList = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;

// Task Types Configuration
const TASK_TYPES = [
  { id: 'all', label: 'All', color: 'var(--text-color)' },
  { id: 'sadhana', label: 'Sadhana', color: '#FF9F43' }, // Orange
  { id: 'seva', label: 'Seva', color: '#28C76F' },    // Green
  { id: 'study', label: 'Study', color: '#00CFE8' },   // Cyan
  { id: 'other', label: 'Other', color: '#EA5455' }    // Red
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter State
  const [activeFilter, setActiveFilter] = useState('all');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: 'sadhana' });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const res = await api.post('/tasks', {
        description: newTask.title, // Mapping 'title' to 'description' as per backend
        task_type: newTask.type,
        is_completed: false
      });
      // Optimistic update or refetch
      setTasks([...tasks, res.data]); 
      setNewTask({ title: '', type: 'sadhana' });
      setShowModal(false);
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const toggleTask = async (task) => {
    try {
      // Optimistic UI update
      const updatedTasks = tasks.map(t => 
        t.task_id === task.task_id ? { ...t, is_completed: !t.is_completed } : t
      );
      setTasks(updatedTasks);

      await api.put(`/tasks/${task.task_id}`, {
        is_completed: !task.is_completed
      });
    } catch (err) {
      console.error('Update failed', err);
      fetchTasks(); // Revert on error
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.task_id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // Filter Logic
  const filteredTasks = activeFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.task_type === activeFilter);

  // Sort: Incomplete first
  const sortedTasks = [...filteredTasks].sort((a, b) => a.is_completed - b.is_completed);

  return (
    <div className="page-container tasks-page">
      <header className="page-header">
        <h1 className="page-title">My Seva & Tasks</h1>
        <p className="page-subtitle">Organize your devotional service</p>
      </header>

      {/* Type Filter Chips */}
      <div className="filter-scroll-container">
          <div className="filter-chips">
            {TASK_TYPES.map(type => (
                <button
                    key={type.id}
                    className={`filter-chip ${activeFilter === type.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(type.id)}
                    style={{ '--chip-color': type.color }}
                >
                    {type.label}
                </button>
            ))}
          </div>
      </div>

      {/* Task List */}
      <div className="tasks-list fade-in">
        {loading ? (
            <div className="loading-state">Loading tasks...</div>
        ) : sortedTasks.length === 0 ? (
            <div className="empty-state">
                <div className="empty-icon"><IconList /></div>
                <p>No tasks found. Add a new one!</p>
            </div>
        ) : (
            sortedTasks.map(task => (
                <div key={task.task_id} className={`card task-card ${task.is_completed ? 'completed' : ''}`}>
                    <div className="task-left" onClick={() => toggleTask(task)}>
                        <div className={`checkbox ${task.is_completed ? 'checked' : ''}`}>
                            {task.is_completed ? <IconCheckCircle /> : <IconCircle />}
                        </div>
                        <div className="task-content">
                            <span className="task-text">{task.description}</span>
                            {task.task_type && (
                                <span className={`task-tag tag-${task.task_type}`}>
                                    {task.task_type}
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="delete-btn" onClick={() => deleteTask(task.task_id)}>
                        <IconTrash />
                    </button>
                </div>
            ))
        )}
      </div>

      {/* Add Task Floating Button */}
      <button className="floating-add-btn" onClick={() => setShowModal(true)}>
        <IconPlus />
      </button>

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="card modal-card" onClick={e => e.stopPropagation()}>
                <h3>Add New Task</h3>
                <form onSubmit={handleAddTask}>
                    <div className="form-group">
                        <label>Task Description</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="e.g. Read Bhagavad Gita Chapter 2"
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <div className="type-selector">
                            {TASK_TYPES.filter(t => t.id !== 'all').map(type => (
                                <button
                                    type="button"
                                    key={type.id}
                                    className={`type-btn ${newTask.type === type.id ? 'selected' : ''}`}
                                    onClick={() => setNewTask({...newTask, type: type.id})}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Add Task</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;