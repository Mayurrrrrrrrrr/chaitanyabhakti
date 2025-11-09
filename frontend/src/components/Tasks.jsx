import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Tasks.css'; // हम यह CSS फ़ाइल बनाएँगे

const TaskItem = ({ task }) => {
  const [status, setStatus] = useState(task.status);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tasks/${task.task_id}/status`, { status: newStatus });
      setStatus(newStatus);
    } catch (err) {
      console.error('Status बदलने में विफल', err);
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'japa': return '📿';
      case 'reading': return '📖';
      case 'satsang': return '🗣️';
      case 'medicine': return '💊';
      default: return '✅';
    }
  };

  return (
    <div className={`task-card card ${status === 'completed' ? 'completed' : ''}`}>
      <div className="task-icon">{getTaskIcon(task.task_type)}</div>
      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        <p className="task-desc">{task.description || 'कोई विवरण नहीं।'}</p>
        <p className="task-meta">
          <strong>परिवार:</strong> {task.family_name} | 
          <strong>सौंपा:</strong> {task.assigned_by_name}
        </p>
        {task.due_date && (
          <p className="task-due">
            <strong>अंतिम तिथि:</strong> {new Date(task.due_date).toLocaleDateString('hi-IN')}
          </p>
        )}
      </div>
      <div className="task-actions">
        {status === 'pending' && (
          <button onClick={() => handleStatusChange('in_progress')} className="btn-task-start">शुरू करें</button>
        )}
        {status === 'in_progress' && (
          <button onClick={() => handleStatusChange('completed')} className="btn-task-complete">पूर्ण करें</button>
        )}
        {status === 'completed' && (
          <span className="task-completed-badge">पूर्ण हुआ</span>
        )}
      </div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        setTasks(response.data.tasks);
      } catch (err) {
        console.error('कार्य लोड करने में विफल:', err);
        setError('कार्य लोड करने में विफल।');
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  if (loading) {
    return <div className="page-container">आपके कार्य लोड हो रहे हैं...</div>;
  }
  
  if (error) {
     return <div className="page-container"><p className="error-message">{error}</p></div>;
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="tasks-page">
      <div className="card">
        <h3 className="card-title">मेरे कार्य</h3>
        <p>यहाँ आपके परिवार के एडमिन द्वारा आपको सौंपे गए सभी कार्य हैं।</p>
      </div>

      <div className="tasks-list">
        <h2>लंबित कार्य ({pendingTasks.length})</h2>
        {pendingTasks.length === 0 ? (
          <p>आपके पास कोई लंबित कार्य नहीं हैं।</p>
        ) : (
          pendingTasks.map(task => <TaskItem key={task.task_id} task={task} />)
        )}
      </div>

      <div className="tasks-list">
        <h2>पूर्ण हुए कार्य ({completedTasks.length})</h2>
        {completedTasks.length === 0 ? (
          <p>आपने अभी तक कोई कार्य पूर्ण नहीं किया है।</p>
        ) : (
          completedTasks.map(task => <TaskItem key={task.task_id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default Tasks;