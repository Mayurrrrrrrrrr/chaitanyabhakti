// frontend/src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserManagement.css'; // Ensure this CSS file exists

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
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Backend: router.get('/users') mounted at /api/admin
      const res = await api.get('/admin/users'); 
      setUsers(res.data);
      setError('');
    } catch (err) {
      console.error("Fetch users error:", err);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
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
    setSuccessMsg('');
    
    try {
      // Backend: Requires a POST /users route in admin.js
      await api.post('/admin/users', formData);
      setSuccessMsg(`User "${formData.name}" created successfully!`);
      setFormData({ name: '', mobile_number: '', password: '', spiritual_name: '' }); 
      fetchUsers();
    } catch (err) {
      console.error("Create user error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleDeactivate = async (userId) => {
    if(!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      // Backend: Requires PUT /users/:id/deactivate route in admin.js
      await api.put(`/admin/users/${userId}/deactivate`);
      fetchUsers();
      setSuccessMsg('User status updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleReactivate = async (userId) => {
    try {
       // Backend: Requires PUT /users/:id/reactivate route in admin.js
      await api.put(`/admin/users/${userId}/reactivate`);
      fetchUsers();
      setSuccessMsg('User status updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  return (
    <div className="user-management-container">
      <h2>Manage Users</h2>
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}

      <div className="create-user-section">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser} className="user-form">
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
          <button type="submit" className="btn-create">Create User</button>
        </form>
      </div>

      <div className="user-list-section">
        <h3>Existing Users ({users.length})</h3>
        {loading ? <p>Loading users...</p> : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    {user.name} 
                    {user.spiritual_name && <span className="spiritual-name"> ({user.spiritual_name})</span>}
                  </td>
                  <td>{user.mobile_number}</td>
                  <td>{user.is_super_admin ? 'Admin' : 'User'}</td>
                  <td>{user.is_active === 0 ? 'Inactive' : 'Active'}</td>
                  <td>
                    {!user.is_super_admin && (
                      user.is_active !== 0 ? (
                        <button className="btn-deactivate" onClick={() => handleDeactivate(user.user_id)}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="btn-reactivate" onClick={() => handleReactivate(user.user_id)}>
                          Reactivate
                        </button>
                      )
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