export default function StatusBadge({ status }) {
  const value = String(status || 'unknown').toLowerCase();
  return <span className={`status-badge status-${value.replace(/[^a-z]+/g, '-')}`}>{value.replaceAll('_', ' ')}</span>;
}
