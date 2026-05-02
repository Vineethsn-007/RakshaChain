import React from 'react';

export default function AttackTerminal({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="attack-terminal">
      <div className="terminal-header">
        <span className="terminal-dot red"></span>
        <span className="terminal-dot yellow"></span>
        <span className="terminal-dot green"></span>
        <span className="terminal-title">Live Attack Stream</span>
      </div>
      <div className="terminal-body">
        {logs.map((log) => (
          <div key={log.id} className={`terminal-line ${log.crash ? 'crash' : ''}`}>
            <span className="line-time">[{new Date().toLocaleTimeString()}]</span>
            <span className="line-method">{log.method}</span>
            <span className="line-url">{log.url}</span>
            <span className="line-status">HTTP {log.status}</span>
            {log.crash && <span className="line-crash">CRASH DETECTED</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
