const priorityStyles = {
  Critical: { color: 'var(--priority-critical)', bg: 'var(--priority-critical-bg)' },
  High:     { color: 'var(--priority-high)',     bg: 'var(--priority-high-bg)' },
  Medium:   { color: 'var(--priority-medium)',   bg: 'var(--priority-medium-bg)' },
  Low:      { color: 'var(--priority-low)',      bg: 'var(--priority-low-bg)' },
};

export default function PriorityBadge({ priority }) {
  const style = priorityStyles[priority] || priorityStyles.Medium;
  return (
    <span style={{
      color: style.color,
      backgroundColor: style.bg,
      fontWeight: 600,
      fontSize: '12px',
      padding: '3px 10px',
      borderRadius: '9999px',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: 1,
    }}>
      {priority}
    </span>
  );
}
