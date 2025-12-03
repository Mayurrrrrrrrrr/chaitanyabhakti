// frontend/src/components/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiTrash2, FiCalendar } from 'react-icons/fi';
import api from '../utils/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await api.post('/tasks', {
        title: newTask,
        due_date: new Date().toISOString().split('T')[0] // Default to today
      });
      setTasks([res.data, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Add task error:', error);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t =>
        t.task_id === taskId ? { ...t, completed: !currentStatus } : t
      ));

      await api.put(`/tasks/${taskId}`, {
        completed: !currentStatus
      });
    } catch (error) {
      console.error('Toggle task error:', error);
      fetchTasks(); // Revert on error
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.task_id !== taskId));
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-heading">My Tasks</h1>
          <p className="text-gray-500 mt-1">Manage your daily spiritual services</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-saffron-600">
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Completed</p>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="w-full pl-6 pr-14 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-saffron-500 outline-none text-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 w-12 bg-saffron-500 text-white rounded-xl flex items-center justify-center hover:bg-saffron-600 transition-colors shadow-md"
        >
          <FiPlus size={24} />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No tasks yet. Add one above!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.task_id}
              className={`
                group flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all duration-200
                ${task.completed ? 'border-green-100 bg-green-50/30' : 'border-gray-100 hover:border-saffron-200 hover:shadow-sm'}
              `}
            >
              <button
                onClick={() => toggleTask(task.task_id, task.completed)}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-transparent hover:border-saffron-500'
                  }
                `}
              >
                <FiCheck size={14} />
              </button>

              <div className="flex-1">
                <p className={`text-lg transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <FiCalendar size={10} />
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => deleteTask(task.task_id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <FiTrash2 />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;