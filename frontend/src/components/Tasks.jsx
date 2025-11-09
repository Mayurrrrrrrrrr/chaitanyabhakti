import React, { useState, useEffect, useCallback } from 'react'; // <-- Imported useCallback
import api from '../services/api';
import './Tasks.css';

const Tasks = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [familyTasks, setFamilyTasks] = useState([]);
  const [myFamilies, setMyFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [view, setView] = useState('my'); 
  const [selectedFamilyId, setSelectedFamilyId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // <-- Wrapped in useCallback
  const fetchFamilyTasks = useCallback(async (familyId) => {
    try {
      const res = await api.get(`/tasks/family/${familyId}`);
      setFamilyTasks(res.data.tasks);
    } catch (err) {
      setError('परिवार के कार्य लोड करने में विफल।');
    }
  }, []); // <-- Added dependencies
  
  // <-- Wrapped in useCallback
  const fetchFamilyMembers = useCallback(async (familyId) => {
    try {
      const res = await api.get(`/families/${familyId}`);
      setFamilyMembers(res.data.members);
    } catch (err) {
      console.error('Failed to fetch family members', err);
    }
  }, []); // <-- Added dependencies

  // <-- Wrapped in useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const tasksRes = await api.get('/tasks/my-tasks');
      setMyTasks(tasksRes.data.tasks);

      const familiesRes = await api.get('/families/my-families');
      setMyFamilies(familiesRes.data.families);

      if (familiesRes.data.families.length > 0) {
        const firstFamilyId = familiesRes.data.families[0].family_id;
        setSelectedFamilyId(firstFamilyId);
        // Let the other useEffect handle this
        // fetchFamilyTasks(firstFamilyId); 
        // fetchFamilyMembers(firstFamilyId);
      }
    } catch (err) {
      setError('डेटा लोड करने में विफल।');
    }
    setLoading(false);
  }, []); // <-- Added dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]); // <-- Fixed dependency array

  useEffect(() => {
    if (view === 'family' && selectedFamilyId) {
      fetchFamilyTasks(selectedFamilyId);
    }
    if (showForm && selectedFamilyId) {
        fetchFamilyMembers(selectedFamilyId);
    }
  }, [view, selectedFamilyId, showForm, fetchFamilyTasks, fetchFamilyMembers]); // <-- Added all dependencies

  const handleMarkComplete = async (assignmentId) => {
    try {
      await api.post(`/tasks/${assignmentId}/complete`);
      const tasksRes = await api.get('/tasks/my-tasks');
      setMyTasks(tasksRes.data.tasks);
      if (selectedFamilyId) {
        fetchFamilyTasks(selectedFamilyId); // Also refresh family tasks
      }
    } catch (err) {
      setError('कार्य पूरा करने में विफल।');
    }
  };
  
  const handleFamilySelectChange = (e) => {
    const newFamilyId = e.target.value;
    setSelectedFamilyId(newFamilyId);
    setSelectedMembers([]);
  };
  
  const handleMemberSelect = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  
  const handleCreateTask = async (e) => {
     e.preventDefault();
     setError('');
     
     if (selectedMembers.length === 0) {
        setError('Please assign the task to at least one member.');
        return;
     }
     
     try {
        await api.post('/tasks/create', {
            family_id: selectedFamilyId,
            title: title,
            description: description,
            due_date: dueDate || null,
            assigned_to_users: selectedMembers
        });
        
        setShowForm(false);
        setTitle('');
        setDescription('');
        setDueDate('');
        setSelectedMembers([]);
        fetchFamilyTasks(selectedFamilyId);
        
     } catch(err) {
        setError(err.response?.data?.error || 'Failed to create task.');
     }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
  };
  
  // <-- Removed unused function getAssignmentStatus

  return (
    <div className="task-page">
      <div className="card">
        <h3 className="card-title">🙏 मेरे कार्य</h3>
        <p>अपने परिवार द्वारा सौंपे गए आध्यात्मिक कार्यों पर नज़र रखें।</p>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'फॉर्म बंद करें' : '+ नया कार्य बनाएँ'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleCreateTask} className="form-container">
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label className="form-label">परिवार चुनें</label>
              <select value={selectedFamilyId} onChange={handleFamilySelectChange} className="form-input">
                {myFamilies.map(fam => (
                  <option key={fam.family_id} value={fam.family_id}>{fam.family_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">कार्य का नाम (Title)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="जैसे: 16 माला जप" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">विवरण (Description)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="जैसे: सुबह 7 बजे से पहले" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">अंतिम तिथि (Due Date)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">किसे सौंपें (Assign to)</label>
              <div className="member-select-list">
                {familyMembers.map(member => (
                    <label key={member.user_id} className="member-select-item">
                        <input 
                            type="checkbox"
                            checked={selectedMembers.includes(member.user_id)}
                            onChange={() => handleMemberSelect(member.user_id)}
                        />
                        {member.name}
                    </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-secondary">कार्य बनाएँ</button>
          </form>
        </div>
      )}

      <div className="toggle-group">
        <button onClick={() => setView('my')} className={view === 'my' ? 'active' : ''}>मेरे कार्य ({myTasks.filter(t => t.status === 'pending').length})</button>
        <button onClick={() => setView('family')} className={view === 'family' ? 'active' : ''}>परिवार के कार्य</button>
      </div>

      {loading && <p>लोड हो रहा है...</p>}

      {view === 'my' && (
        <div className="task-list">
          {myTasks.length === 0 && !loading && <p>आपको कोई कार्य नहीं सौंपा गया है।</p>}
          {myTasks.map(task => (
            <div key={task.assignment_id} className={`task-card card ${task.status}`}>
              <div className="task-info">
                <span className="task-family">{task.family_name}</span>
                <h4 className="task-title">{task.title}</h4>
                <p className="task-description">{task.description}</p>
                <span className="task-meta">
                  Due: {formatDate(task.due_date)} | By: {task.created_by_name}
                </span>
              </div>
              <div className="task-actions">
                {task.status === 'pending' ? (
                  <button className="btn-complete" onClick={() => handleMarkComplete(task.assignment_id)}>
                    पूर्ण करें
                  </button>
                ) : (
                  <span className="task-status-badge">✅ पूर्ण</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {view === 'family' && (
         <div className="task-list">
           {familyTasks.length === 0 && !loading && <p>इस परिवार में कोई कार्य नहीं है।</p>}
           {familyTasks.map(task => (
             <div key={task.task_id} className="task-card card">
               <div className="task-info">
                 <span className="task-family">Created by: {task.created_by_name}</span>
                 <h4 className="task-title">{task.title}</h4>
                 <p className="task-description">{task.description}</p>
                 <span className="task-meta">Due: {formatDate(task.due_date)}</span>
                 
                 <div className="assignment-status-list">
                    <strong>Assigned to:</strong>
                    {task.assignments.map(a => (
                        <span key={a.assignment_id} className={`assign-tag ${a.status}`}>
                            {a.name}
                        </span>
                    ))}
                 </div>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
};

export default Tasks;