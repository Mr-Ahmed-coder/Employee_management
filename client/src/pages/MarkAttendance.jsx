import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiCalendar,
    FiCheck,
    FiSave,
} from 'react-icons/fi';

const MarkAttendance = () => {
    const { user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch active employees
            const empRes = await axios.get('/employees', { params: { status: 'Active' } });
            setEmployees(empRes.data.data);

            // Fetch existing attendance for this date
            const attRes = await axios.get(`/attendance/date/${date}`);
            const existingAtt = {};
            attRes.data.data.forEach((rec) => {
                existingAtt[rec.employee._id] = {
                    status: rec.status,
                    checkIn: rec.checkIn || '',
                    checkOut: rec.checkOut || '',
                };
            });
            setAttendance(existingAtt);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (empId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [empId]: { ...prev[empId], status },
        }));
    };

    const handleTimeChange = (empId, field, value) => {
        setAttendance((prev) => ({
            ...prev,
            [empId]: { ...prev[empId], [field]: value },
        }));
    };

    const handleSubmit = async () => {
        const records = Object.entries(attendance)
            .filter(([, val]) => val.status)
            .map(([empId, val]) => ({
                employee: empId,
                status: val.status,
                checkIn: val.checkIn || '',
                checkOut: val.checkOut || '',
            }));

        if (records.length === 0) {
            toast.warning('Please mark at least one employee\'s attendance');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/attendance/bulk', { date, records });
            toast.success(`Attendance saved for ${records.length} employee(s)`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const markAll = (status) => {
        const newAtt = {};
        employees.forEach((emp) => {
            newAtt[emp._id] = {
                ...attendance[emp._id],
                status,
            };
        });
        setAttendance(newAtt);
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1><FiCalendar /> Mark Attendance</h1>
                    <p>Record daily attendance for employees</p>
                </div>
                <div className="att-date-picker">
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="att-quick-actions">
                <span>Quick Mark:</span>
                <button className="btn btn-sm att-btn-present" onClick={() => markAll('Present')}>All Present</button>
                <button className="btn btn-sm att-btn-absent" onClick={() => markAll('Absent')}>All Absent</button>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading employees...</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">No active employees found.</td>
                                    </tr>
                                ) : (
                                    employees.map((emp, index) => (
                                        <tr key={emp._id} className={getStatusClass(attendance[emp._id]?.status)}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar" style={{ background: '#6366f1' }}>
                                                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                    </div>
                                                    <span>{emp.firstName} {emp.lastName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="department-badge">{emp.department}</span>
                                            </td>
                                            <td>
                                                <select
                                                    className={`att-status-select ${getStatusClass(attendance[emp._id]?.status)}`}
                                                    value={attendance[emp._id]?.status || ''}
                                                    onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                                                >
                                                    <option value="">-- Select --</option>
                                                    <option value="Present">Present</option>
                                                    <option value="Absent">Absent</option>
                                                    <option value="Late">Late</option>
                                                    <option value="Half-Day">Half-Day</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="time"
                                                    className="att-time-input"
                                                    value={attendance[emp._id]?.checkIn || ''}
                                                    onChange={(e) => handleTimeChange(emp._id, 'checkIn', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="time"
                                                    className="att-time-input"
                                                    value={attendance[emp._id]?.checkOut || ''}
                                                    onChange={(e) => handleTimeChange(emp._id, 'checkOut', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="att-submit-bar">
                        <div className="att-summary">
                            <span className="att-pill att-present">{Object.values(attendance).filter(a => a.status === 'Present').length} Present</span>
                            <span className="att-pill att-absent">{Object.values(attendance).filter(a => a.status === 'Absent').length} Absent</span>
                            <span className="att-pill att-late">{Object.values(attendance).filter(a => a.status === 'Late').length} Late</span>
                            <span className="att-pill att-halfday">{Object.values(attendance).filter(a => a.status === 'Half-Day').length} Half-Day</span>
                        </div>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? (
                                <span className="btn-loading"><span className="spinner-small"></span> Saving...</span>
                            ) : (
                                <><FiSave /> Save Attendance</>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MarkAttendance;
