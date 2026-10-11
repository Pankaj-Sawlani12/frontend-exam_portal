import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function RoomAllocation() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchExamCycles = async () => {
            try {
                const response = await fetch(`${API_URL}/exam-cycles`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load exam cycles.');
                }

                setExamCycles(data.examCycles || []);
            } catch (error) {
                setMessage(error.message || 'Unable to connect to the server.');
            }
        };

        fetchExamCycles();
    }, []);

        
    const fetchAllocations = async () => {
        if (!selectedCycle) {
            setMessage('Please select an exam cycle.');
            return;
        }

        setLoading(true);
        setMessage('');
        setTimetable([]);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Please log in again.');
            }

            const response = await fetch(
                `${API_URL}/timetable?examCycle=${selectedCycle}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to load room allocations.'
                );
            }

            const entries = Array.isArray(data.timetable)
                ? data.timetable
                : [];

            setTimetable(entries);

            if (entries.length === 0) {
                setMessage(
                    'No saved timetable found. Generate a timetable first.'
                );
            }
        } catch (error) {
            setMessage(
                error.message || 'Unable to connect to the server.'
            );
        } finally {
            setLoading(false);
        }
    };


    const getRooms = (item) => {
        if (!Array.isArray(item.classrooms)) {
            return [];
        }

        return item.classrooms
            .map((room) => typeof room === 'string' ? room : room?.roomNumber)
            .filter(Boolean);
    };

    const getCapacity = (item) => {
        if (!Array.isArray(item.classrooms)) {
            return 0;
        }

        return item.classrooms.reduce((total, room) => {
            if (typeof room === 'string') {
                return total;
            }

            return total + (Number(room?.capacity) || 0);
        }, 0);
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>Room Allocation</h1>
                    <p>Review classrooms assigned to each examination.</p>
                </div>

                <div className="management-actions">
                    <button
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Admin
                    </button>
                </div>
            </div>

            <div className="form-card">
                <div className="form-group">
                    <label htmlFor="examCycle">Exam Cycle</label>

                    <select
                        id="examCycle"
                        value={selectedCycle}
                        onChange={(event) => setSelectedCycle(event.target.value)}
                    >
                        <option value="">Select Exam Cycle</option>

                        {examCycles.map((cycle) => (
                            <option key={cycle._id} value={cycle._id}>
                                {cycle.cycleName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="management-actions">
                    <button
                        className="management-button"
                        onClick={fetchAllocations}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'View Room Allocations'}
                    </button>
                </div>
            </div>

            {message && (
                <div className="management-card">
                    <p>{message}</p>
                </div>
            )}

            {timetable.length > 0 && (
                <div className="management-card">
                    <h2>Assigned Classrooms</h2>

                    <div className="management-table-container">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Exam Date</th>
                                    <th>Session</th>
                                    <th>Students</th>
                                    <th>Assigned Rooms</th>
                                    <th>Total Capacity</th>
                                    <th>Allocation Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {timetable.map((item) => {
                                    const rooms = getRooms(item);
                                    const capacity = getCapacity(item);

                                    return (
                                        <tr key={item._id || item.course?._id}>
                                            <td>{item.course?.courseCode || '-'}</td>
                                            <td>{item.course?.courseName || '-'}</td>
                                            <td>
                                                {item.examSession?.sessionDate
                                                    ? new Date(
                                                        item.examSession.sessionDate
                                                    ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>{item.examSession?.sessionType || '-'}</td>
                                            <td>{item.enrolledStudents ?? 0}</td>
                                            <td>{rooms.join(', ') || 'No rooms assigned'}</td>
                                            <td>
                                                {rooms.length > 0 && capacity > 0
                                                    ? capacity
                                                    : 'Capacity unavailable'}
                                            </td>
                                            <td>
                                                {rooms.length === 0
                                                    ? 'No rooms assigned'
                                                    : getCapacity(item) >= (item.enrolledStudents ?? 0)
                                                        ? 'Sufficient Capacity'
                                                        : 'Insufficient Capacity'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomAllocation;
