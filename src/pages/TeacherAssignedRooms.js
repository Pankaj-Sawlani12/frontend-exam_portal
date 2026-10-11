
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function TeacherAssignedRooms() {
    const navigate = useNavigate();
    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchAssignedRooms = async () => {
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
                        data.message || 'Unable to load assigned rooms.'
                    );
                    return;
                }

                const records = (data.duties || [])
                    .filter(duty =>
                        duty.status !== 'Cancelled' && duty.classroom
                    )
                    .sort((a, b) => {
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
                    setMessage('No rooms are currently assigned to you.');
                }
            } catch (error) {
                console.error('Fetch Assigned Rooms Error:', error);
                setMessage('Unable to connect to the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedRooms();
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
                    <h1>My Assigned Rooms</h1>
                    <p className="management-subtitle">
                        View the examination rooms assigned to your
                        invigilation duties.
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
                    Loading your assigned rooms...
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
                            <h2>Room Assignments</h2>

                            <p className="management-subtitle">
                                {duties.length} active room assignment(s)
                            </p>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Room Number</th>
                                            <th>Exam Cycle</th>
                                            <th>Exam Date</th>
                                            <th>Session</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Duty Role</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {duties.map((duty, index) => (
                                            <tr key={duty._id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {duty.classroom.roomNumber || '-'}
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

export default TeacherAssignedRooms;
