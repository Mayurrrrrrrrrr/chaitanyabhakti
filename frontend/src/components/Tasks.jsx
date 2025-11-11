// frontend/src/components/Tasks.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Tasks.css'; //

const Tasks = () => {
  const { user } = useAuth();
  
  // 🛑 FIX: Initialize all state to empty arrays [] to prevent crashes
  const [families, setFamilies] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Step 1: Fetch the user's families to create the tabs
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const res = await api.get('/families');
        setFamilies(res.data);
        if (res.data && res.data.length > 0) {
          setSelectedFamily(res.data[0].family_id);
        } else {
          setLoading(false); 
        }
      } catch (err) {
        setError('Failed to load families.');
        setLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  // Step 2: Fetch tasks *after* a family has been selected
  useEffect(() => {
    if (!selectedFamily) {
      return; 
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tasks/${selectedFamily}`);
        setTasks(res.data);
      } catch (err) {
        setError('Failed to load tasks for this family.');
        setTasks([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [selectedFamily]); 

  const handleCompleteTask = async (assignment) => {
    if (!assignment) {
      setError('Cannot complete task: no assignment found for you.');
      return;
    }
    
    try {
      await api.put(`/tasks/assignment/${assignment.assignment_id}`, {
        status: 'completed'
      });
      // Refresh tasks
      const res = await api.get(`/tasks/${selectedFamily}`);
      setTasks(res.data);
    } catch (err) {
      setError('Failed to update task status.');
    }
  };
  
  const getMyAssignment = (task) => {
    // 🛑 SAFETY CHECK: Ensure task.assignments exists before finding
    if (!task || !task.assignments) return null;
    return task.assignments.find(a => a.assigned_to_user_id === user.id);
  };

  return (
    <div className="tasks-container">
      <h2>My Tasks</h2>

      <div className="task-families-nav">
        {families.map(family => (
          <button
            key={family.family_id}
            className={`family-tab ${selectedFamily === family.family_id ? 'active' : ''}`}
            onClick={() => setSelectedFamily(family.family_id)}
          >
            {family.family_name}
          </button>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading tasks...</p>}
      {!loading && tasks.length === 0 && (
        <p>No tasks found for this family.</p>
      )}

      <ul className="task-list">
        {/* 🛑 SAFETY CHECK: Ensure tasks is an array before mapping */}
        {Array.isArray(tasks) && tasks.map(task => {
          const myAssignment = getMyAssignment(task);
          const myStatus = myAssignment ? myAssignment.status : 'not_assigned';

          return (
            <li key={task.task_id} className="task-item">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`task-status ${myStatus}`}>
                  {myStatus.replace('_', ' ')}
                </span>
              </div>
              <p>{task.description}</p>
              <div className="task-meta">
                <span>By: {task.created_by_name}</span>
                {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
              </div>
              {myAssignment && myStatus === 'pending' && (
                <div className="task-actions">
                  <button onClick={() => handleCompleteTask(myAssignment)}>
                    Mark as Completed
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Tasks;