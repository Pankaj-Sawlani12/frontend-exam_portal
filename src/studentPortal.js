import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Set VITE_API_URL (e.g. http://localhost:8080) to point the student portal
// at a local backend; otherwise the deployed backend is used.
export const API_URL =
    import.meta.env.VITE_API_URL || 'https://backend-exam-paper.vercel.app';

export const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
};

/**
 * Loads one of the logged-in student's own endpoints (e.g.
 * "/students/me/exam-schedule"). Sends the JWT, sends the student back to the
 * login page when the session has expired, and exposes a reload() for the
 * "Try again" button.
 */
export function useStudentApi(path) {
    const navigate = useNavigate();
    const [state, setState] = useState({
        data: null,
        loading: true,
        error: ''
    });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return undefined;
        }

        const load = async () => {
            try {
                const response = await fetch(`${API_URL}${path}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const body = await response.json().catch(() => ({}));

                if (cancelled) return;

                if (response.status === 401) {
                    // Token expired or invalid: log in again.
                    clearSession();
                    navigate('/login', { replace: true });
                    return;
                }

                if (!response.ok) {
                    setState({
                        data: null,
                        loading: false,
                        error:
                            body.message ||
                            'Something went wrong while loading your details.'
                    });
                    return;
                }

                setState({ data: body, loading: false, error: '' });
            } catch (error) {
                console.error('Student portal request failed:', error);

                if (!cancelled) {
                    setState({
                        data: null,
                        loading: false,
                        error:
                            'Unable to connect to the server. Please check your internet connection and try again.'
                    });
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [path, attempt, navigate]);

    const reload = useCallback(() => {
        setState((previous) => ({ ...previous, loading: true, error: '' }));
        setAttempt((previous) => previous + 1);
    }, []);

    return { ...state, reload };
}

/* ---------------------------- formatting ---------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

// Session dates are stored as date-only values (midnight UTC), so they are
// read in UTC to show the exact day the admin entered in every timezone.
const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
    const date = parseDate(value);

    if (!date) return '-';

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    });
};

export const formatWeekday = (value) => {
    const date = parseDate(value);

    if (!date) return '';

    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        timeZone: 'UTC'
    });
};

// "09:30" -> "09:30 AM", "13:00" -> "01:00 PM". Anything that is not a
// recognisable time is returned unchanged.
export const formatTime = (value) => {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(
        String(value || '').trim()
    );

    if (!match) return value || '-';

    let hours = Number(match[1]);
    const minutes = match[2];
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem) {
        return `${String(hours).padStart(2, '0')}:${minutes} ${meridiem}`;
    }

    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${String(hours).padStart(2, '0')}:${minutes} ${suffix}`;
};

// Whole calendar days from today until the exam day (negative = past).
export const daysUntil = (value) => {
    const date = parseDate(value);

    if (!date) return null;

    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const examDay = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    );

    return Math.round((examDay - today) / DAY_MS);
};

export const relativeDay = (value) => {
    const days = daysUntil(value);

    if (days === null) return '';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1) return `In ${days} days`;

    return `${Math.abs(days)} days ago`;
};

export const isUpcoming = (value) => {
    const days = daysUntil(value);

    return days !== null && days >= 0;
};

export const formatFloor = (floor) => {
    if (floor === undefined || floor === null) return '';

    return Number(floor) === 0 ? 'Ground floor' : `Floor ${floor}`;
};

// "Main Block, Floor 2"
export const formatLocation = (room) => {
    if (!room) return '';

    return [room.building, formatFloor(room.floor)]
        .filter(Boolean)
        .join(', ');
};

export const cycleLabel = (cycle) => {
    if (!cycle) return 'Exam';

    return cycle.cycleName || cycle.examType || 'Exam';
};
