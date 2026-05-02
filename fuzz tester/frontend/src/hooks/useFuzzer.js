import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

const API = 'http://localhost:8001'
const POLL_MS = 500

export function useFuzzer() {
  const [status, setStatus]   = useState({ running: false, inputs_sent: 0, crashes_found: 0, elapsed_seconds: 0 })
  const [crashes, setCrashes] = useState([])
  const [report, setReport]   = useState({ total: 0, by_severity: {}, by_endpoint: {} })
  const [targetUrl, setTargetUrl] = useState('http://localhost:8000')
  const [authHeaders, setAuthHeaders] = useState('{"Authorization": "Bearer token_here"}')
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [logs, setLogs] = useState([])
  const intervalRef = useRef(null)

  const fetchAll = useCallback(async () => {
    try {
      const [s, c, r] = await Promise.all([
        axios.get(`${API}/fuzz/status`),
        axios.get(`${API}/fuzz/crashes`),
        axios.get(`${API}/fuzz/report`),
      ])
      setStatus(s.data)
      setCrashes(c.data)
      setReport(r.data)
      if (s.data.recent_logs) setLogs(s.data.recent_logs)
    } catch (_) {
      // server might not be up yet — silently retry
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(fetchAll, POLL_MS)
  }, [fetchAll])

  const stopPolling = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  useEffect(() => {
    fetchAll()
    startPolling()
    return stopPolling
  }, [fetchAll, startPolling, stopPolling])

  const startFuzzing = useCallback(async (useDiscovery = false) => {
    try {
      if (useDiscovery) {
        setIsDiscovering(true)
        try {
            await axios.post(`${API}/fuzz/discover`, { base_url: targetUrl })
        } catch (e) {
            console.error("Discovery failed, falling back to basic target set", e)
            await axios.post(`${API}/fuzz/target`, { base_url: targetUrl })
        }
        setIsDiscovering(false)
      } else {
        await axios.post(`${API}/fuzz/target`, { base_url: targetUrl })
      }
      
      let headersObj = {}
      try {
        headersObj = JSON.parse(authHeaders)
      } catch (e) {
        console.warn("Could not parse auth headers as JSON, sending empty", e)
      }

      await axios.post(`${API}/fuzz/start`, { headers: headersObj })
      fetchAll()
    } catch (e) {
      setIsDiscovering(false)
      alert(`Could not start fuzzer: ${e.message}`)
    }
  }, [targetUrl, fetchAll])

  const stopFuzzing = useCallback(async () => {
    try {
      await axios.post(`${API}/fuzz/stop`)
      fetchAll()
    } catch (e) {
      alert(`Could not stop fuzzer: ${e.message}`)
    }
  }, [fetchAll])

  const clearData = useCallback(async () => {
    try {
      await axios.post(`${API}/fuzz/clear`)
      fetchAll()
    } catch (e) {
      alert(`Could not clear data: ${e.message}`)
    }
  }, [fetchAll])

  const getCrashDetail = useCallback(async (id) => {
    const res = await axios.get(`${API}/fuzz/crashes/${id}`)
    return res.data
  }, [])

  const downloadReport = useCallback(async () => {
    try {
      setIsGeneratingReport(true)
      const res = await axios.get(`${API}/fuzz/generate-report`)
      const markdown = res.data.report_markdown
      
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Fuzz_Report_${new Date().getTime()}.md`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert(`Could not generate report: ${e.message}`)
    } finally {
      setIsGeneratingReport(false)
    }
  }, [])

  return {
    status, crashes, report, logs,
    targetUrl, setTargetUrl, authHeaders, setAuthHeaders, 
    isDiscovering, isGeneratingReport,
    startFuzzing, stopFuzzing, clearData, getCrashDetail, downloadReport,
  }
}
