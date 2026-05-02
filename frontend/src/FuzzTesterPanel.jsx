import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Play, Square, Trash2, Search, Download, Zap,
  AlertTriangle, CheckCircle, Activity, Terminal, RefreshCw,
  ChevronDown, ChevronRight, Copy, Check
} from 'lucide-react';

const FUZZ_API = 'http://localhost:8001';
const POLL_MS = 800;

// ── Severity helpers ──────────────────────────────────────────────────────────

const SEV_COLOR = {
  CRITICAL: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', dot: '#ef4444' },
  HIGH:     { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', dot: '#f97316' },
  MEDIUM:   { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-[#F6CC63]', dot: '#eab308' },
  LOW:      { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: '#22c55e' },
};

function SevBadge({ severity }) {
  const s = SEV_COLOR[severity] || SEV_COLOR.LOW;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${s.bg} ${s.border} ${s.text}`}>
      {severity}
    </span>
  );
}

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(ts).toLocaleTimeString();
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, danger }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-mono font-bold ${danger ? 'text-red-400' : accent ? 'text-[#F6CC63]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

// ── Live Attack Terminal ───────────────────────────────────────────────────────

function LiveTerminal({ logs }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div className="bg-[#020c18] rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-[#020c18]">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-[#F6CC63]" />
        <span className="w-3 h-3 rounded-full bg-emerald-500" />
        <span className="ml-2 text-xs text-white/40 font-mono">Live Attack Stream</span>
        <Activity className="w-3 h-3 text-emerald-400 ml-auto animate-pulse" />
      </div>
      <div className="h-44 overflow-y-auto font-mono text-[11px] p-3 space-y-0.5">
        {logs.length === 0 && (
          <div className="text-white/20 text-center pt-12">Waiting for fuzzer to start…</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className={`flex items-center gap-2 ${log.crash ? 'text-red-400' : 'text-white/50'}`}>
            <span className="text-white/20 shrink-0">[{new Date().toLocaleTimeString()}]</span>
            <span className={`shrink-0 font-bold ${log.method === 'GET' ? 'text-blue-400' : 'text-[#F6CC63]'}`}>{log.method}</span>
            <span className="truncate">{log.url}</span>
            <span className={`shrink-0 font-bold ${log.status >= 500 ? 'text-red-400' : log.status >= 400 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {log.status}
            </span>
            {log.crash && <span className="shrink-0 px-1 bg-red-500/30 rounded text-red-300">CRASH</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Crash Feed ────────────────────────────────────────────────────────────────

function CrashFeed({ crashes, selectedId, onSelect }) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '380px' }}>
      {crashes.length === 0 && (
        <div className="text-white/30 text-sm text-center py-8">No crashes logged yet</div>
      )}
      {crashes.map((c) => {
        const s = SEV_COLOR[c.severity] || SEV_COLOR.LOW;
        const isSelected = selectedId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(isSelected ? null : c.id)}
            className={`text-left w-full p-3 rounded-xl border transition-all ${
              isSelected
                ? `${s.bg} ${s.border} ring-1 ring-white/20`
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <SevBadge severity={c.severity} />
              <span className="text-[10px] text-white/30">{relativeTime(c.timestamp)}</span>
            </div>
            <div className="text-xs font-bold text-white/80 mt-1">{c.crash_type}</div>
            <div className="text-[10px] text-white/40 font-mono truncate">{c.endpoint}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Crash Detail ──────────────────────────────────────────────────────────────

function CrashDetail({ crashId, fetchCrashDetail }) {
  const [detail, setDetail] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!crashId) { setDetail(null); return; }
    fetchCrashDetail(crashId).then(setDetail).catch(() => setDetail(null));
  }, [crashId, fetchCrashDetail]);

  const copy = () => {
    navigator.clipboard.writeText(detail?.reproduction_steps || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!crashId) return (
    <div className="flex items-center justify-center h-full text-white/20 text-sm flex-col gap-2">
      <Shield className="w-8 h-8 opacity-20" />
      <span>Select a crash to inspect it</span>
    </div>
  );

  if (!detail) return (
    <div className="flex items-center justify-center h-full text-white/20 text-sm">Loading…</div>
  );

  const chainSteps = (detail.failure_chain || '').split('\n').filter(Boolean);
  let payloadStr;
  try { payloadStr = JSON.stringify(JSON.parse(detail.input_payload), null, 2); }
  catch { payloadStr = detail.input_payload; }

  return (
    <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '380px' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">Crash Detail</span>
        <SevBadge severity={detail.severity} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Type', value: detail.crash_type },
          { label: 'HTTP Status', value: detail.http_status ?? 'N/A' },
          { label: 'Endpoint', value: detail.endpoint },
          { label: 'Time', value: new Date(detail.timestamp).toLocaleTimeString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.04] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">{label}</div>
            <div className="text-xs font-mono text-white/80 break-all">{value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Fuzz Payload</div>
        <pre className="bg-[#020c18] rounded-lg p-3 text-[10px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
          {payloadStr}
        </pre>
      </div>

      {detail.response_body && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Server Response</div>
          <pre className="bg-[#020c18] rounded-lg p-3 text-[10px] font-mono text-red-300 overflow-x-auto whitespace-pre-wrap max-h-24">
            {detail.response_body}
          </pre>
        </div>
      )}

      {chainSteps.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Failure Chain</div>
          <div className="space-y-1.5">
            {chainSteps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center text-white/60 font-bold">{i + 1}</span>
                <span className="text-[11px] text-white/60">{step.replace(/^\d+\.\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {detail.reproduction_steps && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-wider text-white/30">Reproduction Steps</div>
            <button onClick={copy} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="bg-[#020c18] rounded-lg p-3 text-[10px] font-mono text-[#F6CC63]/80 overflow-x-auto whitespace-pre-wrap">
            {detail.reproduction_steps}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Severity Chart Bar ────────────────────────────────────────────────────────

function SevBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-white/60 w-6 text-right">{count}</span>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function FuzzTesterPanel() {
  const [status, setStatus] = useState({ running: false, inputs_sent: 0, crashes_found: 0, elapsed_seconds: 0 });
  const [crashes, setCrashes] = useState([]);
  const [report, setReport] = useState({ total: 0, by_severity: {}, by_endpoint: {} });
  const [logs, setLogs] = useState([]);
  const [targetUrl, setTargetUrl] = useState('http://localhost:8000');
  const [authHeaders, setAuthHeaders] = useState('{"Authorization": "Bearer token_here"}');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedCrashId, setSelectedCrashId] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null); // null = unknown
  const [activeTab, setActiveTab] = useState('crashes'); // 'crashes' | 'terminal'
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [s, c, r] = await Promise.all([
        fetch(`${FUZZ_API}/fuzz/status`).then(r => r.json()),
        fetch(`${FUZZ_API}/fuzz/crashes`).then(r => r.json()),
        fetch(`${FUZZ_API}/fuzz/report`).then(r => r.json()),
      ]);
      setStatus(s);
      setCrashes(c);
      setReport(r);
      if (s.recent_logs) setLogs(s.recent_logs);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  const startFuzzing = async (useDiscovery = false) => {
    try {
      if (useDiscovery) {
        setIsDiscovering(true);
        try {
          await fetch(`${FUZZ_API}/fuzz/discover`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base_url: targetUrl }),
          });
        } catch {
          await fetch(`${FUZZ_API}/fuzz/target`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base_url: targetUrl }),
          });
        }
        setIsDiscovering(false);
      } else {
        await fetch(`${FUZZ_API}/fuzz/target`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base_url: targetUrl }),
        });
      }
      let headersObj = {};
      try { headersObj = JSON.parse(authHeaders); } catch {}
      await fetch(`${FUZZ_API}/fuzz/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers: headersObj }),
      });
      fetchAll();
    } catch (e) {
      setIsDiscovering(false);
      alert(`Could not start fuzzer: ${e.message}`);
    }
  };

  const stopFuzzing = async () => {
    await fetch(`${FUZZ_API}/fuzz/stop`, { method: 'POST' });
    fetchAll();
  };

  const clearData = async () => {
    await fetch(`${FUZZ_API}/fuzz/clear`, { method: 'POST' });
    setCrashes([]); setReport({ total: 0, by_severity: {}, by_endpoint: {} }); setLogs([]);
    fetchAll();
  };

  const fetchCrashDetail = async (id) => {
    const res = await fetch(`${FUZZ_API}/fuzz/crashes/${id}`);
    return res.json();
  };

  const downloadReport = async () => {
    try {
      setIsGeneratingReport(true);
      const res = await fetch(`${FUZZ_API}/fuzz/generate-report`);
      const { report_markdown } = await res.json();
      const blob = new Blob([report_markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `RakshaChain_FuzzReport_${Date.now()}.md`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Report generation failed: ${e.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const elapsed = status.elapsed_seconds;
  const elapsedStr = elapsed > 0
    ? `${Math.floor(elapsed / 60)}m ${Math.floor(elapsed % 60)}s`
    : '—';

  const sevTotal = Object.values(report.by_severity || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="mb-10 space-y-6">
      {/* Header */}
      <div className="bg-[#032360] rounded-2xl p-8 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-3 text-white">
            <Zap className="text-[#F6CC63] w-6 h-6" />
            AI Fuzz Tester
            <span className="text-xs font-sans font-normal text-white/30 ml-1">— Blockchain Security Layer</span>
          </h2>

          {/* Online indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
            backendOnline === null ? 'border-white/10 text-white/30' :
            backendOnline ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' :
            'border-red-500/40 bg-red-500/10 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              backendOnline === null ? 'bg-white/20' :
              backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`} />
            {backendOnline === null ? 'Connecting…' : backendOnline ? 'Fuzzer Online' : 'Fuzzer Offline'}
          </div>
        </div>

        {/* Config row */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="flex-[2] bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F6CC63] font-mono"
            placeholder="Target URL — e.g. http://localhost:8000"
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            disabled={status.running}
          />
          <input
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-[11px] focus:outline-none focus:border-[#F6CC63] font-mono"
            placeholder='Auth Headers JSON — {"Authorization": "Bearer ..."}'
            value={authHeaders}
            onChange={e => setAuthHeaders(e.target.value)}
            disabled={status.running}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => startFuzzing(true)}
            disabled={status.running || isDiscovering || !backendOnline}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md"
          >
            <Search className="w-4 h-4" />
            {isDiscovering ? 'Discovering…' : 'Discover & Fuzz'}
          </button>

          <button
            onClick={() => startFuzzing(false)}
            disabled={status.running || isDiscovering || !backendOnline}
            className="flex items-center gap-2 bg-[#F6CC63] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-[#032360] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md"
          >
            <Play className="w-4 h-4" />
            Start (Config)
          </button>

          <button
            onClick={stopFuzzing}
            disabled={!status.running}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>

          <button
            onClick={clearData}
            disabled={status.running}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-white/60 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          <button
            onClick={downloadReport}
            disabled={status.running || isGeneratingReport || crashes.length === 0}
            className="flex items-center gap-2 ml-auto bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-white/60 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            {isGeneratingReport ? 'Generating…' : 'Download AI Report'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-xl p-4 flex flex-col gap-1 border ${status.running ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status.running ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-sm font-bold ${status.running ? 'text-emerald-400' : 'text-white/40'}`}>
              {status.running ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
        <StatCard label="Inputs Sent" value={status.inputs_sent.toLocaleString()} accent />
        <StatCard label="Crashes Found" value={status.crashes_found.toLocaleString()} danger={status.crashes_found > 0} />
        <StatCard label="Elapsed" value={elapsedStr} />
      </div>

      {/* Main grid: crash feed + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: crash feed + tabs */}
        <div className="bg-[#032360] rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setActiveTab('crashes')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'crashes' ? 'bg-[#F6CC63]/20 text-[#F6CC63]' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Crash Feed ({crashes.length})
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'terminal' ? 'bg-[#F6CC63]/20 text-[#F6CC63]' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Live Stream
            </button>
          </div>

          {activeTab === 'crashes' && (
            <CrashFeed crashes={crashes} selectedId={selectedCrashId} onSelect={setSelectedCrashId} />
          )}
          {activeTab === 'terminal' && (
            <LiveTerminal logs={logs} />
          )}
        </div>

        {/* Right: crash detail */}
        <div className="bg-[#032360] rounded-2xl p-6 border border-white/10 shadow-xl min-h-[300px]">
          <CrashDetail crashId={selectedCrashId} fetchCrashDetail={fetchCrashDetail} />
        </div>
      </div>

      {/* Severity breakdown */}
      {sevTotal > 0 && (
        <div className="bg-[#032360] rounded-2xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Vulnerability Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {Object.entries(SEV_COLOR).map(([sev, style]) => (
                <SevBar
                  key={sev}
                  label={sev}
                  count={report.by_severity?.[sev] || 0}
                  total={sevTotal}
                  color={style.dot}
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">By Endpoint</div>
              {Object.entries(report.by_endpoint || {}).slice(0, 6).map(([ep, count]) => (
                <div key={ep} className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/50 truncate flex-1">{ep.replace(/^(GET|POST|PUT|DELETE)\s/, '').replace('/api/', '/')}</span>
                  <span className="text-[11px] font-bold text-[#F6CC63] ml-3">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backend offline notice */}
      {backendOnline === false && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-bold text-sm mb-1">Fuzz Tester Backend Offline</p>
            <p className="text-red-300/60 text-xs">
              Start the FastAPI server from <code className="bg-white/10 px-1 rounded">fuzz tester/backend/</code> with:
              <br />
              <code className="text-red-200/80">uvicorn main:app --port 8001 --reload</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
