import { useState } from 'react'
import { useFuzzer } from '../hooks/useFuzzer.js'
import ControlBar from './ControlBar.jsx'
import CrashFeed from './CrashFeed.jsx'
import CrashDetail from './CrashDetail.jsx'
import SummaryCharts from './SummaryCharts.jsx'
import AttackTerminal from './AttackTerminal.jsx'

export default function Dashboard() {
  const {
    status, crashes, report, logs,
    targetUrl, setTargetUrl, authHeaders, setAuthHeaders,
    isDiscovering, isGeneratingReport,
    startFuzzing, stopFuzzing, clearData, getCrashDetail, downloadReport,
  } = useFuzzer()

  const [selectedCrashId, setSelectedCrashId] = useState(null)

  return (
    <div className="app-shell">
      {/* Top: control bar + stats */}
      <ControlBar
        status={status}
        targetUrl={targetUrl}
        setTargetUrl={setTargetUrl}
        authHeaders={authHeaders}
        setAuthHeaders={setAuthHeaders}
        onStart={() => startFuzzing(false)}
        onDiscoverStart={() => startFuzzing(true)}
        isDiscovering={isDiscovering}
        onStop={stopFuzzing}
        onClear={clearData}
        onDownloadReport={downloadReport}
        isGeneratingReport={isGeneratingReport}
      />

      {/* Middle: crash feed + detail */}
      <div className="main-content">
        <CrashFeed
          crashes={crashes}
          selectedId={selectedCrashId}
          onSelect={setSelectedCrashId}
        />
        <CrashDetail
          crashId={selectedCrashId}
          getCrashDetail={getCrashDetail}
        />
      </div>

      {/* Bottom: summary charts */}
      <SummaryCharts report={report} crashes={crashes} />

      {/* Live Terminal Overlay */}
      <AttackTerminal logs={logs} />
    </div>
  )
}
