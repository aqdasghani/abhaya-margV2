import { useEffect, useState } from 'react'
import { subscribeToTourists, subscribeToIncidents } from '../../firebase/adminService'

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent || 'text-gray-800'}`}>{value}</p>
    </div>
  )
}

function AdminOverview() {
  const [tourists, setTourists] = useState([])
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    const unsubTourists = subscribeToTourists(setTourists)
    const unsubIncidents = subscribeToIncidents(setIncidents)
    return () => {
      unsubTourists()
      unsubIncidents()
    }
  }, [])

  const totalTourists = tourists.length
  const activeTourists = tourists.filter((t) => t.status === 'ACTIVE').length
  const lostTourists = tourists.filter((t) => t.status === 'LOST').length
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE').length
  const sosIncidents = incidents.filter((i) => i.incidentType === 'SOS').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
        <p className="text-gray-500 text-sm">Live statistics from Firestore.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Tourists" value={totalTourists} />
        <StatCard label="Active Tourists" value={activeTourists} accent="text-green-600" />
        <StatCard label="Active Incidents" value={activeIncidents} accent="text-red-600" />
        <StatCard label="SOS Incidents" value={sosIncidents} accent="text-red-600" />
        <StatCard label="Lost Tourists" value={lostTourists} accent="text-amber-600" />
      </div>
    </div>
  )
}

export default AdminOverview