import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiClipboard,
    FiSearch,
    FiFilter,
} from 'react-icons/fi';

const AttendanceRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Default: show this week
    useEffect(() => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setStartDate(weekAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchRecords();
        }
    }, [startDate, endDate, statusFilter]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (statusFilter) params.status = statusFilter;

            const res = await axios.get('/attendance', { params });
            setRecords(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Present': return 'att-present';
            case 'Absent': return 'att-absent';
            case 'Late': return 'att-late';
            case 'Half-Day': return 'att-halfday';
            default: return '';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiClipboard /> Attendance Records</h1>
                <p>View and filter attendance history</p>
            </div>

            <div className="att-filters">
                <div className="att-filter-group">
                    <label>From:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="att-filter-group">
                    <label>To:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="att-filter-group">
                    <FiFilter />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Half-Day">Half-Day</option>
                    </select>
                </div>
                <div className="user-count">
                    Total: <strong>{records.length}</strong> records
                </div>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading records...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">No attendance records found for the selected filters.</td>
                                </tr>
                            ) : (
                                records.map((rec, index) => (
                                    <tr key={rec._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                        <td>
                                            {rec.employee ? (
                                                <div className="user-cell">
                                                    <div className="user-avatar" style={{ background: '#6366f1' }}>
                                                        {rec.employee.firstName?.charAt(0)}{rec.employee.lastName?.charAt(0)}
                                                    </div>
                                                    <span>{rec.employee.firstName} {rec.employee.lastName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">Deleted Employee</span>
                                            )}
                                        </td>
                                        <td>
                                            {rec.employee?.department && (
                                                <span className="department-badge">{rec.employee.department}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(rec.status)}`}>
                                                {rec.status}
                                            </span>
                                        </td>
                                        <td>{rec.checkIn || '-'}</td>
                                        <td>{rec.checkOut || '-'}</td>
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

export default AttendanceRecords;
