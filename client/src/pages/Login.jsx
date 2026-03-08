import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            toast.success(result.message || 'Login successful!');
            navigate('/dashboard');
        } catch (error) {
            const message =
                error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-branding">
                        <div className="brand-logo">👥</div>
                        <h1>System shaqaalaha lagu talo galay</h1>
                        <p>Si Fudud ugu maare shaqaalaha shirkadaaada</p>
                        <div className="auth-features">
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>Security aad fiican uleh</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">👤</span>
                                <span>Kala madax banaan maamulaha Iyo shaqaalaha </span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>Dashboard Modern ah leh</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📋</span>
                                <span>Complete Management</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h2>Soo dhawoow</h2>
                            <p>Account kaaga geli si aad gudaha hore u sii gashid</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">
                                    <FiMail /> Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <FiLock /> Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="btn-loading">
                                        <span className="spinner-small"></span> Signing in...
                                    </span>
                                ) : (
                                    <>
                                        <FiLogIn /> Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                Forgot your password?{' '}
                                <Link to="/reset-password">Reset it here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
