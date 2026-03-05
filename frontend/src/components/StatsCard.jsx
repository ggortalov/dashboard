import './StatsCard.css';

export default function StatsCard({ label, value, color }) {
  return (
    <div className="stats-card">
      <div className="stats-card-value" style={color ? { color } : {}}>
        {value}
      </div>
      <div className="stats-card-label">{label}</div>
    </div>
  );
}
