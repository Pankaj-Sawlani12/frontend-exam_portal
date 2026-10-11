
import React, { useEffect, useState } from 'react';
import './InvigilationDuty.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://backend-exam-paper.vercel.app';

function InvigilationDuty() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [cyclesLoading, setCyclesLoading] = useState(false);

    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleBackToDashboard = () => {
        navigate('/admin');
    };

    // Load all available exam cycles.
    useEffect(() => {
        const loadExamCycles = async () => {
            try {
                setCyclesLoading(true);
                setError('');

                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Please log in again. Your token is missing.');
                }

                const response = await fetch(`${API_URL}/exam-cycles`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    throw new Error(
                        data.message || 'Failed to load exam cycles.'
                    );
                }

                const cycles = Array.isArray(data)
                    ? data
                    : data.examCycles || data.cycles || data.data || [];

                setExamCycles(cycles);
            } catch (err) {
                setError(err.message || 'Failed to load exam cycles.');
            } finally {
                setCyclesLoading(false);
            }
        };

        loadExamCycles();
    }, []);

    // Load duties for the selected exam cycle.
    const fetchDuties = async (cycleId) => {
        if (!cycleId) {
            setDuties([]);
            setError('');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Please log in again. Your token is missing.');
            }

            const response = await fetch(
                `${API_URL}/invigilation-duties?examCycle=${encodeURIComponent(cycleId)}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || 'Failed to fetch invigilation duties.'
                );
            }

            setDuties(data.duties || []);
        } catch (err) {
            setError(err.message || 'Unable to connect to the server.');
            setDuties([]);
        } finally {
            setLoading(false);
        }
    };

const generateDuties = async () => {
    if (!selectedCycle) {
        setError('Please select an exam cycle first.');
        return;
    }

    try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        const response = await fetch(
            `${API_URL}/invigilation-duties/generate?examCycle=${encodeURIComponent(selectedCycle)}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Failed to generate invigilation duties.'
            );
        }

        await fetchDuties(selectedCycle);
    } catch (err) {
        setError(err.message || 'Failed to generate invigilation duties.');
    } finally {
        setLoading(false);
    }
};

    const handleCycleChange = (event) => {
        const cycleId = event.target.value;

        setSelectedCycle(cycleId);
        setDuties([]);
        setError('');

        if (cycleId) {
            fetchDuties(cycleId);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    const getTeacherName = (teacher) => {
        if (!teacher) return 'Unknown teacher';

        return teacher.user?.name || teacher.teacherId || 'Unknown teacher';
    };

    return (
        <div className="invigilation-page">
            <div className="invigilation-header">
                <div>
                    <h1>Invigilation Duty Dashboard</h1>
                    <p>
                        Manage and review examination invigilation assignments.
                    </p>
                </div>

                <div className="invigilation-actions">
                    <button
                        type="button"
                        onClick={() => fetchDuties(selectedCycle)}
                        disabled={loading || !selectedCycle}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        disabled={!duties.length}
                    >
                        Print Duty Chart
                    </button>

                    <button
                        type="button"
                        onClick={handleBackToDashboard}
                        className="back-dashboard-btn"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        type="button"
                        onClick={generateDuties}
                        disabled={loading || !selectedCycle}
                    >
                        {loading ? 'Generating...' : 'Generate Duties'}
                    </button>
                </div>
            </div>

            <div className="invigilation-cycle-selector">
                <label htmlFor="examCycle">Select Exam Cycle</label>

                <select
                    id="examCycle"
                    value={selectedCycle}
                    onChange={handleCycleChange}
                    disabled={cyclesLoading || loading}
                >
                    <option value="">
                        {cyclesLoading
                            ? 'Loading exam cycles...'
                            : '-- Select Exam Cycle --'}
                    </option>

                    {examCycles.map((cycle) => (
                        <option key={cycle._id} value={cycle._id}>
                            {cycle.cycleName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="invigilation-summary">
                <div className="invigilation-summary-card">
                    <span>Total Duties</span>
                    <strong>{duties.length}</strong>
                </div>

                <div className="invigilation-summary-card">
                    <span>Assigned</span>
                    <strong>
                        {duties.filter(
                            (duty) => duty.status === 'Assigned'
                        ).length}
                    </strong>
                </div>

                <div className="invigilation-summary-card">
                    <span>Completed</span>
                    <strong>
                        {duties.filter(
                            (duty) => duty.status === 'Completed'
                        ).length}
                    </strong>
                </div>
            </div>

            {error && (
                <div className="invigilation-error">
                    <p>{error}</p>

                    {selectedCycle && (
                        <button
                            type="button"
                            onClick={() => fetchDuties(selectedCycle)}
                            disabled={loading}
                        >
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {loading && (
                <p className="invigilation-message">
                    Loading invigilation duties...
                </p>
            )}

            {!cyclesLoading &&
                examCycles.length === 0 &&
                !error && (
                    <div className="invigilation-empty">
                        <h3>No exam cycles found</h3>
                        <p>
                            Create an exam cycle in the admin portal first.
                        </p>
                    </div>
                )}

            {!loading &&
                selectedCycle &&
                !error &&
                duties.length === 0 && (
                    <div className="invigilation-empty">
                        <h3>No duties found</h3>
                        <p>
                            No invigilation duties are saved for this exam
                            cycle. Generate them first if needed.
                        </p>
                    </div>
                )}

            {duties.length > 0 && (
                <div className="invigilation-table-wrapper">
                    <table className="invigilation-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Exam Date</th>
                                <th>Session</th>
                                <th>Time</th>
                                <th>Teacher ID</th>
                                <th>Teacher Name</th>
                                <th>Classroom</th>
                                <th>Duty Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {duties.map((duty, index) => (
                                <tr key={duty._id || index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {formatDate(
                                            duty.examSession?.sessionDate
                                        )}
                                    </td>
                                    <td>
                                        {duty.examSession?.sessionType || '—'}
                                    </td>
                                    <td>
                                        {duty.examSession?.startTime || '—'}
                                        {' - '}
                                        {duty.examSession?.endTime || '—'}
                                    </td>
                                    <td>
                                        {duty.teacher?.teacherId || '—'}
                                    </td>
                                    <td>{getTeacherName(duty.teacher)}</td>
                                    <td>
                                        {duty.classroom?.roomNumber || '—'}
                                    </td>
                                    <td>{duty.dutyRole || '—'}</td>
                                    <td>
                                        <span
                                            className={`invigilation-status ${
                                                duty.status === 'Completed'
                                                    ? 'completed'
                                                    : duty.status === 'Cancelled'
                                                    ? 'cancelled'
                                                    : 'assigned'
                                            }`}
                                        >
                                            {duty.status || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default InvigilationDuty;
