import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToIncidents } from '../../firebase/adminService'

function formatTimestamp(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function AdminIncidents() {
  const [incidents, setIncidents] = useState([])
  const [filter, setFilter] = useState('ALL') // ALL | ACTIVE | RESOLVED | SOS | GEOFENCE
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsub = subscribeToIncidents(setIncidents)
    return unsub
  }, [])

  const activeCount = useMemo(() => incidents.filter((i) => i.status === 'ACTIVE').length, [incidents])
  const resolvedCount = useMemo(() => incidents.filter((i) => i.status === 'RESOLVED').length, [incidents])
  const sosCount = useMemo(() => incidents.filter((i) => i.incidentType === 'SOS').length, [incidents])
  const geofenceCount = useMemo(() => incidents.filter((i) => i.incidentType === 'GEOFENCE').length, [incidents])

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        searchQuery === '' ||
        (incident.incidentId && incident.incidentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (incident.touristId && incident.touristId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (incident.title && incident.title.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && incident.status === 'ACTIVE') ||
        (filter === 'RESOLVED' && incident.status === 'RESOLVED') ||
        (filter === 'SOS' && incident.incidentType === 'SOS') ||
        (filter === 'GEOFENCE' && incident.incidentType === 'GEOFENCE')

      return matchesSearch && matchesFilter
    })
  }, [incidents, searchQuery, filter])

  const typeBadgeStyles = {
    SOS: 'bg-red-100 text-red-700 border-red-200',
    MEDICAL: 'bg-rose-100 text-rose-700 border-rose-200',
    HAZARD: 'bg-amber-100 text-amber-700 border-amber-200',
    GEOFENCE: 'bg-purple-100 text-purple-700 border-purple-200',
    LOST: 'bg-orange-100 text-orange-700 border-orange-200',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incidents Command Center</h1>
          <p className="text-gray-500 text-sm">
            Live emergency alerts, geofence breaches, and field response records.
          </p>
        </div>
      </div>

      {/* Incident Status Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Total Incidents</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{incidents.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Recorded in system</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Active Incidents</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-red-600">{activeCount}</p>
            {activeCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Requires intervention</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Resolved Cases</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{resolvedCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Dispatched & cleared</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">SOS Emergencies</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{sosCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Direct tourist distress calls</p>
        </div>
      </div>

      {/* Incidents Table with Filters */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'ALL' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'ACTIVE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'RESOLVED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              onClick={() => setFilter('SOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'SOS' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              SOS ({sosCount})
            </button>
            <button
              onClick={() => setFilter('GEOFENCE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'GEOFENCE' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Geofence ({geofenceCount})
            </button>
          </div>

          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search by ID, tourist, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 border-b">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Tourist</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Location Fix</th>
                <th className="p-3">Reported</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No incidents match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const isActive = incident.status === 'ACTIVE'
                  return (
                    <tr key={incident.id || incident.incidentId} className="hover:bg-gray-50 transition">
                      <td className="p-3">
                        <span className="font-mono font-bold text-xs text-gray-800">
                          {incident.incidentId}
                        </span>
                        {incident.title && (
                          <p className="text-[11px] text-gray-500 line-clamp-1">{incident.title}</p>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs text-blue-700">
                        {incident.touristId || incident.uid}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            typeBadgeStyles[incident.incidentType] || 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {incident.incidentType}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-600">
                        {incident.latitude != null && incident.longitude != null ? (
                          <span>
                            {Number(incident.latitude).toFixed(4)}, {Number(incident.longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-gray-400">No coords</span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-mono">
                        {formatTimestamp(incident.createdAt)}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/admin/incidents/${incident.incidentId}`}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1 rounded-lg text-xs transition inline-block"
                        >
                          View Case &rarr;
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminIncidents