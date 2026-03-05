import './PriorityBadge.css';

const priorityStyles = {
  Critical: { color: 'var(--priority-critical)', bg: 'var(--priority-critical-bg)' },
  High:     { color: 'var(--priority-high)',     bg: 'var(--priority-high-bg)' },
  Medium:   { color: 'var(--priority-medium)',   bg: 'var(--priority-medium-bg)' },
  Low:      { color: 'var(--priority-low)',      bg: 'var(--priority-low-bg)' },
};

export default function PriorityBadge({ priority }) {
  const style = priorityStyles[priority] || priorityStyles.Medium;
  return (
    <span
      className="priority-badge"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {priority}
    </span>
  );
}