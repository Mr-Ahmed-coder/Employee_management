import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (roles && !roles.includes(user?.role)) {
        return (
            <div className="access-denied">
                <div className="access-denied-card">
                    <h2>🚫 Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                    <p>Your role: <strong>{user?.role}</strong></p>
                    <p>Required roles: <strong>{roles.join(', ')}</strong></p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
