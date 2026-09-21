import { useEffect, useState } from 'react'
import { subscribeToLatestLocations } from '../../firebase/adminService'
import AdminFleetMap from '../../components/map/AdminFleetMap'

function AdminMap() {
  const [locations, setLocations] = useState([])

  useEffect(() => {
    const unsub = subscribeToLatestLocations(setLocations)
    return unsub
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tourist Location Map</h1>
        <p className="text-gray-500 text-sm">
          {locations.length} tourist{locations.length !== 1 ? 's' : ''} with recorded locations
        </p>
      </div>
      <AdminFleetMap locations={locations} />
    </div>
  )
}

export default AdminMap