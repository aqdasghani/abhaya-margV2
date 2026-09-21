import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { subscribeToTourists, subscribeToLatestLocations } from '../../firebase/adminService'
import { subscribeToActiveGeofences } from '../../firebase/geofenceService'
import { getLocationHistory } from '../../firebase/locationService'
import { currentLocationIcon, lastKnownLocationIcon } from '../../utils/leafletIcons'
import { formatCoordinatesToPolyline } from '../../utils/geo'
import RecenterMap from '../../components/map/RecenterMap'

const riskColors = {
  LOW: '#16a34a',
  MEDIUM: '#d97706',
  HIGH: '#dc2626',
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function AdminTracking() {
  const [tourists, setTourists] = useState([])
  const [locations, setLocations] = useState([])
  const [geofences, setGeofences] = useState([])
  const [selectedUid, setSelectedUid] = useState(null)
  const [selectedHistory, setSelectedHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | ACTIVE | LOST

  useEffect(() => {
    const unsubTourists = subscribeToTourists(setTourists)
    const unsubLocations = subscribeToLatestLocations(setLocations)
    const unsubGeofences = subscribeToActiveGeofences(setGeofences)

    return () => {
      unsubTourists()
      unsubLocations()
      unsubGeofences()
    }
  }, [])

  // Map locations by uid for fast lookup
  const locationMap = useMemo(() => {
    const map = new Map()
    for (const loc of locations) {
      map.set(loc.id, loc)
    }
    return map
  }, [locations])

  // Combine tourists with their latest location fix
  const touristFleet = useMemo(() => {
    return tourists.map((tourist) => {
      const loc = locationMap.get(tourist.id) || null
      return {
        ...tourist,
        location: loc,
      }
    })
  }, [tourists, locationMap])

  // When selectedUid changes, fetch that tourist's location history
  useEffect(() => {
    let isCancelled = false
    async function fetchHistory() {
      if (!selectedUid) {
        setSelectedHistory([])
        return
      }
      setLoadingHistory(true)
      try {
        const history = await getLocationHistory(selectedUid, 50)
        if (!isCancelled) {
          setSelectedHistory(history)
        }
      } catch (err) {
        console.error('Failed to load tourist location history:', err)
      } finally {
        if (!isCancelled) setLoadingHistory(false)
      }
    }
    fetchHistory()
    return () => {
      isCancelled = true
    }
  }, [selectedUid])

  const selectedTourist = useMemo(() => {
    return touristFleet.find((t) => t.id === selectedUid) || null
  }, [touristFleet, selectedUid])

  // Filter tourists list
  const filteredTourists = useMemo(() => {
    return touristFleet.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        (t.fullName && t.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.touristId && t.touristId.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'LOST' && t.status === 'LOST') ||
        (statusFilter === 'ACTIVE' && t.status !== 'LOST' && t.location)

      return matchesSearch && matchesStatus
    })
  }, [touristFleet, searchQuery, statusFilter])

  // Center coordinate for the map
  const activeCenter = useMemo(() => {
    if (selectedTourist?.location?.latitude != null && selectedTourist?.location?.longitude != null) {
      return [selectedTourist.location.latitude, selectedTourist.location.longitude]
    }
    const firstWithLoc = touristFleet.find((t) => t.location?.latitude != null && t.location?.longitude != null)
    if (firstWithLoc) {
      return [firstWithLoc.location.latitude, firstWithLoc.location.longitude]
    }
    return [28.6139, 77.209] // Default India center
  }, [selectedTourist, touristFleet])

  // Polyline coordinates for selected tourist
  const polylineCoords = useMemo(() => {
    if (!selectedTourist) return []
    return formatCoordinatesToPolyline(selectedHistory, selectedTourist.location)
  }, [selectedTourist, selectedHistory])

  const activeTrackingCount = touristFleet.filter((t) => t.location != null).length
  const lostCount = touristFleet.filter((t) => t.status === 'LOST').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Live Tracking Console</h1>
          <p className="text-gray-500 text-sm">
            Real-time fleet monitoring, Google Maps movement paths, and active safety perimeter tracking.
          </p>
        </div>
      </div>

      {/* Fleet Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Registered Tourists</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{tourists.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Total database records</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Active on GPS / Location</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-green-600">{activeTrackingCount}</p>
            {activeTrackingCount > 0 && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Transmitting telemetry</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Active Geofences</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{geofences.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Government & custom zones</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 font-medium">Lost Cases</p>
          <p className={`text-2xl font-bold mt-1 ${lostCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {lostCount}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Requires immediate search</p>
        </div>
      </div>

      {/* Main Content: Interactive Map & Tourist Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tourist Selector List */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col h-[600px]">
          <div className="space-y-3 pb-3 border-b">
            <h3 className="font-semibold text-gray-800 text-sm">Tourists Fleet Directory</h3>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                All ({touristFleet.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  statusFilter === 'ACTIVE' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Live ({activeTrackingCount})
              </button>
              <button
                onClick={() => setStatusFilter('LOST')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  statusFilter === 'LOST' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Lost ({lostCount})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 mt-2">
            {filteredTourists.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-8">No tourists match this filter.</p>
            ) : (
              filteredTourists.map((t) => {
                const isSelected = t.id === selectedUid
                const hasLocation = t.location?.latitude != null
                const isLost = t.status === 'LOST'

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedUid(isSelected ? null : t.id)}
                    className={`p-3 cursor-pointer transition rounded-xl my-1 ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-gray-800">{t.fullName || 'Unnamed Tourist'}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isLost
                            ? 'bg-red-100 text-red-700'
                            : hasLocation
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isLost ? 'LOST' : hasLocation ? 'LIVE GPS' : 'NO FIX'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                      <span className="font-mono">{t.touristId}</span>
                      {hasLocation ? (
                        <span className="font-mono text-gray-600">
                          {t.location.latitude.toFixed(4)}, {t.location.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Offline</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between text-[11px]">
                        <span className="text-blue-700 font-semibold">
                          {loadingHistory ? 'Loading trail...' : `Path Trail: ${polylineCoords.length} points`}
                        </span>
                        <Link
                          to={isLost ? `/admin/lost/${t.id}` : `/admin/tourists/${t.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-700 hover:underline font-medium"
                        >
                          View Profile &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Large Interactive Map with Blue Movement Polyline */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden flex flex-col h-[600px]">
          <div className="p-3 border-b flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">Live Map Fleet View</span>
              {selectedTourist ? (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-medium">
                  Tracking: {selectedTourist.fullName} ({selectedTourist.touristId})
                </span>
              ) : (
                <span className="text-gray-500">Showing all active tourists</span>
              )}
            </div>

            {selectedTourist && (
              <button
                onClick={() => setSelectedUid(null)}
                className="text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Clear Selection (View All)
              </button>
            )}
          </div>

          <div className="flex-1 w-full relative">
            <MapContainer
              center={activeCenter}
              zoom={selectedTourist ? 15 : 6}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap lat={activeCenter[0]} lng={activeCenter[1]} />

              {/* Active Geofence Circles */}
              {geofences.filter((g) => g.active).map((geofence) => (
                <Circle
                  key={geofence.id}
                  center={[geofence.latitude, geofence.longitude]}
                  radius={geofence.radius}
                  pathOptions={{
                    color: riskColors[geofence.riskLevel] || riskColors.LOW,
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <p className="font-medium text-xs">{geofence.name}</p>
                    <p className="text-[11px] text-gray-600">{geofence.description}</p>
                    <p className="text-[11px] font-semibold mt-1">Risk: {geofence.riskLevel}</p>
                  </Popup>
                </Circle>
              ))}

              {/* All Tourists Location Markers */}
              {touristFleet
                .filter((t) => t.location?.latitude != null && t.location?.longitude != null)
                .map((t) => (
                  <Marker
                    key={t.id}
                    position={[t.location.latitude, t.location.longitude]}

                      icon={t.status === 'LOST' ? lastKnownLocationIcon : currentLocationIcon}
                      eventHandlers={{
                        click: () => setSelectedUid(t.id),
                      }}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-gray-800">{t.fullName || 'Tourist'}</p>
                          <p className="font-mono text-gray-500">{t.touristId}</p>
                          <p>
                            Status:{' '}
                            <span className={t.status === 'LOST' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                              {t.status}
                            </span>
                          </p>
                          <p className="font-mono">
                            {t.location.latitude.toFixed(5)}, {t.location.longitude.toFixed(5)}
                          </p>
                          <p className="text-[10px] text-gray-400">Recorded: {formatTimestamp(t.location.createdAt)}</p>
                          <button
                            onClick={() => setSelectedUid(t.id)}
                            className="mt-1 text-blue-700 underline block font-semibold"
                          >
                            Inspect Live Movement Trail
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                )}


              {/* Google Maps-style Blue Polyline Trail for Selected Tourist */}
              {polylineCoords.length > 1 && (
                <>
                  {/* Darker blue outline casing */}
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{
                      color: '#1d4ed8',
                      weight: 7,
                      opacity: 0.85,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                  {/* Vibrant Google Maps signature blue core */}
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 4.5,
                      opacity: 1.0,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />

                  {/* Journey Start Point */}
                  <CircleMarker
                    center={polylineCoords[0]}
                    radius={6}
                    pathOptions={{
                      color: '#15803d',
                      fillColor: '#22c55e',
                      fillOpacity: 1,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <p className="font-semibold text-xs text-green-800">Journey Start</p>
                      <p className="font-mono text-xs">
                        {polylineCoords[0][0].toFixed(5)}, {polylineCoords[0][1].toFixed(5)}
                      </p>
                    </Popup>
                  </CircleMarker>

                  {/* Waypoint dots */}
                  {polylineCoords.slice(1, -1).map((coord, idx) => (
                    <CircleMarker
                      key={`admin-trail-${idx}`}
                      center={coord}
                      radius={3}
                      pathOptions={{
                        color: '#1e40af',
                        fillColor: '#93c5fd',
                        fillOpacity: 0.85,
                        weight: 1,
                      }}
                    />
                  ))}
                </>
              )}
            </MapContainer>

            {/* Floating Telemetry Badge on Map when Tourist Selected */}
            {selectedTourist?.location && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-sm p-3.5 rounded-xl shadow-lg border border-gray-200 z-[1000] text-xs space-y-1.5 max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{selectedTourist.fullName}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      selectedTourist.status === 'LOST'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedTourist.status}
                  </span>
                </div>
                <div className="text-gray-600 grid grid-cols-2 gap-x-2 text-[11px] font-mono">
                  <span>Lat: {selectedTourist.location.latitude.toFixed(5)}</span>
                  <span>Lng: {selectedTourist.location.longitude.toFixed(5)}</span>
                  <span>Accuracy: ±{Math.round(selectedTourist.location.accuracy || 0)}m</span>
                  <span>Source: {selectedTourist.location.source || 'NETWORK'}</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-blue-700 font-semibold">
                    Trail: {polylineCoords.length} pts
                  </span>
                  <Link
                    to={selectedTourist.status === 'LOST' ? `/admin/lost/${selectedTourist.id}` : `/admin/tourists/${selectedTourist.id}`}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    Full Case Record &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTracking
