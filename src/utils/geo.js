const EARTH_RADIUS_METERS = 6371000

/**
 * Haversine formula: Calculates great-circle distance between two lat/lng coordinates in meters.
 */
export function distanceInMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_METERS * c
}

/**
 * Honestly infers location source: only claim 'GPS' when accuracy is tight enough (<= 50m).
 * Otherwise labels as 'NETWORK' rather than guessing a provider that cannot be verified.
 */
export function inferSource(accuracy) {
  if (accuracy != null && accuracy <= 50) return 'GPS'
  return 'NETWORK'
}

/**
 * Takes location history readings and current location, validates them,
 * sorts chronologically (oldest -> newest), deduplicates stationary points,
 * and returns an array of [lat, lng] points formatted for Leaflet Polyline.
 */
export function formatCoordinatesToPolyline(history = [], currentLocation = null) {
  const points = []

  const isValidCoord = (pt) =>
    pt != null &&
    typeof pt.latitude === 'number' &&
    typeof pt.longitude === 'number' &&
    !isNaN(pt.latitude) &&
    !isNaN(pt.longitude) &&
    pt.latitude >= -90 &&
    pt.latitude <= 90 &&
    pt.longitude >= -180 &&
    pt.longitude <= 180

  const getMillis = (pt) => {
    if (!pt) return 0
    if (pt.createdAt && typeof pt.createdAt.toDate === 'function') return pt.createdAt.toDate().getTime()
    if (pt.createdAt instanceof Date) return pt.createdAt.getTime()
    if (typeof pt.createdAt === 'number') return pt.createdAt
    if (typeof pt.createdAt === 'string') return new Date(pt.createdAt).getTime()
    if (pt.timestamp) return new Date(pt.timestamp).getTime()
    return 0
  }

  const validHistory = history.filter(isValidCoord)
  const sortedHistory = [...validHistory].sort((a, b) => getMillis(a) - getMillis(b))

  for (const pt of sortedHistory) {
    points.push({ lat: pt.latitude, lng: pt.longitude })
  }

  if (isValidCoord(currentLocation)) {
    points.push({ lat: currentLocation.latitude, lng: currentLocation.longitude })
  }

  const deduped = []
  for (let i = 0; i < points.length; i++) {
    const pt = points[i]
    if (deduped.length === 0) {
      deduped.push([pt.lat, pt.lng])
    } else {
      const prev = deduped[deduped.length - 1]
      const dist = distanceInMeters(prev[0], prev[1], pt.lat, pt.lng)
      if (dist >= 1) {
        deduped.push([pt.lat, pt.lng])
      }
    }
  }

  return deduped
}