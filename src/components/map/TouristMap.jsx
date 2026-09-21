import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { currentLocationIcon, lastKnownLocationIcon } from '../../utils/leafletIcons'
import RecenterMap from './RecenterMap'
import { formatCoordinatesToPolyline } from '../../utils/geo'

function formatTimestamp(timestamp) {
  if (!timestamp) return null
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

const riskColors = {
  LOW: '#16a34a',
  MEDIUM: '#d97706',
  HIGH: '#dc2626',
}

function TouristMap({
  currentLocation,
  lastKnownLocation,
  geofences = [],
  locationHistory = [],
  showTrail = true,
  heightClass = 'h-72 sm:h-96',
}) {
  const activeLocation = currentLocation
    ? { ...currentLocation, viewType: 'current' }
    : lastKnownLocation
    ? { ...lastKnownLocation, viewType: 'last-known' }
    : null


  if (!activeLocation) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center h-72 text-sm text-gray-500">
        No location available yet. Enable location tracking to see the map.
      </div>
    )
  }

  const { latitude, longitude, accuracy, viewType, createdAt, source } = activeLocation
  const isCurrent = viewType === 'current'
  const polylinePositions = showTrail ? formatCoordinatesToPolyline(locationHistory, activeLocation) : []
  const hasTrail = polylinePositions.length > 1

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-gray-800">Tourist Location</h3>
          <p className="text-xs text-gray-500">
            Lat: <span className="font-mono">{latitude.toFixed(6)}</span> · Lng:{' '}
            <span className="font-mono">{longitude.toFixed(6)}</span>
            {accuracy != null && <> · Accuracy: ±{Math.round(accuracy)}m</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasTrail && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block animate-pulse"></span>
              Movement Trail ({polylinePositions.length} pts)
            </span>
          )}
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isCurrent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isCurrent ? 'CURRENT LOCATION' : 'LAST KNOWN LOCATION'}
          </span>
        </div>
      </div>

      {!isCurrent && (
        <p className="text-xs text-amber-700 bg-amber-50 px-4 py-2">
          Current location unavailable. Showing the most recent saved location
          {createdAt && <> from {formatTimestamp(createdAt)}</>}
          {source && <> · Source: {source}</>}.
        </p>
      )}

      <div className={`${heightClass} w-full`}>
        <MapContainer center={[latitude, longitude]} zoom={16} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={latitude} lng={longitude} />

          {/* Google Maps-style Blue Polyline Movement Trail */}
          {hasTrail && (
            <>
              {/* Outer casing / outline for high contrast */}
              <Polyline
                positions={polylinePositions}
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
                positions={polylinePositions}
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
                center={polylinePositions[0]}
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
                  <p className="font-mono text-xs text-gray-600">
                    {polylinePositions[0][0].toFixed(5)}, {polylinePositions[0][1].toFixed(5)}
                  </p>
                </Popup>
              </CircleMarker>

              {/* Intermediate waypoint dots */}
              {polylinePositions.slice(1, -1).map((coord, idx) => (
                <CircleMarker
                  key={`trail-pt-${idx}`}
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
                <p className="font-medium">{geofence.name}</p>
                <p className="text-xs">{geofence.description}</p>
                <p className="text-xs font-semibold mt-1">Risk: {geofence.riskLevel}</p>
              </Popup>
            </Circle>
          ))}

          <Marker position={[latitude, longitude]} icon={isCurrent ? currentLocationIcon : lastKnownLocationIcon}>
            <Popup>
              {isCurrent ? 'Current location' : 'Last known location'}
              <br />
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Popup>
          </Marker>

          {accuracy != null && (
            <Circle
              center={[latitude, longitude]}
              radius={accuracy}
              pathOptions={{ color: isCurrent ? '#16a34a' : '#d97706', fillOpacity: 0.1 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default TouristMap