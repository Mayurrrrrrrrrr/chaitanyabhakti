// frontend/src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    password: '',
    spiritual_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all users on component load
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 🛑 FIX: Removed '/api' from this path
      const res = await api.get('/admin/users'); 
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // 🛑 FIX: Removed '/api' from this path
      await api.post('/admin/users', formData);
      setMessage(`User "${formData.name}" created successfully!`);
      setFormData({ name: '', mobile_number: '', password: '', spiritual_name: '' }); // Reset form
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      // 🛑 FIX: Removed '/api' from this path
      await api.put(`/admin/users/${userId}/deactivate`);
      fetchUsers();
    } catch (err) {
      setError('Failed to deactivate user.');
    }
  };

  const handleReactivate = async (userId) => {
    try {
      // 🛑 FIX: Removed '/api' from this path
      await api.put(`/admin/users/${userId}/reactivate`);
      fetchUsers();
    } catch (err) {
      setError('Failed to reactivate user.');
    }
  };

  return (
    <div className="user-management">
      <h2>Manage Users</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="create-user-form">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
          />
          <input
            type="tel"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <input
            type="text"
            name="spiritual_name"
            value={formData.spiritual_name}
            onChange={handleChange}
            placeholder="Spiritual Name (Optional)"
          />
          <button type="submit">Create User</button>
        </form>
      </div>

      <div className="user-list">
        <h3>Existing Users ({users.length})</h3>
        {loading ? <p>Loading users...</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.name} ({user.spiritual_name})</td>
                  <td>{user.mobile_number}</td>
                  <td>{user.is_active ? 'Active' : 'Deactivated'}</td>
                  <td>
                    {user.is_active ? (
                      <button className="btn-deactivate" onClick={() => handleDeactivate(user.user_id)}>
                        Deactivate
                      </button>
                    ) : (
                      <button className="btn-reactivate" onClick={() => handleReactivate(user.user_id)}>
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;