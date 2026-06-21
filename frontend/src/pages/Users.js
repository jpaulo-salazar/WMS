import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'staff'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editUser) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/users/${editUser.id}`, updateData);
                toast.success('User updated successfully');
            } else {
                await api.post('/users/', formData);
                toast.success('User created successfully');
            }
            setShowModal(false);
            setEditUser(null);
            setFormData({ username: '', password: '', full_name: '', role: 'staff' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setFormData({
            username: user.username,
            password: '',
            full_name: user.full_name,
            role: user.role
        });
        setShowModal(true);
    };

    const handleDeactivate = async (userId) => {
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                toast.success('User deactivated');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to deactivate user');
            }
        }
    };

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <h1>User Management</h1>
                    <button onClick={() => { setEditUser(null); setFormData({ username: '', password: '', full_name: '', role: 'staff' }); setShowModal(true); }} className="btn-primary">
                        + Add User
                    </button>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.full_name}</td>
                                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                                    <td><span className={`badge badge-${user.is_active ? 'active' : 'inactive'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleEdit(user)} className="btn-sm btn-edit">Edit</button>
                                        {user.is_active && (
                                            <button onClick={() => handleDeactivate(user.id)} className="btn-sm btn-delete">Deactivate</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>{editUser ? 'Edit User' : 'Create User'}</h2>
                                <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Password {editUser && '(leave blank to keep current)'}</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editUser} />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary">{editUser ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
