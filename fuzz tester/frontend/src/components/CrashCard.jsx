function relativeTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return new Date(ts).toLocaleTimeString()
}

export default function CrashCard({ crash, selected, onClick }) {
  const { severity, crash_type, endpoint, timestamp } = crash

  return (
    <div
      className={`crash-card sev-${severity} ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="crash-card-header">
        <span className={`sev-badge ${severity}`}>{severity}</span>
        <span className="crash-time">{relativeTime(timestamp)}</span>
      </div>
      <div className="crash-type">{crash_type}</div>
      <div className="crash-endpoint">{endpoint}</div>
    </div>
  )
}
