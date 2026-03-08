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
    FiFileText,
    FiChevronDown,
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
            ? [
                {
                    label: 'Organization',
                    icon: <FiBriefcase />,
                    subLinks: [
                        { to: '/employees', label: 'Employees' },
                        { to: '/departments', label: 'Departments' },
                    ],
                },
            ]
            : []),
        ...(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager'
            ? [
                {
                    label: 'Attendance',
                    icon: <FiCalendar />,
                    subLinks: [
                        { to: '/attendance/mark', label: 'Mark Attendance' },
                        { to: '/attendance/records', label: 'Attendance Records' },
                        { to: '/attendance/report', label: 'Monthly Report' },
                    ],
                },
            ]
            : [{ to: '/attendance/records', label: 'My Attendance', icon: <FiCalendar /> }]),
        {
            label: 'Leave',
            icon: <FiFileText />,
            subLinks: [
                { to: '/leaves/apply', label: 'Apply Leave' },
                { to: '/leaves/history', label: 'Leave History' },
                ...(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'Manager'
                    ? [{ to: '/leaves/requests', label: 'Leave Requests' }]
                    : []),
            ],
        },
        ...(user?.role === 'Admin' || user?.role === 'HR'
            ? [
                {
                    label: 'Administration',
                    icon: <FiUsers />,
                    subLinks: [
                        { to: '/users', label: 'Manage Users' },
                        ...(user?.role === 'Admin' ? [{ to: '/register', label: 'Register User' }] : []),
                    ],
                },
            ]
            : []),
        { to: '/reset-password', label: 'Password', icon: <FiLock /> },
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
                        {navLinks.map((link, index) => (
                            link.subLinks ? (
                                <div key={index} className="nav-dropdown">
                                    <button className="nav-link nav-dropdown-toggle">
                                        {link.icon}
                                        <span>{link.label}</span>
                                        <FiChevronDown className="dropdown-arrow" />
                                    </button>
                                    <div className="nav-dropdown-menu">
                                        {link.subLinks.map((subLink) => (
                                            <Link
                                                key={subLink.to}
                                                to={subLink.to}
                                                className={`nav-dropdown-item ${isActive(subLink.to) ? 'active' : ''}`}
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {subLink.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            )
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
