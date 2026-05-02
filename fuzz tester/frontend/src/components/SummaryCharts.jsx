import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts'

const SEV_COLORS = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#22c55e',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  )
}

export default function SummaryCharts({ report, crashes }) {
  // Pie data — by severity
  const pieData = Object.entries(report.by_severity || {}).map(([name, value]) => ({ name, value }))

  // Bar data — by endpoint (shorten labels)
  const barData = Object.entries(report.by_endpoint || {}).map(([ep, count]) => ({
    endpoint: ep.replace(/^(GET|POST|PUT|DELETE)\s/, '').replace('/api/', '/'),
    count,
  }))

  // Timeline — last 60 crashes, group by second for real-time feel
  const timelineData = (() => {
    if (!crashes.length) return []
    const buckets = {}
    // Take the most recent 60 crashes to build the timeline
    crashes.slice(0, 60).forEach(c => {
      const d = new Date(c.timestamp)
      // Group by second for high-frequency updates
      const key = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      buckets[key] = (buckets[key] || 0) + 1
    })
    return Object.entries(buckets)
      .map(([time, crashes]) => ({ time, crashes }))
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-20) // Show last 20 seconds of activity
  })()

  return (
    <div className="charts-bar">
      {/* Pie — severity split */}
      <div className="chart-box">
        <div className="chart-title">Crashes by Severity</div>
        {pieData.length === 0
          ? <div style={{color:'var(--text-muted)',fontSize:12,paddingTop:8}}>No data yet</div>
          : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={60} 
                  label={({name,value})=>`${name} ${value}`} 
                  labelLine={false} 
                  fontSize={10}
                  isAnimationActive={false}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={SEV_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )
        }
      </div>

      {/* Bar — crashes per endpoint */}
      <div className="chart-box">
        <div className="chart-title">Crashes by Endpoint</div>
        {barData.length === 0
          ? <div style={{color:'var(--text-muted)',fontSize:12,paddingTop:8}}>No data yet</div>
          : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{top:4, right:4, left:-20, bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="endpoint" tick={{fill:'#8899b4', fontSize:9}} />
                <YAxis tick={{fill:'#8899b4', fontSize:9}} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Crashes" 
                  fill="#3b82f6" 
                  radius={[4,4,0,0]} 
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </div>

      {/* Line — crash timeline */}
      <div className="chart-box">
        <div className="chart-title">Crash Timeline</div>
        {timelineData.length === 0
          ? <div style={{color:'var(--text-muted)',fontSize:12,paddingTop:8}}>No data yet</div>
          : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={timelineData} margin={{top:4, right:4, left:-20, bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="time" tick={{fill:'#8899b4', fontSize:9}} />
                <YAxis tick={{fill:'#8899b4', fontSize:9}} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="crashes" 
                  name="Crashes" 
                  stroke="#ef4444" 
                  dot={false} 
                  strokeWidth={2} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        }
      </div>
    </div>
  )
}
