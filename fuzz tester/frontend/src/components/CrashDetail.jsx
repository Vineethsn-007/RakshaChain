import { useState, useEffect } from 'react'

const SEV_LABELS = {
  CRITICAL: '🔴 System crash — fund tracking stopped',
  HIGH:     '🟠 Internal logic exposed to attacker',
  MEDIUM:   '🟡 Denial-of-service vector possible',
  LOW:      '🟢 Poor error handling / UX issue',
}

export default function CrashDetail({ crashId, getCrashDetail }) {
  const [detail, setDetail] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!crashId) { setDetail(null); return }
    getCrashDetail(crashId).then(setDetail).catch(() => setDetail(null))
  }, [crashId, getCrashDetail])

  if (!crashId) {
    return (
      <div className="crash-detail-panel">
        <div className="panel-header">
          <span className="panel-title">Crash Detail</span>
        </div>
        <div className="crash-detail-scroll">
          <div className="no-selection">
            <span className="ns-icon">🕵️</span>
            <span>Select a crash from the feed to inspect it</span>
          </div>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="crash-detail-panel">
        <div className="panel-header"><span className="panel-title">Crash Detail</span></div>
        <div className="crash-detail-scroll">
          <div className="no-selection"><span>Loading…</span></div>
        </div>
      </div>
    )
  }

  const chainSteps = (detail.failure_chain || '').split('\n').filter(Boolean)
  const payloadObj = (() => {
    try { return JSON.parse(detail.input_payload) } catch { return detail.input_payload }
  })()

  const copyRepro = () => {
    navigator.clipboard.writeText(detail.reproduction_steps || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="crash-detail-panel">
      <div className="panel-header">
        <span className="panel-title">Crash Detail</span>
        <span className={`sev-badge ${detail.severity}`}>{detail.severity}</span>
      </div>

      <div className="crash-detail-scroll">
        {/* Overview */}
        <div className="detail-section">
          <div className="detail-section-title">Overview</div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="detail-field-label">Crash Type</div>
              <div className="detail-field-value">{detail.crash_type}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">HTTP Status</div>
              <div className="detail-field-value" style={{color: detail.http_status >= 500 ? 'var(--critical)' : 'inherit'}}>
                {detail.http_status ?? 'N/A'}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Endpoint</div>
              <div className="detail-field-value">{detail.endpoint}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Timestamp</div>
              <div className="detail-field-value">{new Date(detail.timestamp).toLocaleString()}</div>
            </div>
          </div>
          {/* Severity explanation */}
          <div style={{marginTop: '10px', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)'}}>
            {SEV_LABELS[detail.severity] || 'Anomaly detected'}
          </div>
        </div>

        {/* Input Payload */}
        <div className="detail-section">
          <div className="detail-section-title">Fuzz Payload That Caused Crash</div>
          <pre className="code-block">
            {JSON.stringify(payloadObj, null, 2)}
          </pre>
        </div>

        {/* Response */}
        {detail.response_body && (
          <div className="detail-section">
            <div className="detail-section-title">Server Response</div>
            <pre className="code-block" style={{color: '#fca5a5', maxHeight: '120px', overflow: 'auto'}}>
              {detail.response_body}
            </pre>
          </div>
        )}

        {/* Failure Chain */}
        <div className="detail-section">
          <div className="detail-section-title">Input-to-Failure Chain</div>
          <div>
            {chainSteps.map((step, i) => {
              const clean = step.replace(/^\d+\.\s*/, '')
              return (
                <div className="chain-step" key={i}>
                  <div className="chain-step-num">{i + 1}</div>
                  <div className="chain-step-text">{clean}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reproduction */}
        <div className="detail-section">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px'}}>
            <div className="detail-section-title" style={{marginBottom:0, borderBottom:'none', paddingBottom:0}}>Reproduction Steps</div>
            <button className="copy-btn" onClick={copyRepro}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <pre className="code-block" style={{color: '#86efac'}}>
            {detail.reproduction_steps}
          </pre>
        </div>
      </div>
    </div>
  )
}
