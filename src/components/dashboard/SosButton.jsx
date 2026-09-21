import { useState } from 'react'
import { createIncident } from '../../firebase/incidentService'
import { generateIncidentId } from '../../firebase/counterService'

// Asks the browser for a fresh, one-shot location reading right now —
// deliberately not reusing possibly-stale watch-position state.
function getFreshPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

function inferSource(accuracy) {
  if (accuracy != null && accuracy <= 50) return 'GPS'
  return 'NETWORK'
}

function SosButton({ uid, touristProfile, lastKnownLocation, onSent }) {
  const [stage, setStage] = useState('idle') // idle | confirming | locating | sending | confirmed | error
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function handleTrigger() {
    setStage('confirming')
  }

  function handleCancel() {
    setStage('idle')
  }

  async function handleConfirm() {
    setStage('locating')
    setError('')

    let locationPayload = null

    // 1. Try to get the freshest possible device location right now
    try {
      const coords = await getFreshPosition()
      locationPayload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        locationSource: inferSource(coords.accuracy),
        viewType: 'current',
      }
    } catch {
      // 2. Fall back to the most recently stored location
      if (lastKnownLocation) {
        locationPayload = {
          latitude: lastKnownLocation.latitude,
          longitude: lastKnownLocation.longitude,
          locationSource: 'LAST_KNOWN',
          viewType: 'last-known',
        }
      }
    }

    if (!locationPayload) {
      setError('Unable to determine a location for this SOS. Please try again.')
      setStage('error')
      return
    }

    setStage('sending')
    try {
      const incidentId = await generateIncidentId()

      await createIncident(uid, {
        incidentId,
        touristId: touristProfile?.touristId,
        type: 'SOS',
        status: 'ACTIVE',
        latitude: locationPayload.latitude,
        longitude: locationPayload.longitude,
        locationSource: locationPayload.locationSource,
      })

      setResult({ incidentId, ...locationPayload })
      setStage('confirmed')
      if (onSent) onSent()
    } catch (err) {
      setError(err.message)
      setStage('error')
    }
  }

  function handleClose() {
    setStage('idle')
    setResult(null)
  }

  if (stage === 'confirming') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-red-700 font-medium text-sm">
          Confirm SOS? This will record an emergency alert with your location.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
          >
            Confirm SOS
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'locating') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm font-medium">
        Getting your location...
      </div>
    )
  }

  if (stage === 'sending') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm font-medium">
        Recording SOS alert...
      </div>
    )
  }

  if (stage === 'confirmed' && result) {
    const isCurrent = result.viewType === 'current'
    const emergencyPhone = touristProfile?.emergencyContactPhone

    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-green-800 font-bold text-lg">SOS Alert Recorded</h3>
          <span className="text-xs font-semibold bg-green-600 text-white px-3 py-1 rounded-full">ACTIVE</span>
        </div>

        <p className="text-sm text-green-800">
          This has been logged in the app. This Phase 1 version does not yet dispatch
          police or emergency services automatically.
        </p>

        <div className="bg-white rounded-lg p-3 text-sm space-y-1">
          <p>
            <span className="text-gray-500">Incident ID:</span>{' '}
            <span className="font-mono font-medium">{result.incidentId}</span>
          </p>
          <p>
            <span className="text-gray-500">Location used:</span>{' '}
            <span className={`font-semibold ${isCurrent ? 'text-green-700' : 'text-amber-700'}`}>
              {isCurrent ? 'CURRENT LOCATION' : 'LAST KNOWN LOCATION'}
            </span>
          </p>
          <p><span className="text-gray-500">Latitude:</span> <span className="font-mono">{result.latitude.toFixed(6)}</span></p>
          <p><span className="text-gray-500">Longitude:</span> <span className="font-mono">{result.longitude.toFixed(6)}</span></p>
          <p><span className="text-gray-500">Source:</span> <span className="font-mono">{result.locationSource}</span></p>
        </div>
         {emergencyPhone && (
          <button
            onClick={function () { window.location.href = 'tel:' + emergencyPhone }}
            className="block w-full text-center bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition"
          >
            Call Emergency Contact ({touristProfile.emergencyContactName || emergencyPhone})
          </button>
        )}

        <button onClick={handleClose} className="w-full text-sm text-gray-600 hover:text-gray-800 underline">
          Close
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleTrigger}
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg text-lg flex items-center justify-center gap-2 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6.75a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V7.5A.75.75 0 0112 6.75zm0 9.375a.9375.9375 0 100-1.875.9375.9375 0 000 1.875z" clipRule="evenodd" />
        </svg>
        SOS Emergency
      </button>
      {stage === 'error' && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  )
}

export default SosButton