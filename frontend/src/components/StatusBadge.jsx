import './StatusBadge.css';

const statusStyles = {
  Passed:   { color: 'var(--status-passed)',   bg: 'var(--status-passed-bg)' },
  Failed:   { color: 'var(--status-failed)',   bg: 'var(--status-failed-bg)' },
  Blocked:  { color: 'var(--status-blocked)',  bg: 'var(--status-blocked-bg)' },
  Retest:   { color: 'var(--status-retest)',   bg: 'var(--status-retest-bg)' },
  Untested: { color: 'var(--status-untested)', bg: 'var(--status-untested-bg)' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const style = statusStyles[status] || statusStyles.Untested;

  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}
