import { useMemo } from 'react';
import {
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

const COLUMNS = 6; // matches the seating generator (6 seats per row)
const MAX_SEATS = 45; // and its per-room limit

// A small picture of the room: every seat is a square and the student's own
// seat is highlighted, so it can be found quickly on exam day.
function SeatMap({ capacity, seatNumber, row, column }) {
    const total = Math.max(
        seatNumber,
        Math.min(Number(capacity) || 0, MAX_SEATS)
    );

    const seats = Array.from({ length: total }, (_, index) => index + 1);

    return (
        <div
            className="sp-seatmap"
            role="img"
            aria-label={`Seat map. Your seat is number ${seatNumber}, row ${row}, column ${column}.`}
        >
            <div className="sp-seatmap-board" aria-hidden="true">
                Front of the room
            </div>

            <div
                className="sp-seatmap-grid"
                style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
                aria-hidden="true"
            >
                {seats.map((number) => (
                    <div
                        key={number}
                        className={
                            number === seatNumber ? 'sp-seat mine' : 'sp-seat'
                        }
                    >
                        {number}
                    </div>
                ))}
            </div>

            <div className="sp-seatmap-legend" aria-hidden="true">
                ■ Your seat &nbsp; □ Other seats
            </div>
        </div>
    );
}

function SeatCard({ item }) {
    const past = (daysUntil(item.examSession?.sessionDate) ?? 0) < 0;
    const room = item.classroom;

    return (
        <article className={`sp-seat-card${past ? ' past' : ''}`}>
            <div className="sp-seat-head">
                <div>
                    <h3>
                        {item.course?.courseCode} · {item.course?.courseName}
                    </h3>
                    <p>
                        {formatWeekday(item.examSession?.sessionDate)},{' '}
                        {formatDate(item.examSession?.sessionDate)} ·{' '}
                        {formatTime(item.examSession?.startTime)} –{' '}
                        {formatTime(item.examSession?.endTime)}
                    </p>
                </div>

                <DayPill date={item.examSession?.sessionDate} />
            </div>

            <div className="sp-room-line">
                Room <strong>{room?.roomNumber || '-'}</strong>
                {room && <> · {formatLocation(room)}</>}
            </div>

            <dl className="sp-seat-key">
                <div>
                    <dt>Seat</dt>
                    <dd>{item.seatNumber}</dd>
                </div>
                <div>
                    <dt>Row</dt>
                    <dd>{item.row}</dd>
                </div>
                <div>
                    <dt>Column</dt>
                    <dd>{item.column}</dd>
                </div>
            </dl>

            <SeatMap
                capacity={room?.capacity}
                seatNumber={item.seatNumber}
                row={item.row}
                column={item.column}
            />

            <div className="sp-room-line">
                <SessionPill type={item.examSession?.sessionType} />{' '}
                Report by <strong>{formatTime(item.reportingTime)}</strong>
            </div>
        </article>
    );
}

function StudentSittingPlan() {
    const { data, loading, error, reload } = useStudentApi(
        '/students/me/sitting-plan'
    );

    const { upcoming, past } = useMemo(() => {
        const plan = data?.seatingPlan || [];

        return {
            upcoming: plan.filter(
                (item) => (daysUntil(item.examSession?.sessionDate) ?? 0) >= 0
            ),
            past: plan.filter(
                (item) => (daysUntil(item.examSession?.sessionDate) ?? 0) < 0
            )
        };
    }, [data]);

    return (
        <div className="management-page">
            <StudentPageHeader
                title="My Sitting Plan"
                subtitle="Your examination room and seat for every exam."
                actions={
                    upcoming.length + past.length > 0 && (
                        <button
                            type="button"
                            className="management-button secondary"
                            onClick={() => window.print()}
                        >
                            Print sitting plan
                        </button>
                    )
                }
            />

            {loading && <LoadingState label="Loading your sitting plan..." />}

            {error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && upcoming.length + past.length === 0 && (
                <EmptyState icon="🪑" title="Seats not allotted yet">
                    Your sitting plan has not been published. It appears here
                    as soon as the examination office allots your room and
                    seat for each exam.
                </EmptyState>
            )}

            {upcoming.length > 0 && (
                <>
                    <h2 className="sp-day-title">Upcoming exams</h2>
                    <div className="sp-seat-grid">
                        {upcoming.map((item) => (
                            <SeatCard key={item._id} item={item} />
                        ))}
                    </div>
                </>
            )}

            {past.length > 0 && (
                <>
                    <h2 className="sp-day-title" style={{ marginTop: 28 }}>
                        Past exams
                    </h2>
                    <div className="sp-seat-grid">
                        {past.map((item) => (
                            <SeatCard key={item._id} item={item} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default StudentSittingPlan;
