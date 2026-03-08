import { useAuth } from '../context/AuthContext';
import {
    FiUsers,
    FiUserPlus,
    FiCalendar,
    FiClipboard,
    FiClock,
    FiBarChart2,
    FiShield,
    FiBriefcase,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const adminCards = [
        {
            title: 'User Management',
            description: 'Manage user accounts and roles',
            icon: <FiUsers />,
            link: '/users',
            color: '#6366f1',
        },
        {
            title: 'Employees',
            description: 'Manage employee profiles',
            icon: <FiBriefcase />,
            link: '/employees',
            color: '#10b981',
        },
        {
            title: 'Register User',
            description: 'Add new users to the system',
            icon: <FiUserPlus />,
            link: '/register',
            color: '#22c55e',
        },
        {
            title: 'Departments',
            description: 'Manage departments',
            icon: <FiBriefcase />,
            link: '/departments',
            color: '#f59e0b',
        },
        {
            title: 'Attendance',
            description: 'Mark & view attendance',
            icon: <FiCalendar />,
            link: '/attendance/mark',
            color: '#ec4899',
        },
        // {
        //     title: 'Leave Requests',
        //     description: 'Manage leave applications',
        //     icon: <FiClipboard />,
        //     link: '#',
        //     color: '#8b5cf6',
        //     disabled: true,
        // },
        // {
        //     title: 'Reports',
        //     description: 'View system reports',
        //     icon: <FiBarChart2 />,
        //     link: '#',
        //     color: '#06b6d4',
        //     disabled: true,
        // },
    ];

    const employeeCards = [
        {
            title: 'My Profile',
            description: 'View and edit your profile',
            icon: <FiUsers />,
            link: '#',
            color: '#6366f1',
            disabled: true,
        },
        {
            title: 'My Attendance',
            description: 'View your attendance',
            icon: <FiClock />,
            link: '/attendance/records',
            color: '#22c55e',
        },
        {
            title: 'Leave Request',
            description: 'Apply for leave',
            icon: <FiClipboard />,
            link: '#',
            color: '#f59e0b',
            disabled: true,
        },
        {
            title: 'Change Password',
            description: 'Update your password',
            icon: <FiShield />,
            link: '/reset-password',
            color: '#ec4899',
        },
    ];

    const getCards = () => {
        switch (user?.role) {
            case 'Admin':
                return adminCards;
            case 'HR':
                return adminCards.filter(
                    (c) => c.title !== 'Register User'
                );
            case 'Manager':
                return [
                    {
                        title: 'Employees',
                        description: 'View employee profiles',
                        icon: <FiBriefcase />,
                        link: '/employees',
                        color: '#10b981',
                    },
                    ...employeeCards,
                ];
            default:
                return employeeCards;
        }
    };

    return (
        <div className="page-container">
            <div className="dashboard-welcome">
                <div className="welcome-text">
                    <h1>
                        {getGreeting()}, <span className="highlight">{user?.name}</span>! 👋
                    </h1>
                    <p>
                        Welcome to the Employee Management System. You are logged in as{' '}
                        <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                            {user?.role}
                        </span>
                    </p>
                </div>
                <div className="welcome-date">
                    <p>{new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {getCards().map((card, index) => (
                    <Link
                        to={card.disabled ? '#' : card.link}
                        key={index}
                        className={`dashboard-card ${card.disabled ? 'disabled' : ''}`}
                        style={{ '--card-color': card.color }}
                    >
                        <div className="card-icon" style={{ background: card.color }}>
                            {card.icon}
                        </div>
                        <div className="card-content">
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </div>
                        {card.disabled && (
                            <span className="coming-soon">Shaqa ku socota</span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
