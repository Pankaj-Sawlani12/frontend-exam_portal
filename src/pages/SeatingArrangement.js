
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SeatingArrangement.css';

const API_URL = 'https://backend-exam-paper.vercel.app';
const COLUMNS = 6;


async function readApiResponse(response) {
    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(
            `The API returned HTML or invalid JSON (HTTP ${response.status}). ` +
            'Check the API URL and ensure the backend route is running.'
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed: HTTP ${response.status}`
        );
    }

    return data;
}

function SeatingArrangement() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('all');
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [printAttendance, setPrintAttendance] = useState(false);
    
    useEffect(() => {
        const loadExamCycles = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${API_URL}/exam-cycles`);
                //const data = await response.json();
                const data = await readApiResponse(response);

                if (!response.ok || data.success === false) {
                    throw new Error(
                        data.message || 'Unable to load exam cycles.'
                    );
                }

                const cycles = Array.isArray(data)
                    ? data
                    : data.examCycles || data.cycles || data.data || [];

                setExamCycles(cycles);
            } catch (err) {
                setError(err.message || 'Failed to load exam cycles.');
            } finally {
                setLoading(false);
            }
        };

        loadExamCycles();
    }, []);

    
useEffect(() => {
    if (!printAttendance) return;

    const resetPrintMode = () => setPrintAttendance(false);

    window.addEventListener('afterprint', resetPrintMode);
    window.print();

    return () => {
        window.removeEventListener('afterprint', resetPrintMode);
    };
}, [printAttendance]);


        const loadSeatingArrangement = async (cycleId) => {
    if (!cycleId) {
        setSeats([]);
        return;
    }

    try {
        setLoading(true);
        setError('');
        setMessage('');

        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error(
                'Please log in again. Your JWT token is missing.'
            );
        }

        const response = await fetch(
            `${API_URL}/seating-arrangements?examCycle=${encodeURIComponent(cycleId)}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await readApiResponse(response);

        if (data.success === false) {
            throw new Error(
                data.message || 'Unable to load seating arrangement.'
            );
        }

        setSeats(data.seatingArrangement || []);
        setSelectedRoom('all');

        if (!(data.seatingArrangement || []).length) {
            setMessage(
                'No saved seating arrangement found. Generate one first.'
            );
        }
    } catch (err) {
        setError(
            err.message || 'Failed to load seating arrangement.'
        );
        setSeats([]);
    } finally {
        setLoading(false);
    }
};

    const handleCycleChange = (event) => {
        const cycleId = event.target.value;
        setSelectedCycle(cycleId);
        setSeats([]);
        setSelectedRoom('all');
        setError('');
        setMessage('');

        if (cycleId) {
            loadSeatingArrangement(cycleId);
        }
    };

    const handleGenerate = async () => {
        if (!selectedCycle) {
            setError('Please select an exam cycle first.');
            return;
        }

        try {
            setGenerating(true);
            setError('');
            setMessage('');

            
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Please log in again. Your JWT token is missing.');
        }

        const response = await fetch(
            `${API_URL}/seating-arrangements/generate?examCycle=${encodeURIComponent(selectedCycle)}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


                // const data = await response.json();
                const data = await readApiResponse(response);

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || 'Failed to generate seating arrangement.'
                );
            }

            setMessage(
                `Successfully generated ${data.totalSeatsAssigned} seat assignments.`
            );

            await loadSeatingArrangement(selectedCycle);
        } catch (err) {
            setError(err.message || 'Failed to generate seating arrangement.');
        } finally {
            setGenerating(false);
        }
    };

    const rooms = useMemo(() => {
        const roomMap = new Map();

        seats.forEach((seat) => {
            if (seat.classroom?._id) {
                roomMap.set(
                    seat.classroom._id,
                    seat.classroom.roomNumber
                );
            }
        });

        return Array.from(roomMap, ([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [seats]);

    const filteredSeats = useMemo(() => {
        return selectedRoom === 'all'
            ? seats
            : seats.filter(
                (seat) => seat.classroom?._id === selectedRoom
            );
    }, [seats, selectedRoom]);

    const seatingGroups = useMemo(() => {
        const groups = new Map();

        filteredSeats.forEach((seat) => {
            const sessionId =
                seat.examSession?._id || 'unknown-session';
            const courseId = seat.course?._id || 'unknown-course';
            const roomId = seat.classroom?._id || 'unknown-room';

            const key = `${sessionId}-${courseId}-${roomId}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    session: seat.examSession,
                    course: seat.course,
                    classroom: seat.classroom,
                    seats: []
                });
            }

            groups.get(key).seats.push(seat);
        });

        return Array.from(groups.values()).sort((a, b) => {
            const roomCompare = (a.classroom?.roomNumber || '')
                .localeCompare(b.classroom?.roomNumber || '');

            if (roomCompare !== 0) return roomCompare;

            return (a.course?.courseCode || '')
                .localeCompare(b.course?.courseCode || '');
        });
    }, [filteredSeats]);

    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    return (
        <div className="management-container">
            <header className="management-header">
                <div>
                    <h1>Seating Arrangement</h1>
                    <p>Generate and view classroom-wise exam seating plans.</p>
                </div>

                <button
                    type="button"
                    className="seating-dashboard-btn"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Dashboard
                </button>
            </header>

            <section className="management-card">
                <label htmlFor="examCycle">
                    Select Exam Cycle
                </label>

                <select
                    id="examCycle"
                    value={selectedCycle}
                    onChange={handleCycleChange}
                    disabled={loading || generating}
                >
                    <option value="">-- Select Exam Cycle --</option>

                    {examCycles.map((cycle) => (
                        <option key={cycle._id} value={cycle._id}>
                            {cycle.cycleName}
                        </option>
                    ))}
                </select>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginTop: '16px'
                }}>
<button
    type="button"
    className="seating-btn seating-generate-btn"
    onClick={handleGenerate}
    disabled={!selectedCycle || generating || loading}
>
    {generating
        ? 'Generating...'
        : 'Generate Seating Arrangement'}
</button>

<button
    type="button"
    className="seating-btn seating-refresh-btn"
    onClick={() => loadSeatingArrangement(selectedCycle)}
    disabled={!selectedCycle || generating || loading}
>
    {loading ? 'Refreshing...' : 'Refresh Saved Plan'}
</button>


                    <button
                        type="button"
                        onClick={() => window.print()}
                        disabled={seatingGroups.length === 0}
                    >
                        Print Seating Plan
                    </button>

                    <button
                        type="button"
                        className="seating-btn seating-attendance-btn"
                        onClick={() => setPrintAttendance(true)}
                        disabled={seatingGroups.length === 0 || loading || generating}
                    >
                        Print Attendance Sheet
                    </button>
                </div>
            </section>

            {error && (
                <p role="alert" style={{ color: 'crimson' }}>
                    {error}
                </p>
            )}

            {message && (
                <p role="status" style={{ color: 'green' }}>
                    {message}
                </p>
            )}

            {loading && <p>Loading seating arrangements...</p>}

            {!loading && seats.length > 0 && (
                <>
                    <section className="management-card">
                        <div style={{
                            display: 'flex',
                            gap: '24px',
                            flexWrap: 'wrap'
                        }}>
                            <p>
                                <strong>Total assigned seats:</strong>{' '}
                                {seats.length}
                            </p>

                            <p>
                                <strong>Classrooms used:</strong>{' '}
                                {rooms.length}
                            </p>
                        </div>

                        <label htmlFor="classroomFilter">
                            Filter by Classroom
                        </label>

                        <select
                            id="classroomFilter"
                            value={selectedRoom}
                            onChange={(event) =>
                                setSelectedRoom(event.target.value)
                            }
                        >
                            <option value="all">All Classrooms</option>

                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </section>

                    {seatingGroups.map((group) => {
                        const seatMap = new Map(
                            group.seats.map((seat) => [
                                seat.seatNumber,
                                seat
                            ])
                        );

                        const maxSeat = Math.max(
                            0,
                            ...group.seats.map((seat) => seat.seatNumber)
                        );

                        const rowCount = Math.ceil(maxSeat / COLUMNS);

                        return (
                            <section
                                className="management-card seating-print-card"
                                key={group.key}
                                style={{ marginBottom: '24px' }}
                            >
                                <h2>
                                    {group.course?.courseCode || 'Course'} —{' '}
                                    {group.course?.courseName || ''}
                                </h2>

                                <p>
                                    <strong>Room:</strong>{' '}
                                    {group.classroom?.roomNumber || '-'}
                                </p>

                                <p>
                                    <strong>Exam date:</strong>{' '}
                                    {formatDate(group.session?.sessionDate)}
                                </p>

                                <p>
                                    <strong>Session:</strong>{' '}
                                    {group.session?.sessionType || '-'}{' '}
                                    ({group.session?.startTime || '-'} –{' '}
                                    {group.session?.endTime || '-'})
                                </p>

                                <p>
                                    <strong>Students assigned:</strong>{' '}
                                    {group.seats.length}
                                </p>

                                
<div className="seating-chart">
    <div className="seating-front">
        <span>FRONT OF CLASSROOM</span>
    </div>

    <div className="seating-legend">
        <span>
            <span className="legend-dot occupied-dot"></span>
            Occupied seat
        </span>
        <span>
            <span className="legend-dot empty-dot"></span>
            Empty seat
        </span>
    </div>

    <div className="seating-grid-wrap">
        <table className="seating-grid-table">
            <thead>
                <tr>
                    {Array.from(
                        { length: COLUMNS },
                        (_, index) => (
                            <th key={index}>
                                Column {index + 1}
                            </th>
                        )
                    )}
                </tr>
            </thead>

            <tbody>
                {Array.from(
                    { length: rowCount },
                    (_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from(
                                { length: COLUMNS },
                                (_, columnIndex) => {
                                    const seatNumber =
                                        rowIndex * COLUMNS +
                                        columnIndex + 1;

                                    const seat = seatMap.get(seatNumber);

                                    return (
                                        <td key={columnIndex}>
                                            <div
                                                className={`seat-cell ${
                                                    seat
                                                        ? 'occupied'
                                                        : 'empty'
                                                }`}
                                            >
                                                <span className="seat-number">
                                                    Seat {seatNumber}
                                                </span>

                                                <span className="seat-student">
                                                    {seat?.student?.studentId ||
                                                        'Available'}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                }
                            )}
                        </tr>
                    )
                )}
            </tbody>
        </table>
    </div>
</div>

                            </section>
                        );
                    })}
                </>
            )}
        </div>
    );
}

export default SeatingArrangement;
