import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiBarChart2,
} from 'react-icons/fi';

const MonthlyReport = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [report, setReport] = useState([]);
    const [totalDays, setTotalDays] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/attendance/report/monthly', {
                params: { month, year },
            });
            setReport(res.data.data);
            setTotalDays(res.data.totalDays);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const getYears = () => {
        const years = [];
        for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
            years.push(y);
        }
        return years;
    };

    const totalPresent = report.reduce((sum, r) => sum + r.stats.present, 0);
    const totalAbsent = report.reduce((sum, r) => sum + r.stats.absent, 0);
    const totalLate = report.reduce((sum, r) => sum + r.stats.late, 0);
    const totalHalfDay = report.reduce((sum, r) => sum + r.stats.halfDay, 0);

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1><FiBarChart2 /> Monthly Report</h1>
                    <p>Attendance summary for {months[month - 1]} {year}</p>
                </div>
                <div className="att-filters" style={{ marginBottom: 0 }}>
                    <div className="att-filter-group">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="att-filter-group">
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            {getYears().map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="report-summary">
                <div className="report-card report-total">
                    <span className="report-number">{report.length}</span>
                    <span className="report-label">Employees</span>
                </div>
                <div className="report-card report-present">
                    <span className="report-number">{totalPresent}</span>
                    <span className="report-label">Present</span>
                </div>
                <div className="report-card report-absent">
                    <span className="report-number">{totalAbsent}</span>
                    <span className="report-label">Absent</span>
                </div>
                <div className="report-card report-late-card">
                    <span className="report-number">{totalLate}</span>
                    <span className="report-label">Late</span>
                </div>
                <div className="report-card report-halfday">
                    <span className="report-number">{totalHalfDay}</span>
                    <span className="report-label">Half-Day</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading report...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th style={{ textAlign: 'center' }}>Present</th>
                                <th style={{ textAlign: 'center' }}>Absent</th>
                                <th style={{ textAlign: 'center' }}>Late</th>
                                <th style={{ textAlign: 'center' }}>Half-Day</th>
                                <th style={{ textAlign: 'center' }}>Total</th>
                                <th style={{ textAlign: 'center' }}>Attendance %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="empty-state">No employees found.</td>
                                </tr>
                            ) : (
                                report.map((item, index) => {
                                    const percentage = totalDays > 0
                                        ? Math.round(((item.stats.present + item.stats.late + item.stats.halfDay * 0.5) / totalDays) * 100)
                                        : 0;

                                    return (
                                        <tr key={item.employee._id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar" style={{ background: '#6366f1' }}>
                                                        {item.employee.firstName?.charAt(0)}{item.employee.lastName?.charAt(0)}
                                                    </div>
                                                    <span>{item.employee.firstName} {item.employee.lastName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="department-badge">{item.employee.department}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="att-count att-present">{item.stats.present}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="att-count att-absent">{item.stats.absent}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="att-count att-late">{item.stats.late}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="att-count att-halfday">{item.stats.halfDay}</span>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                                {item.stats.total}/{totalDays}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="att-percentage-bar">
                                                    <div className="att-percentage-fill" style={{ width: `${percentage}%` }}></div>
                                                    <span className="att-percentage-text">{percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MonthlyReport;
