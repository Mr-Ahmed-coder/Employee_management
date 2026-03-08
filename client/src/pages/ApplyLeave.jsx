import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiClipboard,
    FiSave,
    FiArrowLeft,
} from 'react-icons/fi';

const ApplyLeave = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [balance, setBalance] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        employee: '',
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const isManager = user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager';

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                if (isManager) {
                    const res = await axios.get('/employees', { params: { status: 'Active' } });
                    setEmployees(res.data.data);
                } else {
                    // Employee: find own employee record
                    const res = await axios.get('/employees/me');
                    const emp = res.data.data;
                    setEmployees([emp]);
                    setFormData((prev) => ({ ...prev, employee: emp._id }));
                }
            } catch (error) {
                toast.error('Failed to load employees');
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (formData.employee) {
            fetchBalance(formData.employee);
        }
    }, [formData.employee]);

    const fetchBalance = async (empId) => {
        try {
            const res = await axios.get(`/leaves/balance/${empId}`);
            setBalance(res.data.data);
        } catch (error) {
            setBalance(null);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        let count = 0;
        const current = new Date(start);
        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) count++;
            current.setDate(current.getDate() + 1);
        }
        return count || 1;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.employee) {
            toast.warning('Please select an employee');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/leaves', formData);
            toast.success('Leave applied successfully!');
            navigate('/leaves/history');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply leave');
        } finally {
            setSubmitting(false);
        }
    };

    const days = calculateDays();

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-back" onClick={() => navigate('/leaves/history')}>
                    <FiArrowLeft /> Back to Leave History
                </button>
                <h1><FiClipboard /> Apply for Leave</h1>
                <p>Submit a new leave request</p>
            </div>

            {/* Leave Balance Card */}
            {balance && (
                <div className="leave-balance-grid">
                    {['Sick', 'Casual', 'Annual'].map((type) => (
                        <div key={type} className={`balance-card balance-${type.toLowerCase()}`}>
                            <h4>{type} Leave</h4>
                            <div className="balance-numbers">
                                <span className="balance-remaining">{balance[type]?.remaining ?? 0}</span>
                                <span className="balance-total">/ {balance[type]?.total ?? 0}</span>
                            </div>
                            <div className="balance-bar">
                                <div
                                    className="balance-bar-fill"
                                    style={{
                                        width: `${((balance[type]?.remaining ?? 0) / (balance[type]?.total || 1)) * 100}%`,
                                    }}
                                ></div>
                            </div>
                            <span className="balance-used">{balance[type]?.used ?? 0} used</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        {isManager && (
                            <div className="form-group">
                                <label htmlFor="leave-employee">Employee *</label>
                                <select
                                    id="leave-employee"
                                    name="employee"
                                    value={formData.employee}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} — {emp.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="leave-type">Leave Type *</label>
                            <select
                                id="leave-type"
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                required
                            >
                                <option value="Casual">Casual Leave</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Annual">Annual Leave</option>
                                <option value="Unpaid">Unpaid Leave</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="leave-start">Start Date *</label>
                                <input
                                    type="date"
                                    id="leave-start"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="leave-end">End Date *</label>
                                <input
                                    type="date"
                                    id="leave-end"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    min={formData.startDate}
                                    required
                                />
                            </div>
                        </div>

                        {days > 0 && (
                            <div className="leave-days-info">
                                📅 Total: <strong>{days}</strong> working day{days !== 1 ? 's' : ''}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="leave-reason">Reason *</label>
                            <textarea
                                id="leave-reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Please provide a reason for your leave..."
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                        {submitting ? (
                            <span className="btn-loading"><span className="spinner-small"></span> Submitting...</span>
                        ) : (
                            <><FiSave /> Submit Leave Request</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeave;
