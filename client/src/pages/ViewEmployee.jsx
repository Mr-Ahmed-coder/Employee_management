import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiCalendar,
    FiDollarSign,
    FiUser,
} from 'react-icons/fi';

const ViewEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await axios.get(`/employees/${id}`);
                setEmployee(res.data.data);
            } catch (error) {
                toast.error('Failed to load employee');
                navigate('/employees');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${employee.firstName} ${employee.lastName}"?`)) return;
        try {
            await axios.delete(`/employees/${id}`);
            toast.success('Employee deleted');
            navigate('/employees');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const canEdit = user?.role === 'Admin' || user?.role === 'HR';
    const canDelete = user?.role === 'Admin';

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading employee...</p>
            </div>
        );
    }

    if (!employee) return null;

    const address = [
        employee.address?.street,
        employee.address?.city,
        employee.address?.state,
        employee.address?.zipCode,
        employee.address?.country,
    ].filter(Boolean).join(', ');

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-back" onClick={() => navigate('/employees')}>
                    <FiArrowLeft /> Back to Employees
                </button>
            </div>

            <div className="employee-profile">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar" style={{ background: employee.status === 'Active' ? '#22c55e' : '#6b7280' }}>
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div className="profile-info">
                        <h1>{employee.firstName} {employee.lastName}</h1>
                        <p className="profile-designation">{employee.designation}</p>
                        <div className="profile-badges">
                            <span className="department-badge">{employee.department}</span>
                            <span className={`status-badge status-${employee.status.toLowerCase()}`}>
                                {employee.status}
                            </span>
                        </div>
                    </div>
                    <div className="profile-actions">
                        {canEdit && (
                            <Link to={`/employees/${id}/edit`} className="btn btn-primary">
                                <FiEdit2 /> Edit
                            </Link>
                        )}
                        {canDelete && (
                            <button className="btn btn-danger" onClick={handleDelete}>
                                <FiTrash2 /> Delete
                            </button>
                        )}
                    </div>
                </div>

                {/* Detail Cards */}
                <div className="profile-grid">
                    {/* Personal Info */}
                    <div className="detail-card">
                        <h3><FiUser /> Personal Information</h3>
                        <div className="detail-list">
                            <div className="detail-item">
                                <span className="detail-label"><FiMail /> Email</span>
                                <span className="detail-value">{employee.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label"><FiPhone /> Phone</span>
                                <span className="detail-value">{employee.phone}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label"><FiMapPin /> Address</span>
                                <span className="detail-value">{address || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Info */}
                    <div className="detail-card">
                        <h3><FiBriefcase /> Job Information</h3>
                        <div className="detail-list">
                            <div className="detail-item">
                                <span className="detail-label"><FiBriefcase /> Designation</span>
                                <span className="detail-value">{employee.designation}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label"><FiBriefcase /> Department</span>
                                <span className="detail-value">{employee.department}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label"><FiCalendar /> Joining Date</span>
                                <span className="detail-value">
                                    {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label"><FiDollarSign /> Salary</span>
                                <span className="detail-value salary-value">
                                    ${employee.salary?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="profile-meta">
                    <span>Created: {new Date(employee.createdAt).toLocaleDateString()}</span>
                    <span>Last Updated: {new Date(employee.updatedAt).toLocaleDateString()}</span>
                    {employee.createdBy && <span>Created by: {employee.createdBy.name}</span>}
                </div>
            </div>
        </div>
    );
};

export default ViewEmployee;
