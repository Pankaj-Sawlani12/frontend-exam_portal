
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Teacher() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem('loggedInUser');

    let teacherName = 'Teacher';

    try {
        const user = JSON.parse(storedUser || '{}');

        teacherName =
            user.name ||
            user.user?.name ||
            user.username ||
            'Teacher';
    } catch {
        teacherName = storedUser || 'Teacher';
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const features = [
        {
            title: 'My Exam Schedule',
            description: 'View your assigned examination dates, subjects, and timings.',
            icon: '📅',
            path: '/teacher/exam-schedule'
        },
        {
            title: 'My Invigilation Duties',
            description: 'View your assigned exam sessions, dates, and duty timings.',
            icon: '📋',
            path: '/teacher/invigilation-duties'
        },
        {
            title: 'My Assigned Rooms',
            description: 'View the examination rooms assigned to your duties.',
            icon: '🏫',
            path: '/teacher/assigned-rooms'
        }
    ];

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>Welcome, {teacherName}!</h1>
                    <p className="management-subtitle">
                        Welcome to your examination dashboard.
                    </p>
                </div>

                <div className="management-actions">
                    <button
                        type="button"
                        className="management-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="student-feature-grid">
                {features.map((feature) => (
                    <div className="student-feature-card" key={feature.path}>
                        <div className="student-feature-icon">
                            {feature.icon}
                        </div>

                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>

                        <button
                            type="button"
                            className="management-button"
                            onClick={() => navigate(feature.path)}
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Teacher;
