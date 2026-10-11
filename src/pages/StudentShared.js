import { useNavigate } from 'react-router-dom';
import { daysUntil, relativeDay } from '../studentPortal.js';
import './Management.css';
import './StudentPortal.css';

export function StudentPageHeader({ title, subtitle, actions }) {
    const navigate = useNavigate();

    return (
        <div className="management-header">
            <div>
                <h1>{title}</h1>
                <p className="sp-subtitle">{subtitle}</p>
            </div>

            <div className="sp-header-actions sp-no-print">
                {actions}

                <button
                    type="button"
                    className="management-button"
                    onClick={() => navigate('/student')}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export function LoadingState({ label = 'Loading your details...' }) {
    return (
        <div className="sp-state" role="status" aria-live="polite">
            <div className="sp-skeleton" style={{ width: '60%', margin: '0 auto 12px' }} />
            <div className="sp-skeleton" style={{ width: '40%', margin: '0 auto' }} />
            <p style={{ marginTop: 16 }}>{label}</p>
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    return (
        <div className="sp-state error" role="alert">
            <div className="sp-state-icon" aria-hidden="true">⚠️</div>
            <h3>We couldn&apos;t load this page</h3>
            <p>{message}</p>

            {onRetry && (
                <button
                    type="button"
                    className="management-button"
                    onClick={onRetry}
                >
                    Try again
                </button>
            )}
        </div>
    );
}

export function EmptyState({ icon = '📭', title, children }) {
    return (
        <div className="sp-state">
            <div className="sp-state-icon" aria-hidden="true">{icon}</div>
            <h3>{title}</h3>
            <p>{children}</p>
        </div>
    );
}

// Today / Tomorrow / In 5 days / 3 days ago — coloured by how close it is.
export function DayPill({ date }) {
    const days = daysUntil(date);

    if (days === null) return null;

    let tone = 'later';

    if (days < 0) tone = 'past';
    else if (days === 0) tone = 'today';
    else if (days <= 3) tone = 'soon';

    return <span className={`sp-pill ${tone}`}>{relativeDay(date)}</span>;
}

export function SessionPill({ type }) {
    if (!type) return null;

    return (
        <span className={`sp-pill ${String(type).toLowerCase()}`}>
            {type}
        </span>
    );
}
