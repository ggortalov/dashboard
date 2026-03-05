import './StatusBadge.css';

const statusColors = {
  Passed: 'var(--status-passed)',
  Failed: 'var(--status-failed)',
  Blocked: 'var(--status-blocked)',
  Retest: 'var(--status-retest)',
  Untested: 'var(--status-untested)',
};

export default function StatusBadge({ status, size = 'md' }) {
  const color = statusColors[status] || 'var(--status-untested)';

  return (
    <span className={`status-badge status-badge-${size}`} style={{ backgroundColor: color }}>
      {status}
    </span>
  );
}
