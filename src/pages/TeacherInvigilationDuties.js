
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function TeacherInvigilationDuties() {
    const navigate = useNavigate();

    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [clashingDutyIds, setClashingDutyIds] = useState(new Set());

    useEffect(() => {
        const fetchDuties = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(
                    `${API_URL}/invigilation-duties/my-duties`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(
                        data.message || 'Unable to load your duties.'
                    );
                    return;
                }

                const records = data.duties || [];
const dutyCounts = new Map();

records.forEach((duty) => {
    const teacherId =
        duty.teacher?._id || duty.teacher?.toString();

    const date = duty.examSession?.sessionDate;

    if (!teacherId || !date || !duty._id) return;

    const dateKey = new Date(date).toISOString().slice(0, 10);
    const key = `${teacherId}_${dateKey}`;

    dutyCounts.set(key, (dutyCounts.get(key) || 0) + 1);
});

const clashes = new Set();

records.forEach((duty) => {
    const teacherId =
        duty.teacher?._id || duty.teacher?.toString();

    const date = duty.examSession?.sessionDate;

    if (!teacherId || !date || !duty._id) return;

    const dateKey = new Date(date).toISOString().slice(0, 10);
    const key = `${teacherId}_${dateKey}`;

    if (dutyCounts.get(key) > 1) {
        clashes.add(duty._id);
    }
});

setClashingDutyIds(clashes);

                records.sort((a, b) => {
                    const dateA = new Date(
                        a.examSession?.sessionDate || 0
                    );
                    const dateB = new Date(
                        b.examSession?.sessionDate || 0
                    );

                    return dateA - dateB;
                });

                setDuties(records);

                if (records.length === 0) {
                    setMessage('No invigilation duties assigned yet.');
                }
            } catch (error) {
                console.error('Fetch Invigilation Duties Error:', error);
                setMessage('Unable to connect to the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchDuties();
    }, [navigate]);

    const formatDate = (date) => {
        if (!date) return '-';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return '-';

        return parsedDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>My Invigilation Duties</h1>
                    <p className="management-subtitle">
                        View your assigned examination sessions and rooms.
                    </p>
                </div>

                <div className="management-actions">
                    <button
                        type="button"
                        className="management-button"
                        onClick={() => navigate('/teacher')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="management-message">
                    Loading your invigilation duties...
                </div>
            ) : (
                <>
                    {message && (
                        <div className="management-message">
                            {message}
                        </div>
                    )}

                    {duties.length > 0 && (
                        <div className="management-card">
                            <h2>Assigned Duties</h2>
                            {clashingDutyIds.size > 0 && (
                                <div
                                    style={{
                                        backgroundColor: '#fee2e2',
                                        color: '#991b1b',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        marginBottom: '12px'
                                    }}
                                >
                                    Warning: {clashingDutyIds.size} duty record(s) belong to
                                    teachers assigned more than once on the same date.
                                    Please review the highlighted rows.
                                </div>
                            )}

                            <p className="management-subtitle">
                                {duties.length} duty/duties assigned
                            </p>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Teacher ID</th>
                                            <th>Teacher Name</th>
                                            <th>Exam Cycle</th>
                                            <th>Exam Date</th>
                                            <th>Session</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Classroom</th>
                                            <th>Duty Role</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {duties.map((duty, index) => (
                                            <tr
                                                key={duty._id}
                                                style={
                                                    clashingDutyIds.has(duty._id)
                                                        ? { backgroundColor: '#fee2e2', color: '#991b1b' }
                                                        : undefined
                                                }
                                            >
                                                <td>{index + 1}</td>
                                                <td>{duty.teacher?.teacherId || '-'}</td>
                                                <td>
                                                    {duty.teacher?.user?.name ||
                                                    duty.teacher?.teacherId ||
                                                    'Unknown Teacher'}
                                                </td>
                                                <td>
                                                    {duty.examCycle?.cycleName || '-'}
                                                </td>
                                                <td>
                                                    {formatDate(
                                                        duty.examSession?.sessionDate
                                                    )}
                                                </td>
                                                <td>
                                                    {duty.examSession?.sessionType || '-'}
                                                </td>
                                                <td>
                                                    {duty.examSession?.startTime || '-'}
                                                </td>
                                                <td>
                                                    {duty.examSession?.endTime || '-'}
                                                </td>
                                                <td>
                                                    {duty.classroom?.roomNumber || '-'}
                                                </td>
                                                <td>{duty.dutyRole || '-'}</td>
                                                <td>{duty.status || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TeacherInvigilationDuties;
