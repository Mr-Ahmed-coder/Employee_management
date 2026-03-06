import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiUsers,
    FiPlus,
    FiSearch,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiFilter,
} from 'react-icons/fi';

const EmployeeList = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departments, setDepartments] = useState([]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (departmentFilter) params.department = departmentFilter;

            const res = await axios.get('/employees', { params });
            setEmployees(res.data.data);

            // Extract unique departments for filter
            const depts = [...new Set(res.data.data.map((e) => e.department))].filter(Boolean);
            setDepartments(depts);
        } catch (error) {
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [statusFilter, departmentFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmployees();
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await axios.delete(`/employees/${id}`);
            toast.success('Employee deleted successfully');
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        }
    };

    const canEdit = user?.role === 'Admin' || user?.role === 'HR';
    const canDelete = user?.role === 'Admin';

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1>
                        <FiUsers /> Employees
                    </h1>
                    <p>Manage all employee records</p>
                </div>
                {canEdit && (
                    <Link to="/employees/add" className="btn btn-primary">
                        <FiPlus /> Add Employee
                    </Link>
                )}
            </div>

            <div className="table-controls">
                <form onSubmit={handleSearch} className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search by name, email, designation..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <div className="filter-group">
                    <div className="filter-item">
                        <FiFilter />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="user-count">
                        Total: <strong>{employees.length}</strong>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading employees...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-state">
                                        No employees found. {canEdit && 'Click "Add Employee" to create one.'}
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp, index) => (
                                    <tr key={emp._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div
                                                    className="user-avatar"
                                                    style={{
                                                        background: emp.status === 'Active' ? '#22c55e' : '#6b7280',
                                                    }}
                                                >
                                                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                </div>
                                                <span>{emp.firstName} {emp.lastName}</span>
                                            </div>
                                        </td>
                                        <td>{emp.email}</td>
                                        <td>{emp.phone}</td>
                                        <td>
                                            <span className="department-badge">{emp.department}</span>
                                        </td>
                                        <td>{emp.designation}</td>
                                        <td>
                                            <span className={`status-badge status-${emp.status.toLowerCase()}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/employees/${emp._id}`}
                                                    className="btn btn-icon btn-view"
                                                    title="View"
                                                >
                                                    <FiEye />
                                                </Link>
                                                {canEdit && (
                                                    <Link
                                                        to={`/employees/${emp._id}/edit`}
                                                        className="btn btn-icon btn-edit"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </Link>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        className="btn btn-icon btn-delete"
                                                        onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)}
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
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

export default EmployeeList;
