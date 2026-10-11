import { useMemo } from 'react';
import {
    daysUntil,
    formatDate,
    formatTime,
    formatWeekday,
    useStudentApi
} from '../studentPortal.js';
import {
    DayPill,
    EmptyState,
    ErrorState,
    LoadingState,
    StudentPageHeader
} from './StudentShared.js';
import './Management.css';
import './StudentPortal.css';

const SHIFT_ORDER = ['Morning', 'Afternoon', 'Evening'];

// Groups shifts under their exam day, keeping chronological order.
const groupByDay = (shifts) => {
    const days = new Map();

    shifts.forEach((shift) => {
        if (!shift.sessionDate) return;

        const key = new Date(shift.sessionDate).toISOString().slice(0, 10);

        if (!days.has(key)) {
            days.set(key, { key, date: shift.sessionDate, shifts: [] });
        }

        days.get(key).shifts.push(shift);
    });

    return [...days.values()].sort((a, b) => a.key.localeCompare(b.key));
};

function ShiftCard({ shift }) {
    const tone = String(shift.sessionType || '').toLowerCase();

    return (
        <div className={`sp-shift ${tone}`}>
            <div className="sp-shift-time">
                <span className={`sp-pill ${tone}`}>
                    {shift.sessionType || 'Shift'} shift
                </span>
                <strong style={{ marginTop: 8 }}>
                    {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                </strong>
            </div>

            <div className="sp-shift-course">
                <strong>
                    {shift.course?.courseCode} · {shift.course?.courseName}
                </strong>
                <span>
                    {shift.classroom
                        ? `Room ${shift.classroom.roomNumber}${
                              shift.seat ? ` · Seat ${shift.seat.seatNumber}` : ''
                          }`
                        : 'Room and seat to be announced'}
                </span>
            </div>

            <div className="sp-report">
                <span>Report by</span>
                <strong>{formatTime(shift.reportingTime)}</strong>
            </div>
        </div>
    );
}

function DayGroup({ day }) {
    const shifts = [...day.shifts].sort(
        (a, b) =>
            SHIFT_ORDER.indexOf(a.sessionType) -
            SHIFT_ORDER.indexOf(b.sessionType)
    );

    return (
        <section className="sp-day" aria-label={formatDate(day.date)}>
            <h3 className="sp-day-title">
                {formatWeekday(day.date)}, {formatDate(day.date)}
                <DayPill date={day.date} />
            </h3>

            {shifts.map((shift) => (
                <ShiftCard key={shift._id} shift={shift} />
            ))}
        </section>
    );
}

function StudentExamShifts() {
    const { data, loading, error, reload } = useStudentApi(
        '/students/me/exam-shifts'
    );

    const { upcomingDays, pastDays, counts, buffer } = useMemo(() => {
        const shifts = data?.shifts || [];
        const isPast = (shift) => (daysUntil(shift.sessionDate) ?? 0) < 0;

        const tally = {};
        shifts
            .filter((shift) => !isPast(shift))
            .forEach((shift) => {
                const type = shift.sessionType || 'Other';
                tally[type] = (tally[type] || 0) + 1;
            });

        return {
            upcomingDays: groupByDay(shifts.filter((shift) => !isPast(shift))),
            pastDays: groupByDay(shifts.filter(isPast)).reverse(),
            counts: tally,
            buffer: shifts[0]?.reportingBufferMinutes
        };
    }, [data]);

    const total = upcomingDays.length + pastDays.length;

    return (
        <div className="management-page">
            <StudentPageHeader
                title="My Exam Shifts"
                subtitle="Your morning, afternoon and evening exam shifts with reporting times."
                actions={
                    total > 0 && (
                        <button
                            type="button"
                            className="management-button secondary"
                            onClick={() => window.print()}
                        >
                            Print shifts
                        </button>
                    )
                }
            />

            {loading && <LoadingState label="Loading your exam shifts..." />}

            {error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && total === 0 && (
                <EmptyState icon="🕒" title="No shifts assigned yet">
                    Your exam shifts appear here once the timetable is
                    published for the courses you are enrolled in.
                </EmptyState>
            )}

            {Object.keys(counts).length > 0 && (
                <div className="sp-stats">
                    {SHIFT_ORDER.map((type) => (
                        <div className="sp-stat" key={type}>
                            <span>Upcoming {type.toLowerCase()} shifts</span>
                            <strong>{counts[type] || 0}</strong>
                        </div>
                    ))}
                </div>
            )}

            {upcomingDays.map((day) => (
                <DayGroup key={day.key} day={day} />
            ))}

            {upcomingDays.length > 0 && buffer && (
                <div className="sp-note">
                    Please reach your exam room at least {buffer} minutes
                    before the exam starts and carry your college ID card.
                </div>
            )}

            {pastDays.length > 0 && (
                <>
                    <h2 className="sp-day-title" style={{ marginTop: 30 }}>
                        Past shifts
                    </h2>
                    {pastDays.map((day) => (
                        <DayGroup key={day.key} day={day} />
                    ))}
                </>
            )}
        </div>
    );
}

export default StudentExamShifts;
