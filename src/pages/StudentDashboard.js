import { useNavigate } from 'react-router-dom';
import {
    clearSession,
    formatDate,
    formatLocation,
    formatTime,
    formatWeekday,
    useStudentApi
} from '../studentPortal.js';
import { DayPill, ErrorState } from './StudentShared.js';
import './Management.css';
import './StudentPortal.css';

function StudentDashboard() {
    const navigate = useNavigate();
    const { data, loading, error, reload } = useStudentApi(
        '/students/me/overview'
    );

    const handleLogout = () => {
        clearSession();
        navigate('/login');
    };

    const profile = data?.profile;
    const nextExam = data?.nextExam;
    const displayName =
        profile?.name || localStorage.getItem('loggedInUser') || '';

    const features = [
        {
            title: 'My Exam Schedule',
            description:
                'View your examination dates, subjects, and exam timings.',
            icon: '📅',
            path: '/student/exam-schedule',
            meta: data ? `${data.totalExams} exam(s) scheduled` : ''
        },
        {
            title: 'My Sitting Plan',
            description:
                'Check your assigned examination room and seat details.',
            icon: '🪑',
            path: '/student/sitting-plan',
            meta: data ? `${data.seatsAllocated} seat(s) allocated` : ''
        },
        {
            title: 'My Exam Shifts',
            description:
                'View your morning or afternoon exam shifts and reporting times.',
            icon: '🕒',
            path: '/student/exam-shifts',
            meta: data ? `${data.upcomingExams} upcoming` : ''
        }
    ];

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>Student Dashboard</h1>
                    <p className="sp-subtitle">
                        {displayName
                            ? `Welcome, ${displayName}. View your examination information.`
                            : 'View your examination information'}
                    </p>
                </div>

                <div className="management-actions sp-no-print">
                    <button
                        type="button"
                        className="management-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {profile && (
                <div className="sp-profile">
                    <span className="sp-profile-chip">
                        Student ID: <strong>{profile.studentId}</strong>
                    </span>
                    <span className="sp-profile-chip">
                        Department: <strong>{profile.department}</strong>
                    </span>
                    <span className="sp-profile-chip">
                        Semester: <strong>{profile.semester}</strong>
                    </span>
                </div>
            )}

            {error && <ErrorState message={error} onRetry={reload} />}

            {data && (
                <div className="sp-stats">
                    <div className="sp-stat">
                        <span>Total exams</span>
                        <strong>{data.totalExams}</strong>
                    </div>
                    <div className="sp-stat">
                        <span>Upcoming exams</span>
                        <strong>{data.upcomingExams}</strong>
                    </div>
                    <div className="sp-stat">
                        <span>Seats allocated</span>
                        <strong>{data.seatsAllocated}</strong>
                    </div>
                </div>
            )}

            {nextExam && (
                <section className="sp-next" aria-label="Your next exam">
                    <div>
                        <div className="sp-next-label">
                            Your next exam <DayPill date={nextExam.examSession?.sessionDate} />
                        </div>
                        <h2>
                            {nextExam.course?.courseCode} ·{' '}
                            {nextExam.course?.courseName}
                        </h2>
                        <p>
                            {formatWeekday(nextExam.examSession?.sessionDate)},{' '}
                            {formatDate(nextExam.examSession?.sessionDate)}
                        </p>
                    </div>

                    <dl className="sp-next-facts">
                        <div>
                            <dt>Exam time</dt>
                            <dd>
                                {formatTime(nextExam.examSession?.startTime)} –{' '}
                                {formatTime(nextExam.examSession?.endTime)}
                            </dd>
                        </div>
                        <div>
                            <dt>Report by</dt>
                            <dd>{formatTime(nextExam.reportingTime)}</dd>
                        </div>
                        <div>
                            <dt>Room</dt>
                            <dd>
                                {nextExam.classroom
                                    ? nextExam.classroom.roomNumber
                                    : 'To be announced'}
                            </dd>
                        </div>
                        <div>
                            <dt>Seat</dt>
                            <dd>
                                {nextExam.seat
                                    ? `No. ${nextExam.seat.seatNumber}`
                                    : 'To be announced'}
                            </dd>
                        </div>
                    </dl>

                    {nextExam.classroom && (
                        <p style={{ width: '100%' }}>
                            {formatLocation(nextExam.classroom)}
                        </p>
                    )}
                </section>
            )}

            {data && !nextExam && data.totalExams > 0 && (
                <div className="sp-note">
                    You have no upcoming exams. Past exams are still available
                    in My Exam Schedule.
                </div>
            )}

            {loading && !data && (
                <div className="sp-state" role="status" aria-live="polite">
                    <div
                        className="sp-skeleton"
                        style={{ width: '50%', margin: '0 auto' }}
                    />
                </div>
            )}

            <div className="student-feature-grid">
                {features.map((feature) => (
                    <div className="student-feature-card" key={feature.path}>
                        <div className="student-feature-icon">
                            {feature.icon}
                        </div>

                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>

                        {feature.meta && (
                            <span className="sp-feature-meta">
                                {feature.meta}
                            </span>
                        )}

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

export default StudentDashboard;
