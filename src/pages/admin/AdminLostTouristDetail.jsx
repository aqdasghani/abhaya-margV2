import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTouristProfile } from '../../firebase/touristService'
import { getLocationHistory } from '../../firebase/locationService'
import { getRecentIncidents } from '../../firebase/incidentService'
import { subscribeToTouristLocation, resolveLostCase } from '../../firebase/adminService'
import TouristMap from '../../components/map/TouristMap'

const FRESHNESS_WINDOW_MS = 2 * 60 * 1000 // 2 minutes

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function toMillis(timestamp) {
  if (!timestamp) return null
  if (timestamp.toDate) return timestamp.toDate().getTime()
  return new Date(timestamp).getTime()
}

function AdminLostTouristDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [tourist, setTourist] = useState(null)
  const [history, setHistory] = useState([])
  const [latestLocation, setLatestLocation] = useState(null)
  const [locationLoaded, setLocationLoaded] = useState(false)
  const [lostIncident, setLostIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000)
    return () => clearInterval(timer)
  }, [])

  const loadStaticData = useCallback(async () => {
    const [touristData, locationHistory, incidents] = await Promise.all([
      getTouristProfile(uid),
      getLocationHistory(uid, 15),
      getRecentIncidents(uid, 20),
    ])
    setTourist(touristData)
    setHistory(locationHistory)
    const activeLost = incidents.find((i) => i.incidentType === 'LOST' && i.status === 'ACTIVE')
    setLostIncident(activeLost || null)
    setLoading(false)
  }, [uid])

  useEffect(() => {
    loadStaticData()
  }, [loadStaticData])

  useEffect(() => {
    const unsub = subscribeToTouristLocation(uid, (location) => {
      setLatestLocation(location)
      setLocationLoaded(true)
    })
    return unsub
  }, [uid])

  async function handleResolve() {
    if (!lostIncident) return
    setResolving(true)
    await resolveLostCase(uid, lostIncident.incidentId)
    setResolving(false)
    await loadStaticData()
  }

  if (loading) return <p className="text-gray-500">Loading case...</p>
  if (!tourist) return <p className="text-gray-500">Tourist not found.</p>

  // Determine location freshness honestly — a stale reading is never labeled CURRENT
  const readingAgeMs = latestLocation ? currentTime - (toMillis(latestLocation.createdAt) || 0) : null
  const isFresh = readingAgeMs !== null && readingAgeMs <= FRESHNESS_WINDOW_MS
  const locationStatus = !locationLoaded
    ? 'LOADING'
    : !latestLocation
    ? 'LOCATION UNAVAILABLE'
    : isFresh
    ? 'CURRENT'
    : 'LAST KNOWN'

  const mapCurrentLocation = locationStatus === 'CURRENT' ? latestLocation : null
  const mapLastKnownLocation = locationStatus !== 'LOCATION UNAVAILABLE' ? latestLocation : null

  const caseStatus = tourist.status === 'LOST' ? 'LOST' : 'RESOLVED'

  const locationBadgeClasses = {
    CURRENT: 'bg-green-100 text-green-700',
    'LAST KNOWN': 'bg-amber-100 text-amber-700',
    'LOCATION UNAVAILABLE': 'bg-gray-100 text-gray-500',
    LOADING: 'bg-gray-100 text-gray-400',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{tourist.fullName}</h1>
          <p className="text-gray-500 text-sm font-mono">{tourist.touristId}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            caseStatus === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {caseStatus}
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${locationBadgeClasses[locationStatus]}`}>
            {locationStatus === 'LOADING' ? 'LOCATING...' : locationStatus}
          </span>
        </div>
      </div>

      <TouristMap
        currentLocation={mapCurrentLocation}
        lastKnownLocation={mapLastKnownLocation}
        locationHistory={history}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Location Details</h3>
          {latestLocation ? (
            <div className="text-sm space-y-1">
              <p>Latitude: <span className="font-mono">{latestLocation.latitude}</span></p>
              <p>Longitude: <span className="font-mono">{latestLocation.longitude}</span></p>
              {latestLocation.accuracy != null && (
                <p>Accuracy: <span className="font-mono">±{Math.round(latestLocation.accuracy)}m</span></p>
              )}
              <p>Source: <span className="font-mono">{latestLocation.source || 'Unknown'}</span></p>
              <p className="text-xs text-gray-400 mt-1">Recorded: {formatTimestamp(latestLocation.createdAt)}</p>
            </div>
          ) : (
            <p className="text-sm text-amber-600 font-medium">
              No location has ever been recorded for this tourist. Current location unavailable.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Emergency Contact</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Name:</span> {tourist.emergencyContactName || '—'}</p>
            <p><span className="text-gray-500">Phone:</span> {tourist.emergencyContactPhone || '—'}</p>
            <p><span className="text-gray-500">Tourist Phone:</span> {tourist.phone || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Previous Location Points</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No location history available.</p>
        ) : (
          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {history.map((reading) => (
              <li key={reading.id} className="flex justify-between border-b pb-2 last:border-0">
                <span className="font-mono text-xs">{reading.latitude.toFixed(5)}, {reading.longitude.toFixed(5)}</span>
                <span className="text-xs text-gray-500">{reading.source} · {formatTimestamp(reading.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lostIncident && (
        <div className="bg-white rounded-2xl shadow p-5 text-sm space-y-1">
          <h3 className="font-semibold text-gray-800 mb-2">Case Record</h3>
          <p><span className="text-gray-500">Incident ID:</span> <span className="font-mono">{lostIncident.incidentId}</span></p>
          <p><span className="text-gray-500">Reported:</span> {formatTimestamp(lostIncident.createdAt)}</p>
          {lostIncident.resolvedAt && (
            <p><span className="text-gray-500">Resolved:</span> {formatTimestamp(lostIncident.resolvedAt)}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {caseStatus === 'LOST' && lostIncident && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {resolving ? 'Resolving...' : 'Mark Case as RESOLVED'}
          </button>
        )}
        <button
          onClick={() => navigate('/admin/lost')}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Back to Lost Tourists
        </button>
      </div>
    </div>
  )
}

export default AdminLostTouristDetail