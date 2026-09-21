import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTouristProfile } from '../../firebase/touristService'
import { getLastKnownLocation, getLocationHistory } from '../../firebase/locationService'
import { reportTouristLostWithIncident } from '../../firebase/adminService'
import TouristMap from '../../components/map/TouristMap'


function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function AdminTouristDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [tourist, setTourist] = useState(null)
  const [lastKnown, setLastKnown] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [reporting, setReporting] = useState(false)

  const loadAll = useCallback(async () => {
    const [touristData, location, locationHistory] = await Promise.all([
      getTouristProfile(uid),
      getLastKnownLocation(uid),
      getLocationHistory(uid),
    ])
    setTourist(touristData)
    setLastKnown(location)
    setHistory(locationHistory)
    setLoading(false)
  }, [uid])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function handleReportLost() {
    setReporting(true)
    await reportTouristLostWithIncident(uid, tourist, lastKnown)
    setReporting(false)
    navigate(`/admin/lost/${uid}`)
  }

  if (loading) return <p className="text-gray-500">Loading tourist...</p>
  if (!tourist) return <p className="text-gray-500">Tourist not found.</p>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{tourist.fullName}</h1>
          <p className="text-gray-500 text-sm font-mono">{tourist.touristId}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          tourist.status === 'LOST' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>
          {tourist.status}
        </span>
      </div>

      <TouristMap
        currentLocation={null}
        lastKnownLocation={lastKnown}
        locationHistory={history}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Profile</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Phone:</span> {tourist.phone}</p>
            <p><span className="text-gray-500">Emergency Contact:</span> {tourist.emergencyContactName}</p>
            <p><span className="text-gray-500">Emergency Phone:</span> {tourist.emergencyContactPhone}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Last Known Location</h3>
          {lastKnown ? (
            <div className="text-sm space-y-1">
              <p>Lat: <span className="font-mono">{lastKnown.latitude}</span></p>
              <p>Lng: <span className="font-mono">{lastKnown.longitude}</span></p>
              <p>Source: <span className="font-mono">{lastKnown.source}</span></p>
              <p className="text-xs text-gray-400">Recorded: {formatTimestamp(lastKnown.createdAt)}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No location recorded yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Recent Location History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No location history yet.</p>
        ) : (
          <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
            {history.map((reading) => (
              <li key={reading.id} className="flex justify-between border-b pb-2 last:border-0">
                <span className="font-mono text-xs">{reading.latitude.toFixed(5)}, {reading.longitude.toFixed(5)}</span>
                <span className="text-xs text-gray-500">{reading.source} · {formatTimestamp(reading.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        {tourist.status !== 'LOST' ? (
          <button
            onClick={handleReportLost}
            disabled={reporting}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
          >
            {reporting ? 'Reporting...' : 'Report as LOST'}
          </button>
        ) : (
          <button
            onClick={() => navigate(`/admin/lost/${uid}`)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700"
          >
            View Lost Case
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminTouristDetail