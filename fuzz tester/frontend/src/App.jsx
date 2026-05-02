import { useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  if (!showDashboard) {
    return <LandingPage onLaunch={() => setShowDashboard(true)} />
  }

  return <Dashboard />
}
