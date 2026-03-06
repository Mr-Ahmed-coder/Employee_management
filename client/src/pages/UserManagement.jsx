import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUsers, FiShield, FiTrash2, FiSearch } from 'react-icons/fi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/users');
            setUsers(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/users/${userId}/role`, { role: newRole });
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }

        try {
            await axios.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.role.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return '#ef4444';
            case 'HR': return '#8b5cf6';
            case 'Manager': return '#f59e0b';
            case 'Employee': return '#22c55e';
            default: return '#6b7280';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>
                    <FiUsers /> User Management
                </h1>
                <p>View and manage all users in the system</p>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="user-count">
                    Total: <strong>{filteredUsers.length}</strong> users
                </div>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div
                                                    className="user-avatar"
                                                    style={{ background: getRoleColor(user.role) }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(user._id, e.target.value)
                                                }
                                                className="role-select"
                                                style={{
                                                    borderColor: getRoleColor(user.role),
                                                    color: getRoleColor(user.role),
                                                }}
                                            >
                                                <option value="Employee">Employee</option>
                                                <option value="Manager">Manager</option>
                                                <option value="HR">HR</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(user._id, user.name)}
                                                title="Delete user"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
