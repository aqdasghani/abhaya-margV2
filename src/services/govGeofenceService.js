/**
 * Official Indian Government Geofence Integration Service
 * Connects directly to live Indian Government APIs:
 *
 * 1. INCOIS (Indian National Centre for Ocean Information Services, Ministry of Earth Sciences, Govt. of India)
 *    API: https://erddap.incois.gov.in/erddap/
 * 2. OGD Platform India (data.gov.in) — Central Pollution Control Board (CPCB, MoEFCC)
 *    API: https://api.data.gov.in/resource/
 * 3. Custom Indian Government Disaster / Hazard GeoJSON Feeds (NDMA / SDMAs)
 *
 * Automatically parses live government records into valid safety geofences for Firestore.
 */

export const GOV_API_PROVIDERS = [
  {
    id: 'INCOIS',
    name: 'INCOIS — Ministry of Earth Sciences, Govt. of India',
    agency: 'INCOIS (MoES, Govt. of India)',
    description: 'Indian Ocean Observation & Coastal Hazard Network (Open Government API, no key required)',
    endpoint: 'https://erddap.incois.gov.in/erddap/tabledap/allDatasets.json',
    proxyEndpoint: '/gov-api/incois/erddap/tabledap/allDatasets.json',
    requiresKey: false,
  },
  {
    id: 'DATA_GOV_IN',
    name: 'data.gov.in — Open Government Data Platform India (CPCB / MoEFCC)',
    agency: 'CPCB (Govt. of India)',
    description: 'Central Pollution Control Board real-time environmental hazard monitoring stations across India',
    endpoint: 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
    proxyEndpoint: '/gov-api/datagov/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
    requiresKey: true,
  },
  {
    id: 'CUSTOM_GOV_API',
    name: 'Custom Indian Government Disaster / Hazard Feed (GeoJSON / REST)',
    agency: 'State / National Disaster Authority',
    description: 'Direct feed from NDMA, State Disaster Management Authorities (SDMA), or NIC portals',
    endpoint: '',
    requiresKey: false,
  },
]

/**
 * Validates that a parsed geofence meets coordinate and dimensional requirements.
 */
export function validateGovGeofence(zone) {
  if (!zone || typeof zone !== 'object') return false
  if (typeof zone.name !== 'string' || !zone.name.trim()) return false
  if (typeof zone.latitude !== 'number' || isNaN(zone.latitude) || zone.latitude < -90 || zone.latitude > 90)
    return false
  if (typeof zone.longitude !== 'number' || isNaN(zone.longitude) || zone.longitude < -180 || zone.longitude > 180)
    return false
  if (typeof zone.radius !== 'number' || isNaN(zone.radius) || zone.radius <= 0 || zone.radius > 100000)
    return false
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(zone.riskLevel)) return false
  return true
}

/**
 * Fetches and parses hazard/observation geofences directly from INCOIS (Govt. of India).
 */
export async function fetchIncoisGeofences() {
  const isDev = import.meta.env?.DEV
  // Use proxy in Vite dev to bypass browser CORS; otherwise use direct official domain
  const baseUrl = isDev
    ? '/gov-api/incois/erddap/tabledap/allDatasets.json'
    : 'https://erddap.incois.gov.in/erddap/tabledap/allDatasets.json'

  const queryUrl = `${baseUrl}?datasetID,title,minLongitude,maxLongitude,minLatitude,maxLatitude,institution`

  const response = await fetch(queryUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    throw new Error(`INCOIS Government API returned HTTP ${response.status}: ${response.statusText}`)
  }

  const json = await response.json()
  const rows = json?.table?.rows || []

  const geofences = []

  for (const row of rows) {
    const [datasetID, title, minLongitude, maxLongitude, minLatitude, maxLatitude, institution] = row

    if (minLatitude == null || maxLatitude == null || minLongitude == null || maxLongitude == null) {
      continue
    }

    // Filter datasets that cover Indian territorial, coastal, or maritime safety sectors
    // India latitude ~ 6N to 38N, longitude ~ 68E to 98E (with marine buffer)
    const isIndiaRegion =
      minLatitude >= -5 &&
      maxLatitude <= 40 &&
      minLongitude >= 60 &&
      maxLongitude <= 110

    if (!isIndiaRegion) continue

    const centerLat = Number(((minLatitude + maxLatitude) / 2).toFixed(5))
    const centerLng = Number(((minLongitude + maxLongitude) / 2).toFixed(5))

    const geofence = {
      advisoryId: `INCOIS-${datasetID}`,
      name: `[INCOIS] ${title || datasetID}`,
      description: `Official INCOIS observation sector: ${datasetID} (${institution || 'Ministry of Earth Sciences, Govt. of India'}). Coordinates: [${minLatitude}°N to ${maxLatitude}°N, ${minLongitude}°E to ${maxLongitude}°E].`,
      latitude: centerLat,
      longitude: centerLng,
      radius: 5000,
      riskLevel: 'HIGH',
      source: 'GOVERNMENT_API',
      agency: 'INCOIS (MoES, Govt. of India)',
      active: true,
    }

    if (validateGovGeofence(geofence)) {
      geofences.push(geofence)
    }
  }

  return {
    provider: 'INCOIS — Ministry of Earth Sciences, Govt. of India',
    agency: 'INCOIS',
    zones: geofences,
  }
}

/**
 * Fetches and parses real-time hazardous monitoring stations from data.gov.in (CPCB).
 */
export async function fetchDataGovInGeofences(apiKey) {
  if (!apiKey) {
    throw new Error('An API Key from data.gov.in is required to query the Open Government Data platform.')
  }

  const isDev = import.meta.env?.DEV
  const baseUrl = isDev
    ? '/gov-api/datagov/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'
    : 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'

  const queryUrl = `${baseUrl}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=50`

  const response = await fetch(queryUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    throw new Error(`data.gov.in returned HTTP ${response.status}: ${response.statusText}`)
  }

  const json = await response.json()
  if (json.error) {
    throw new Error(`data.gov.in API Error: ${json.error}`)
  }

  const records = json.records || []
  const geofences = []

  for (const record of records) {
    const lat = parseFloat(record.latitude)
    const lng = parseFloat(record.longitude)

    if (isNaN(lat) || isNaN(lng)) continue

    const stationName = record.station || record.city || 'Government Monitoring Station'
    const pollutantValue = parseFloat(record.pollutant_avg || record.pollutant_max || 0)

    // Higher pollutant concentration indicates higher risk
    const riskLevel = pollutantValue > 250 ? 'HIGH' : pollutantValue > 100 ? 'MEDIUM' : 'LOW'

    const geofence = {
      advisoryId: `CPCB-${(record.city || 'IND').toUpperCase()}-${(record.station || '').replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: `[CPCB] ${stationName}`,
      description: `Central Pollution Control Board (MoEFCC, Govt. of India) hazard station. City: ${record.city || '—'}, State: ${record.state || '—'}. Pollutant: ${record.pollutant_id || 'AQI'} level ${pollutantValue}.`,
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      radius: 2000,
      riskLevel,
      source: 'GOVERNMENT_API',
      agency: 'CPCB (MoEFCC, Govt. of India)',
      active: true,
    }

    if (validateGovGeofence(geofence)) {
      geofences.push(geofence)
    }
  }

  return {
    provider: 'data.gov.in — Central Pollution Control Board (CPCB)',
    agency: 'CPCB',
    zones: geofences,
  }
}

/**
 * Fetches and parses a custom Indian Government GeoJSON or REST endpoint (e.g. NDMA / SDMA).
 */
export async function fetchCustomGovGeofences(endpointUrl) {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    throw new Error('Please enter a valid HTTP/HTTPS government API or GeoJSON endpoint URL.')
  }

  const response = await fetch(endpointUrl, {
    headers: { Accept: 'application/json, text/plain' },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    throw new Error(`Government endpoint returned HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  const rawList = Array.isArray(data)
    ? data
    : data.features || data.zones || data.records || data.data || []

  const geofences = []

  for (const item of rawList) {
    let lat = null
    let lng = null
    let name = 'Government Risk Perimeter'
    let desc = 'Official disaster risk corridor'
    let radius = 1500
    let risk = 'HIGH'

    if (item.geometry) {
      // GeoJSON Feature
      if (item.geometry.type === 'Point') {
        lng = item.geometry.coordinates[0]
        lat = item.geometry.coordinates[1]
      } else if (item.geometry.type === 'Polygon') {
        const ring = item.geometry.coordinates[0]
        lat = ring.reduce((acc, c) => acc + c[1], 0) / ring.length
        lng = ring.reduce((acc, c) => acc + c[0], 0) / ring.length
      }
      name = item.properties?.name || item.properties?.title || name
      desc = item.properties?.description || item.properties?.warning || desc
      radius = Number(item.properties?.radius || radius)
      risk = item.properties?.riskLevel || risk
    } else {
      // Standard JSON object
      lat = parseFloat(item.latitude ?? item.lat)
      lng = parseFloat(item.longitude ?? item.lng ?? item.lon)
      name = item.name || item.title || name
      desc = item.description || item.desc || desc
      radius = Number(item.radius || radius)
      risk = item.riskLevel || risk
    }

    if (isNaN(lat) || isNaN(lng)) continue

    const geofence = {
      advisoryId: item.id || item.advisoryId || `GOV-${Date.now()}-${geofences.length}`,
      name: name.startsWith('[') ? name : `[GOVT] ${name}`,
      description: desc,
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      radius: Math.min(Math.max(radius, 100), 50000),
      riskLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(risk) ? risk : 'HIGH',
      source: 'GOVERNMENT_API',
      agency: item.agency || 'GOVT_AUTHORITY',
      active: true,
    }

    if (validateGovGeofence(geofence)) {
      geofences.push(geofence)
    }
  }

  return {
    provider: 'Official Government Custom Endpoint',
    agency: 'GOVT_AUTHORITY',
    zones: geofences,
  }
}

/**
 * Universal dispatcher to fetch from official Indian government API sources.
 */
export async function fetchOfficialGovernmentGeofences({ providerId = 'INCOIS', apiKey = '', customUrl = '' }) {
  if (providerId === 'INCOIS') {
    return await fetchIncoisGeofences()
  }
  if (providerId === 'DATA_GOV_IN') {
    return await fetchDataGovInGeofences(apiKey)
  }
  if (providerId === 'CUSTOM_GOV_API') {
    return await fetchCustomGovGeofences(customUrl)
  }
  throw new Error(`Unrecognized government API provider: ${providerId}`)
}
