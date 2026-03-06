import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiMenu,
    FiX,
    FiLogOut,
    FiHome,
    FiUsers,
    FiUserPlus,
    FiLock,
    FiBriefcase,
    FiCalendar,
} from 'react-icons/fi';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    if (!isAuthenticated) return null;

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
        ...(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager'
            ? [{ to: '/employees', label: 'Employees', icon: <FiBriefcase /> }]
            : []),
        ...(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager'
            ? [{ to: '/departments', label: 'Departments', icon: <FiBriefcase /> }]
            : []),
        ...(user?.role === 'Admin' || user?.role === 'HR'
            ? [{ to: '/users', label: 'Users', icon: <FiUsers /> }]
            : []),
        ...(user?.role === 'Admin'
            ? [{ to: '/register', label: 'Register User', icon: <FiUserPlus /> }]
            : []),
        ...(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager'
            ? [
                { to: '/attendance/mark', label: 'Mark Attendance', icon: <FiCalendar /> },
                { to: '/attendance/records', label: 'Attendance Records', icon: <FiCalendar /> },
                { to: '/attendance/report', label: 'Monthly Report', icon: <FiCalendar /> },
            ]
            : [{ to: '/attendance/records', label: 'My Attendance', icon: <FiCalendar /> }]),
        { to: '/reset-password', label: 'Change Password', icon: <FiLock /> },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <span className="brand-icon">👥</span>
                    <span className="brand-text">EMS</span>
                </Link>

                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>

                <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                    <div className="nav-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="nav-user">
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                                {user?.role}
                            </span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <FiLogOut />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
