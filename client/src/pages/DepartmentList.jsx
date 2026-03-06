import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiBriefcase,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiUsers,
    FiX,
    FiSave,
} from 'react-icons/fi';

const DepartmentList = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const canEdit = user?.role === 'Admin' || user?.role === 'HR';
    const canDelete = user?.role === 'Admin';

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/departments');
            setDepartments(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const openAddModal = () => {
        setEditingDept(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (dept) => {
        setEditingDept(dept);
        setFormData({ name: dept.name, description: dept.description || '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDept(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingDept) {
                await axios.put(`/departments/${editingDept._id}`, formData);
                toast.success('Department updated successfully');
            } else {
                await axios.post('/departments', formData);
                toast.success('Department created successfully');
            }
            closeModal();
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete department "${name}"?`)) return;
        try {
            await axios.delete(`/departments/${id}`);
            toast.success('Department deleted');
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const getCardColor = (index) => {
        const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981'];
        return colors[index % colors.length];
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1><FiBriefcase /> Departments</h1>
                    <p>Manage organization departments</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus /> Add Department
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading departments...</p>
                </div>
            ) : departments.length === 0 ? (
                <div className="empty-card">
                    <FiBriefcase className="empty-icon" />
                    <h3>No Departments Yet</h3>
                    <p>Create your first department to get started</p>
                    {canEdit && (
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <FiPlus /> Create Department
                        </button>
                    )}
                </div>
            ) : (
                <div className="dept-grid">
                    {departments.map((dept, index) => (
                        <div key={dept._id} className="dept-card" style={{ '--dept-color': getCardColor(index) }}>
                            <div className="dept-card-header">
                                <div className="dept-icon" style={{ background: getCardColor(index) }}>
                                    <FiBriefcase />
                                </div>
                                <div className="dept-actions">
                                    {canEdit && (
                                        <button className="btn btn-icon btn-edit" onClick={() => openEditModal(dept)} title="Edit">
                                            <FiEdit2 />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button className="btn btn-icon btn-delete" onClick={() => handleDelete(dept._id, dept.name)} title="Delete">
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="dept-name">{dept.name}</h3>
                            {dept.description && <p className="dept-desc">{dept.description}</p>}

                            <div className="dept-stats">
                                <div className="dept-stat">
                                    <FiUsers />
                                    <span><strong>{dept.employeeCount}</strong> Employee{dept.employeeCount !== 1 ? 's' : ''}</span>
                                </div>
                                {dept.head && (
                                    <div className="dept-stat">
                                        <span className="dept-head-label">Head:</span>
                                        <span>{dept.head.firstName} {dept.head.lastName}</span>
                                    </div>
                                )}
                            </div>

                            <Link to={`/departments/${dept._id}`} className="dept-view-link">
                                View Employees →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingDept ? 'Edit Department' : 'Add Department'}</h2>
                            <button className="modal-close" onClick={closeModal}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="dept-name">Department Name *</label>
                                    <input
                                        type="text"
                                        id="dept-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Engineering"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dept-desc">Description</label>
                                    <textarea
                                        id="dept-desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief department description..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? (
                                        <span className="btn-loading"><span className="spinner-small"></span> Saving...</span>
                                    ) : (
                                        <><FiSave /> {editingDept ? 'Update' : 'Create'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentList;
