
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function TeacherExamSchedule() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchExamCycles();
    }, []);

    const fetchExamCycles = async () => {
        try {
            const response = await fetch(`${API_URL}/exam-cycles`);
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Unable to load exam cycles.');
                return;
            }

            setExamCycles(data.examCycles || []);
        } catch (error) {
            console.error('Fetch Exam Cycles Error:', error);
            setMessage('Unable to connect to the server.');
        }
    };

    const fetchExamSchedule = async () => {
        if (!selectedCycle) {
            setMessage('Please select an exam cycle.');
            return;
        }

        setLoading(true);
        setMessage('');
        setTimetable([]);

        try {
            const response = await fetch(
                `${API_URL}/timetable?examCycle=${encodeURIComponent(selectedCycle)}`
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Unable to load the exam schedule.');
                return;
            }

            const records = data.timetable || [];

            records.sort((a, b) => {
                const dateA = new Date(a.examSession?.sessionDate || 0);
                const dateB = new Date(b.examSession?.sessionDate || 0);
                return dateA - dateB;
            });

            setTimetable(records);

            if (records.length === 0) {
                setMessage('No saved timetable found for this exam cycle.');
            }
        } catch (error) {
            console.error('Fetch Exam Schedule Error:', error);
            setMessage('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

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

    const getClassroomNames = (classrooms) => {
        if (!classrooms?.length) return '-';

        return classrooms
            .map((room) =>
                typeof room === 'string' ? room : room?.roomNumber
            )
            .filter(Boolean)
            .join(', ') || '-';
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>My Exam Schedule</h1>
                    <p className="management-subtitle">
                        View examination dates, subjects, timings, and rooms.
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

            <div className="form-card">
                <div className="form-group">
                    <label htmlFor="examCycle">Select Exam Cycle</label>

                    <select
                        id="examCycle"
                        value={selectedCycle}
                        onChange={(e) => {
                            setSelectedCycle(e.target.value);
                            setTimetable([]);
                            setMessage('');
                        }}
                    >
                        <option value="">Select an exam cycle</option>

                        {examCycles.map((cycle) => (
                            <option key={cycle._id} value={cycle._id}>
                                {cycle.cycleName}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    className="management-button"
                    onClick={fetchExamSchedule}
                    disabled={loading}
                >
                    {loading ? 'Loading Schedule...' : 'View Exam Schedule'}
                </button>
            </div>

            {message && (
                <div className="management-message">
                    {message}
                </div>
            )}

            {timetable.length > 0 && (
                <div className="management-card">
                    <h2>Examination Timetable</h2>

                    <p className="management-subtitle">
                        {timetable.length} examination(s) found
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Course Code</th>
                                    <th>Subject</th>
                                    <th>Exam Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Session</th>
                                    <th>Classroom</th>
                                </tr>
                            </thead>

                            <tbody>
                                {timetable.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {item.course?.courseCode || '-'}
                                        </td>
                                        <td>
                                            {item.course?.courseName || '-'}
                                        </td>
                                        <td>
                                            {formatDate(
                                                item.examSession?.sessionDate
                                            )}
                                        </td>
                                        <td>
                                            {item.examSession?.startTime || '-'}
                                        </td>
                                        <td>
                                            {item.examSession?.endTime || '-'}
                                        </td>
                                        <td>
                                            {item.examSession?.sessionType || '-'}
                                        </td>
                                        <td>
                                            {getClassroomNames(item.classrooms)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherExamSchedule;
