import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    FiClipboard,
    FiCheck,
    FiX,
} from 'react-icons/fi';

const LeaveRequests = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewNote, setReviewNote] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/leaves', { params: { status: 'Pending' } });
            setLeaves(res.data.data);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        setProcessing(true);
        try {
            await axios.put(`/leaves/${id}/status`, { status, reviewNote });
            toast.success(`Leave ${status.toLowerCase()}`);
            setReviewModal(null);
            setReviewNote('');
            fetchLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
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
            <div className="page-header">
                <h1><FiClipboard /> Leave Requests</h1>
                <p>Review and manage pending leave applications</p>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading requests...</p>
                </div>
            ) : leaves.length === 0 ? (
                <div className="empty-card">
                    <FiClipboard className="empty-icon" />
                    <h3>No Pending Requests</h3>
                    <p>All leave requests have been reviewed</p>
                </div>
            ) : (
                <div className="leave-cards">
                    {leaves.map((leave) => (
                        <div key={leave._id} className="leave-request-card">
                            <div className="leave-req-header">
                                <div className="leave-req-employee">
                                    <div className="user-avatar" style={{ background: '#6366f1' }}>
                                        {leave.employee?.firstName?.charAt(0)}{leave.employee?.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4>{leave.employee?.firstName} {leave.employee?.lastName}</h4>
                                        <p>{leave.employee?.department} — {leave.employee?.designation}</p>
                                    </div>
                                </div>
                                <span className={`leave-type-badge ${getTypeClass(leave.leaveType)}`}>
                                    {leave.leaveType}
                                </span>
                            </div>

                            <div className="leave-req-details">
                                <div className="leave-detail">
                                    <span className="leave-detail-label">Dates</span>
                                    <span>
                                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        {' — '}
                                        {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="leave-detail">
                                    <span className="leave-detail-label">Days</span>
                                    <span><strong>{leave.days}</strong> day{leave.days !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="leave-detail">
                                    <span className="leave-detail-label">Reason</span>
                                    <span>{leave.reason}</span>
                                </div>
                                <div className="leave-detail">
                                    <span className="leave-detail-label">Applied</span>
                                    <span>{new Date(leave.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="leave-req-actions">
                                <button
                                    className="btn btn-approve"
                                    onClick={() => handleAction(leave._id, 'Approved')}
                                    disabled={processing}
                                >
                                    <FiCheck /> Approve
                                </button>
                                <button
                                    className="btn btn-reject"
                                    onClick={() => { setReviewModal(leave._id); setReviewNote(''); }}
                                    disabled={processing}
                                >
                                    <FiX /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {reviewModal && (
                <div className="modal-overlay" onClick={() => setReviewModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reject Leave</h2>
                            <button className="modal-close" onClick={() => setReviewModal(null)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Reason for rejection (optional)</label>
                                <textarea
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Provide a reason..."
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
                            <button
                                className="btn btn-reject"
                                onClick={() => handleAction(reviewModal, 'Rejected')}
                                disabled={processing}
                            >
                                {processing ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequests;
