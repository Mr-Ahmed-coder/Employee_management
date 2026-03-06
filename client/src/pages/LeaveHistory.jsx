import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiClipboard,
    FiPlus,
    FiFilter,
} from 'react-icons/fi';

const LeaveHistory = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, [statusFilter, typeFilter]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.leaveType = typeFilter;

            const res = await axios.get('/leaves', { params });
            setLeaves(res.data.data);
        } catch (error) {
            toast.error('Failed to load leave history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Approved': return 'leave-approved';
            case 'Rejected': return 'leave-rejected';
            case 'Pending': return 'leave-pending';
            default: return '';
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'Sick': return 'leave-sick';
            case 'Casual': return 'leave-casual';
            case 'Annual': return 'leave-annual';
            case 'Unpaid': return 'leave-unpaid';
            default: return '';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1><FiClipboard /> Leave History</h1>
                    <p>View all leave records</p>
                </div>
                <Link to="/leaves/apply" className="btn btn-primary">
                    <FiPlus /> Apply Leave
                </Link>
            </div>

            <div className="att-filters">
                <div className="att-filter-group">
                    <FiFilter />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div className="att-filter-group">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="Sick">Sick</option>
                        <option value="Casual">Casual</option>
                        <option value="Annual">Annual</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>
                <div className="user-count">
                    Total: <strong>{leaves.length}</strong> records
                </div>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                {(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager') && <th>Employee</th>}
                                <th>Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Reviewed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="empty-state">No leave records found.</td>
                                </tr>
                            ) : (
                                leaves.map((leave, index) => (
                                    <tr key={leave._id}>
                                        <td>{index + 1}</td>
                                        {(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager') && (
                                            <td>
                                                {leave.employee ? (
                                                    <div className="user-cell">
                                                        <div className="user-avatar" style={{ background: '#6366f1' }}>
                                                            {leave.employee.firstName?.charAt(0)}{leave.employee.lastName?.charAt(0)}
                                                        </div>
                                                        <span>{leave.employee.firstName} {leave.employee.lastName}</span>
                                                    </div>
                                                ) : (
                                                    <span>—</span>
                                                )}
                                            </td>
                                        )}
                                        <td>
                                            <span className={`leave-type-badge ${getTypeClass(leave.leaveType)}`}>
                                                {leave.leaveType}
                                            </span>
                                        </td>
                                        <td>{new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td>{new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td><strong>{leave.days}</strong></td>
                                        <td style={{ maxWidth: '200px' }}>
                                            <span className="leave-reason-text">{leave.reason}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td>
                                            {leave.reviewedBy ? (
                                                <div>
                                                    <span>{leave.reviewedBy.name}</span>
                                                    {leave.reviewNote && (
                                                        <p className="review-note">"{leave.reviewNote}"</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                            )}
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

export default LeaveHistory;
