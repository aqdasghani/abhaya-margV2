import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLastKnownLocation, getLocationHistory } from '../firebase/locationService'
import { getRecentIncidents } from '../firebase/incidentService'
import { subscribeToActiveGeofences } from '../firebase/geofenceService'
import { useGeolocation } from '../hooks/useGeolocation'
import { useGeofenceMonitor } from '../hooks/useGeofenceMonitor'
import TouristIdCard from '../components/TouristIdCard'
import ProfileSummaryCard from '../components/dashboard/ProfileSummaryCard'
import LocationStatusCard from '../components/dashboard/LocationStatusCard'
import CurrentLocationCard from '../components/dashboard/CurrentLocationCard'
import LastKnownLocationCard from '../components/dashboard/LastKnownLocationCard'
import LocationHistoryCard from '../components/dashboard/LocationHistoryCard'
import SosButton from '../components/dashboard/SosButton'
import RecentActivityCard from '../components/dashboard/RecentActivityCard'
import GeofenceWarningBanner from '../components/dashboard/GeofenceWarningBanner'
import TouristMap from '../components/map/TouristMap'

function Dashboard() {
  const { currentUser, userProfile, touristProfile } = useAuth()
  const {
    coordinates,
    error: geoError,
    loading: geoLoading,
    isTracking,
    startTracking,
    stopTracking,
  } = useGeolocation(currentUser?.uid, touristProfile?.touristId)
  const [lastKnownLocation, setLastKnownLocation] = useState(null)
  const [locationHistory, setLocationHistory] = useState([])
  const [incidents, setIncidents] = useState([])
  const [geofences, setGeofences] = useState([])

  const { insideZones } = useGeofenceMonitor(coordinates, geofences, currentUser?.uid, touristProfile?.touristId)

  useEffect(() => {
    async function loadData() {
      if (currentUser) {
        const [location, history, recentIncidents] = await Promise.all([
          getLastKnownLocation(currentUser.uid),
          getLocationHistory(currentUser.uid),
          getRecentIncidents(currentUser.uid),
        ])
        setLastKnownLocation(location)
        setLocationHistory(history)
        setIncidents(recentIncidents)
      }
    }
    loadData()
  }, [currentUser])

  useEffect(() => {
    const unsub = subscribeToActiveGeofences(setGeofences)
    return unsub
  }, [])

  useEffect(() => {
    if (coordinates) {
      setLastKnownLocation({ ...coordinates, createdAt: new Date() })
      setLocationHistory((prev) =>
        [{ id: `local-${Date.now()}`, ...coordinates, createdAt: new Date() }, ...prev].slice(0, 10)
      )
    }
  }, [coordinates])

  async function refreshIncidents() {
    if (currentUser) {
      const recentIncidents = await getRecentIncidents(currentUser.uid)
      setIncidents(recentIncidents)
    }
  }

  if (!currentUser) {
    return <p className="text-gray-600">You must be logged in to view this page.</p>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {userProfile?.displayName}</h1>
        <p className="text-gray-500 text-sm">Here's your current safety overview.</p>
      </div>

      <GeofenceWarningBanner zones={insideZones} />

      <SosButton
        uid={currentUser.uid}
        touristProfile={touristProfile}
        lastKnownLocation={lastKnownLocation}
        onSent={refreshIncidents}
      />

      <TouristMap
        currentLocation={coordinates}
        lastKnownLocation={lastKnownLocation}
        geofences={geofences}
        locationHistory={locationHistory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TouristIdCard tourist={touristProfile} />
        <ProfileSummaryCard userProfile={userProfile} touristProfile={touristProfile} />
        <LocationStatusCard isTracking={isTracking} onStart={startTracking} onStop={stopTracking} error={geoError} />
        <CurrentLocationCard coordinates={coordinates} loading={geoLoading} />
        <LastKnownLocationCard location={lastKnownLocation} />
        <LocationHistoryCard history={locationHistory} />
        <RecentActivityCard incidents={incidents} />
      </div>
    </div>
  )
}

export default Dashboard