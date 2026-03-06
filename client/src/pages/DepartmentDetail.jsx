import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiArrowLeft,
    FiBriefcase,
    FiUsers,
    FiEye,
    FiEdit2,
} from 'react-icons/fi';

const DepartmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [department, setDepartment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, empRes] = await Promise.all([
                    axios.get(`/departments/${id}`),
                    axios.get(`/departments/${id}/employees`),
                ]);
                setDepartment(deptRes.data.data);
                setEmployees(empRes.data.data);
            } catch (error) {
                toast.error('Failed to load department');
                navigate('/departments');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const canEdit = user?.role === 'Admin' || user?.role === 'HR';

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading department...</p>
            </div>
        );
    }

    if (!department) return null;

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-back" onClick={() => navigate('/departments')}>
                    <FiArrowLeft /> Back to Departments
                </button>
            </div>

            {/* Department Info Card */}
            <div className="dept-detail-header">
                <div className="dept-detail-icon">
                    <FiBriefcase />
                </div>
                <div className="dept-detail-info">
                    <h1>{department.name}</h1>
                    {department.description && <p>{department.description}</p>}
                    <div className="dept-detail-meta">
                        <span className="department-badge">
                            <FiUsers /> {department.employeeCount} Employee{department.employeeCount !== 1 ? 's' : ''}
                        </span>
                        {department.head && (
                            <span className="dept-head-badge">
                                Head: {department.head.firstName} {department.head.lastName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Employee List */}
            <div className="dept-employees-section">
                <h2><FiUsers /> Employees in {department.name}</h2>

                {employees.length === 0 ? (
                    <div className="empty-card" style={{ marginTop: '16px' }}>
                        <p>No employees assigned to this department yet.</p>
                        {canEdit && (
                            <Link to="/employees/add" className="btn btn-primary" style={{ marginTop: '12px' }}>
                                Add Employee
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="table-wrapper" style={{ marginTop: '16px' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Designation</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, index) => (
                                    <tr key={emp._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar" style={{ background: emp.status === 'Active' ? '#22c55e' : '#6b7280' }}>
                                                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                </div>
                                                <span>{emp.firstName} {emp.lastName}</span>
                                            </div>
                                        </td>
                                        <td>{emp.email}</td>
                                        <td>{emp.designation}</td>
                                        <td>
                                            <span className={`status-badge status-${emp.status.toLowerCase()}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/employees/${emp._id}`} className="btn btn-icon btn-view" title="View">
                                                    <FiEye />
                                                </Link>
                                                {canEdit && (
                                                    <Link to={`/employees/${emp._id}/edit`} className="btn btn-icon btn-edit" title="Edit">
                                                        <FiEdit2 />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentDetail;
