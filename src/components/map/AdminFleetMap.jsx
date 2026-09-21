import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { currentLocationIcon } from '../../utils/leafletIcons'

function AdminFleetMap({ locations }) {
  const withCoords = locations.filter((loc) => loc.latitude != null && loc.longitude != null)
  const center = withCoords.length > 0 ? [withCoords[0].latitude, withCoords[0].longitude] : [20.5937, 78.9629]

  return (
    <div className="h-[28rem] w-full rounded-2xl overflow-hidden shadow">
      <MapContainer center={center} zoom={withCoords.length > 0 ? 6 : 4} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((loc) => (
          <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={currentLocationIcon}>
            <Popup>
              <p className="font-medium">{loc.touristId || loc.uid}</p>
              <p className="text-xs">{loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}</p>
              <p className="text-xs text-gray-500">Source: {loc.source}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default AdminFleetMap