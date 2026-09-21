import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTouristByTouristId } from '../firebase/touristService'

function formatTimestamp(timestamp) {
  if (!timestamp) return null
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function VerifyTourist() {
  const { touristId } = useParams()
  const [tourist, setTourist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function verify() {
      setLoading(true)
      setError('')
      try {
        const data = await getTouristByTouristId(touristId)
        if (data) {
          setTourist(data)
        } else {
          setError('No tourist record found for this ID.')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError('Failed to verify tourist ID. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (touristId) {
      verify()
    } else {
      setError('No tourist ID provided.')
      setLoading(false)
    }
  }, [touristId])

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-blue-50 to-gray-100 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-5 text-white text-center">
          <p className="text-xs uppercase tracking-widest text-blue-200 font-semibold">
            Government of India · Smart Tourist Safety
          </p>
          <h1 className="text-xl font-bold mt-1">Digital Tourist ID Verification</h1>
          <p className="text-xs text-blue-200 mt-0.5">AbhayaMarg Official Portal</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 font-medium">Verifying ID on secure registry...</p>
            </div>
          ) : error || !tourist ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✕
              </div>
              <h2 className="text-lg font-bold text-gray-800">Verification Unsuccessful</h2>
              <p className="text-sm text-red-600 px-4">{error || 'Tourist ID is invalid or unregistered.'}</p>
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-block text-sm text-blue-700 hover:underline font-medium"
                >
                  &larr; Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Status Badge */}
              <div className="text-center">
                {tourist.status === 'LOST' ? (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-red-800">
                    <span className="inline-block animate-ping w-2.5 h-2.5 bg-red-600 rounded-full mr-2" />
                    <span className="font-bold text-base tracking-wide text-red-700 uppercase">
                      ⚠️ ALERT: REPORTED MISSING / LOST
                    </span>
                    <p className="text-xs mt-1 text-red-600">
                      This tourist has an active missing incident reported. If located, please contact emergency contacts below or call 112 immediately.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full inline-block" />
                    <span className="font-bold text-sm uppercase tracking-wide text-green-800">
                      ✓ Authenticated & Active Tourist
                    </span>
                  </div>
                )}
              </div>

              {/* Tourist Card Data */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2.5 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Tourist Name</span>
                  <span className="font-bold text-gray-800">{tourist.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Digital Tourist ID</span>
                  <span className="font-mono font-bold text-blue-700">{tourist.touristId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Registration Date</span>
                  <span className="text-gray-700">{formatTimestamp(tourist.createdAt) || 'Active'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Emergency Contact</span>
                  <span className="font-medium text-gray-800">{tourist.emergencyContactName || '—'}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500">Contact Number</span>
                  <span className="font-mono font-medium text-gray-800">{tourist.emergencyContactPhone || '—'}</span>
                </div>
              </div>

              {/* Emergency Action Buttons */}
              <div className="space-y-2 pt-2">
                {tourist.emergencyContactPhone && (
                  <a
                    href={`tel:${tourist.emergencyContactPhone}`}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition text-sm shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                    </svg>
                    Call Emergency Contact ({tourist.emergencyContactName || 'Family'})
                  </a>
                )}

                <a
                  href="tel:112"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition text-sm shadow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6.75a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V7.5A.75.75 0 0112 6.75zm0 9.375a.9375.9375 0 100-1.875.9375.9375 0 000 1.875z" clipRule="evenodd" />
                  </svg>
                  Dial National Emergency Helpline (112)
                </a>
              </div>

              <div className="text-center pt-2">
                <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 underline">
                  AbhayaMarg Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyTourist
