import { useCallback, useEffect, useRef, useState } from 'react'
import { saveLocationReading } from '../firebase/locationService'
import { distanceInMeters } from '../utils/geo'

// Only claim 'GPS' when accuracy is tight enough (<= 50m) to be plausible;
// otherwise label as 'NETWORK' rather than guessing a provider we cannot verify.
export function inferSource(accuracy) {
  if (accuracy != null && accuracy <= 50) return 'GPS'
  return 'NETWORK'
}

// Format browser geolocation errors into clear, actionable messages
function formatGeoError(err) {
  if (!err) return 'Unknown location error.'
  switch (err.code) {
    case 1: // PERMISSION_DENIED
      return 'Location access was denied. Please enable location permissions in your browser or device settings to use live tracking.'
    case 2: // POSITION_UNAVAILABLE
      return 'Location information is currently unavailable from your device GPS/network.'
    case 3: // TIMEOUT
      return 'Location request timed out. Searching for GPS fix in background...'
    default:
      return err.message || 'Unable to retrieve location.'
  }
}

export function useGeolocation(uid, touristId) {
  const [coordinates, setCoordinates] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  const watchIdRef = useRef(null)
  const lastSavedCoordsRef = useRef(null)
  const lastSavedTimestampRef = useRef(0)

  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    // Secure context check: modern geolocation requires HTTPS or localhost
    if (window.isSecureContext === false) {
      setError('Geolocation requires a secure HTTPS context.')
      return
    }

    setLoading(true)
    setError(null)

    // Clear any existing watcher to prevent duplicates
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const source = inferSource(accuracy)
        const coords = { latitude, longitude, accuracy, source }

        // 1. Immediately update UI state so map displays smooth real-time marker
        setCoordinates(coords)
        setLoading(false)
        setIsTracking(true)
        setError(null)

        // 2. Production Cost Control: Throttled Firestore persistence
        // Only write to Firestore if:
        //  - It is the first reading, OR
        //  - At least 60 seconds have elapsed since last write, OR
        //  - At least 15 seconds have elapsed AND user moved >= 25 meters.
        if (uid) {
          const now = Date.now()
          const lastSaved = lastSavedCoordsRef.current
          const elapsedMs = now - lastSavedTimestampRef.current

          let shouldPersist = false
          if (!lastSaved || elapsedMs >= 60000) {
            shouldPersist = true
          } else if (elapsedMs >= 15000) {
            const distanceMoved = distanceInMeters(
              lastSaved.latitude,
              lastSaved.longitude,
              coords.latitude,
              coords.longitude
            )
            if (distanceMoved >= 25) {
              shouldPersist = true
            }
          }

          if (shouldPersist) {
            lastSavedCoordsRef.current = coords
            lastSavedTimestampRef.current = now
            try {
              await saveLocationReading(uid, { ...coords, touristId })
            } catch (err) {
              console.error('Failed to persist throttled location reading:', err)
            }
          }
        }
      },
      (err) => {
        setError(formatGeoError(err))
        setLoading(false)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    )
  }, [uid, touristId])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
    setLoading(false)
  }, [])

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [])

  return { coordinates, error, loading, isTracking, startTracking, stopTracking }
}