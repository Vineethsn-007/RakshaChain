export default function ControlBar({
  status, targetUrl, setTargetUrl, authHeaders, setAuthHeaders,
  onStart, onDiscoverStart, isDiscovering, onStop, onClear,
  onDownloadReport, isGeneratingReport
}) {
  const { running, inputs_sent, crashes_found, elapsed_seconds } = status

  return (
    <>
      <div className="topbar">
        <div className="topbar-brand">
          <div className="logo-icon">🛡️</div>
          <div>
            <h1>AI Fuzz Tester</h1>
            <span>Blockchain Security Layer</span>
          </div>
        </div>

        <div className="topbar-controls">
          <input
            id="target-url-input"
            className="url-input"
            type="text"
            placeholder="Target URL — e.g. http://localhost:8000"
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            disabled={running}
            style={{flex: 2}}
          />

          <input
            id="auth-headers-input"
            className="url-input"
            type="text"
            placeholder='Auth Headers (JSON) — {"Authorization": "Bearer ..."}'
            value={authHeaders}
            onChange={e => setAuthHeaders(e.target.value)}
            disabled={running}
            style={{flex: 1, fontSize: '11px', opacity: 0.8}}
          />

          <button
            id="btn-discover"
            className="btn btn-start"
            style={{background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}
            onClick={onDiscoverStart}
            disabled={running || isDiscovering}
          >
            {isDiscovering ? '⏳ Discovering...' : '🔍 Discover & Fuzz'}
          </button>

          <button
            id="btn-start"
            className="btn btn-start"
            onClick={onStart}
            disabled={running || isDiscovering}
          >
            ▶ Start (Config)
          </button>

          <button
            id="btn-stop"
            className="btn btn-stop"
            onClick={onStop}
            disabled={!running}
          >
            ⏹ Stop
          </button>

          <button
            id="btn-clear"
            className="btn btn-clear"
            onClick={onClear}
            disabled={running}
          >
            🗑 Clear
          </button>

          <button
            id="btn-download"
            className="btn"
            style={{background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', marginLeft: 'auto'}}
            onClick={onDownloadReport}
            disabled={running || isGeneratingReport || crashes_found === 0}
          >
            {isGeneratingReport ? '⏳ Generating...' : '📄 Download AI Report'}
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span className={`status-badge ${running ? 'running' : 'stopped'}`}>
            {running && <span className="pulse-dot" />}
            {running ? 'Running' : 'Stopped'}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Inputs Sent</span>
          <span className="stat-value accent">{inputs_sent.toLocaleString()}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Crashes Found</span>
          <span className={`stat-value ${crashes_found > 0 ? 'red' : 'default'}`}>
            {crashes_found.toLocaleString()}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Elapsed</span>
          <span className="stat-value default">
            {elapsed_seconds > 0
              ? `${Math.floor(elapsed_seconds / 60)}m ${Math.floor(elapsed_seconds % 60)}s`
              : '—'}
          </span>
        </div>
      </div>
    </>
  )
}
