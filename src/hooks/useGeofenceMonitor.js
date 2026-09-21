import { useEffect, useRef, useState } from 'react'
import { distanceInMeters } from '../utils/geo'
import { createIncident, findActiveGeofenceIncident } from '../firebase/incidentService'
import { generateIncidentId } from '../firebase/counterService'

// Maximum acceptable accuracy error in meters to trigger automatic incident creation.
// Avoids false breach alerts caused by coarse network/cellular triangulation.
const MAX_ACCURACY_FOR_INCIDENT = 200

// Watches live GPS coordinates against active geofences and reports zone entry —
// creating exactly one incident per entry transition, never per location tick.
export function useGeofenceMonitor(currentLocation, geofences, uid, touristId) {
  const [insideZones, setInsideZones] = useState([])
  const previousInsideRef = useRef(new Set())
  const handledRef = useRef(new Set()) // zones already alerted this session

  useEffect(() => {
    if (!currentLocation || !geofences || geofences.length === 0) {
      setInsideZones([])
      return
    }

    const activeGeofences = geofences.filter((g) => g.active)
    const currentlyInside = activeGeofences.filter((g) => {
      const distance = distanceInMeters(
        currentLocation.latitude,
        currentLocation.longitude,
        g.latitude,
        g.longitude
      )
      return distance <= g.radius
    })

    setInsideZones(currentlyInside)

    const currentIds = new Set(currentlyInside.map((g) => g.id))
    const previousIds = previousInsideRef.current

    // Only act on a NEW entry (transition from outside -> inside)
    currentlyInside.forEach((geofence) => {
      const isNewEntry = !previousIds.has(geofence.id)
      const alreadyHandledThisSession = handledRef.current.has(geofence.id)

      // Guard: Only record incident if location accuracy is plausible (<= 200m)
      const isAccurate =
        currentLocation.accuracy == null || currentLocation.accuracy <= MAX_ACCURACY_FOR_INCIDENT

      if (isNewEntry && !alreadyHandledThisSession && uid && isAccurate) {
        handledRef.current.add(geofence.id)
        ;(async () => {
          try {
            // Secondary safety net across reloads: if an active incident for this exact
            // zone already exists, don't create a duplicate
            const existing = await findActiveGeofenceIncident(uid, geofence.id)
            if (existing) return

            const incidentId = await generateIncidentId()
            await createIncident(uid, {
              incidentId,
              touristId,
              type: 'GEOFENCE',
              status: 'ACTIVE',
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              locationSource: currentLocation.source || 'GPS',
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              riskLevel: geofence.riskLevel,
            })
          } catch (err) {
            console.error('Failed to create geofence breach incident:', err)
            // Allow retry if creation failed due to transient network error
            handledRef.current.delete(geofence.id)
          }
        })()
      }
    })

    // Zones the tourist has left get cleared from "handled", so re-entering
    // later correctly creates a fresh alert rather than staying silent forever
    previousIds.forEach((id) => {
      if (!currentIds.has(id)) handledRef.current.delete(id)
    })

    previousInsideRef.current = currentIds
  }, [currentLocation, geofences, uid, touristId])

  return { insideZones }
}