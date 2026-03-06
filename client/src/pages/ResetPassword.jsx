import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiLock, FiShield, FiSave } from 'react-icons/fi';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword, isAuthenticated } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetPassword(
                formData.currentPassword,
                formData.newPassword
            );
            toast.success(result.message || 'Password updated successfully!');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error) {
            const message =
                error.response?.data?.message || 'Password reset failed.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <div className="form-card">
                    <p>Please login first to reset your password.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>
                    <FiShield /> Change Password
                </h1>
                <p>Update your account password for better security</p>
            </div>

            <div className="form-card" style={{ maxWidth: '500px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">
                            <FiLock /> Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">
                            <FiLock /> New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">
                            <FiLock /> Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="btn-loading">
                                <span className="spinner-small"></span> Updating...
                            </span>
                        ) : (
                            <>
                                <FiSave /> Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
