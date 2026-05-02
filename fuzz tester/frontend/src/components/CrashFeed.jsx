import CrashCard from './CrashCard.jsx'

export default function CrashFeed({ crashes, selectedId, onSelect }) {
  return (
    <div className="crash-feed-panel">
      <div className="panel-header">
        <span className="panel-title">Live Crash Feed</span>
        {crashes.length > 0 && (
          <span className="crash-count-badge">{crashes.length}</span>
        )}
      </div>

      <div className="crash-list">
        {crashes.length === 0 ? (
          <div className="empty-feed">
            <span className="empty-icon">🔍</span>
            <span>No crashes yet — start fuzzing to begin</span>
          </div>
        ) : (
          crashes.map(c => (
            <CrashCard
              key={c.id}
              crash={c}
              selected={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
