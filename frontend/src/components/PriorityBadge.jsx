const priorityColors = {
  Critical: 'var(--priority-critical)',
  High: 'var(--priority-high)',
  Medium: 'var(--priority-medium)',
  Low: 'var(--priority-low)',
};

export default function PriorityBadge({ priority }) {
  const color = priorityColors[priority] || 'var(--priority-medium)';
  return (
    <span style={{
      color,
      fontWeight: 600,
      fontSize: '12px',
    }}>
      {priority}
    </span>
  );
}
