import { useMemo, useState } from 'react';
import {
    cycleLabel,
    daysUntil,
    formatDate,
    formatLocation,
    formatTime,
    formatWeekday,
    useStudentApi
} from '../studentPortal.js';
import {
    DayPill,
    EmptyState,
    ErrorState,
    LoadingState,
    SessionPill,
    StudentPageHeader
} from './StudentShared.js';
import './Management.css';
import './StudentPortal.css';

const FILTERS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All' }
];

// 90 -> "1 hr 30 min", 180 -> "3 hr", 45 -> "45 min"
const formatDuration = (minutes) => {
    const total = Number(minutes);

    if (!total) return '-';

    const hours = Math.floor(total / 60);
    const rest = total % 60;

    if (!hours) return `${rest} min`;

    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

function StudentExamSchedule() {
    const { data, loading, error, reload } = useStudentApi(
        '/students/me/exam-schedule'
    );

    const [filter, setFilter] = useState(null); // null = pick automatically
    const [cycleId, setCycleId] = useState('');

    const exams = useMemo(() => data?.exams || [], [data]);

    const cycles = useMemo(() => {
        const seen = new Map();

        exams.forEach((exam) => {
            if (exam.examCycle?._id && !seen.has(exam.examCycle._id)) {
                seen.set(exam.examCycle._id, exam.examCycle);
            }
        });

        return [...seen.values()];
    }, [exams]);

    const inCycle = useMemo(
        () =>
            cycleId
                ? exams.filter((exam) => exam.examCycle?._id === cycleId)
                : exams,
        [exams, cycleId]
    );

    const isPast = (exam) =>
        (daysUntil(exam.examSession?.sessionDate) ?? 0) < 0;

    const hasUpcoming = inCycle.some((exam) => !isPast(exam));

    // Show upcoming exams first; fall back to everything when none remain.
    const activeFilter = filter ?? (hasUpcoming ? 'upcoming' : 'all');

    const visible = inCycle.filter((exam) => {
        if (activeFilter === 'upcoming') return !isPast(exam);
        if (activeFilter === 'past') return isPast(exam);
        return true;
    });

    return (
        <div className="management-page">
            <StudentPageHeader
                title="My Exam Schedule"
                subtitle="Your examination dates, subjects, timings and rooms."
                actions={
                    visible.length > 0 && (
                        <button
                            type="button"
                            className="management-button secondary"
                            onClick={() => window.print()}
                        >
                            Print schedule
                        </button>
                    )
                }
            />

            {loading && <LoadingState label="Loading your exam schedule..." />}

            {error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && exams.length === 0 && (
                <EmptyState icon="📅" title="No exams scheduled yet">
                    Your timetable has not been published, or you are not
                    enrolled in any course yet. Please check again later or
                    contact the examination office.
                </EmptyState>
            )}

            {exams.length > 0 && (
                <>
                    <div className="sp-toolbar sp-no-print">
                        <div className="sp-chip-group" role="group" aria-label="Filter exams">
                            {FILTERS.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    className="sp-chip-button"
                                    aria-pressed={activeFilter === item.key}
                                    onClick={() => setFilter(item.key)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {cycles.length > 1 && (
                            <select
                                className="sp-select"
                                aria-label="Exam cycle"
                                value={cycleId}
                                onChange={(event) => setCycleId(event.target.value)}
                            >
                                <option value="">All exam cycles</option>
                                {cycles.map((cycle) => (
                                    <option key={cycle._id} value={cycle._id}>
                                        {cycleLabel(cycle)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {visible.length === 0 ? (
                        <EmptyState
                            icon="🔎"
                            title={
                                activeFilter === 'upcoming'
                                    ? 'No upcoming exams'
                                    : 'No exams to show'
                            }
                        >
                            Nothing matches this filter. Try &quot;All&quot; to see
                            every exam.
                        </EmptyState>
                    ) : (
                        <div className="management-card">
                            <h2>Examination Timetable</h2>
                            <p className="sp-subtitle">
                                {visible.length} examination(s)
                            </p>

                            <div className="sp-table-wrap">
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Course</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Duration</th>
                                            <th>Session</th>
                                            <th>Room</th>
                                            <th>Seat</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visible.map((exam, index) => {
                                            const date = exam.examSession?.sessionDate;
                                            const days = daysUntil(date);
                                            const planned = (exam.plannedClassrooms || [])
                                                .map((room) => room.roomNumber)
                                                .filter(Boolean)
                                                .join(', ');

                                            return (
                                                <tr
                                                    key={exam._id}
                                                    className={
                                                        days < 0
                                                            ? 'sp-row-past'
                                                            : days === 0
                                                              ? 'sp-row-today'
                                                              : ''
                                                    }
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <strong>{exam.course?.courseCode || '-'}</strong>
                                                        <small>{exam.course?.courseName}</small>
                                                        {cycles.length > 1 && (
                                                            <small>{cycleLabel(exam.examCycle)}</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatDate(date)}
                                                        <small>{formatWeekday(date)}</small>
                                                        <DayPill date={date} />
                                                    </td>
                                                    <td>
                                                        {formatTime(exam.examSession?.startTime)} –{' '}
                                                        {formatTime(exam.examSession?.endTime)}
                                                        <small>
                                                            Report by {formatTime(exam.reportingTime)}
                                                        </small>
                                                    </td>
                                                    <td>{formatDuration(exam.course?.examDuration)}</td>
                                                    <td>
                                                        <SessionPill type={exam.examSession?.sessionType} />
                                                    </td>
                                                    <td>
                                                        {exam.classroom ? (
                                                            <>
                                                                <strong>{exam.classroom.roomNumber}</strong>
                                                                <small>{formatLocation(exam.classroom)}</small>
                                                            </>
                                                        ) : planned ? (
                                                            <>
                                                                {planned}
                                                                <small>Room for your seat not final yet</small>
                                                            </>
                                                        ) : (
                                                            <span className="sp-pill pending">To be announced</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {exam.seat ? (
                                                            <strong>No. {exam.seat.seatNumber}</strong>
                                                        ) : (
                                                            <span className="sp-pill pending">Not allotted</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

export default StudentExamSchedule;
