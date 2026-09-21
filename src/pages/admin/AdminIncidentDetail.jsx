import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getIncidentById, resolveIncident } from '../../firebase/adminService'
import { getTouristProfile } from '../../firebase/touristService'

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function AdminIncidentDetail() {
  const { incidentId } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [tourist, setTourist] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadIncident = useCallback(async () => {
    const data = await getIncidentById(incidentId)
    setIncident(data)
    if (data?.uid) {
      const touristData = await getTouristProfile(data.uid)
      setTourist(touristData)
    }
    setLoading(false)
  }, [incidentId])

  useEffect(() => {
    loadIncident()
  }, [loadIncident])

  async function handleResolve() {
    await resolveIncident(incidentId)
    loadIncident()
  }

  if (loading) return <p className="text-gray-500">Loading incident...</p>
  if (!incident) return <p className="text-gray-500">Incident not found.</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-mono">{incident.incidentId}</h1>
          <p className="text-gray-500 text-sm">{incident.incidentType} incident</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          incident.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {incident.status}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 space-y-2 text-sm">
        <p><span className="text-gray-500">Tourist ID:</span> <span className="font-mono">{incident.touristId}</span></p>
        {tourist && (
          <>
            <p><span className="text-gray-500">Name:</span> {tourist.fullName}</p>
            <p><span className="text-gray-500">Phone:</span> {tourist.phone}</p>
            <p><span className="text-gray-500">Emergency Contact:</span> {tourist.emergencyContactName} ({tourist.emergencyContactPhone})</p>
          </>
        )}
        <p><span className="text-gray-500">Latitude:</span> <span className="font-mono">{incident.latitude}</span></p>
        <p><span className="text-gray-500">Longitude:</span> <span className="font-mono">{incident.longitude}</span></p>
        <p><span className="text-gray-500">Location Source:</span> <span className="font-mono">{incident.locationSource}</span></p>
        {incident.incidentType === 'GEOFENCE' && (
  <>
    <p><span className="text-gray-500">Zone Name:</span> {incident.geofenceName}</p>
    <p><span className="text-gray-500">Risk Level:</span> {incident.riskLevel}</p>
  </>
)}
        <p><span className="text-gray-500">Reported:</span> {formatTimestamp(incident.createdAt)}</p>
        {incident.resolvedAt && (
          <p><span className="text-gray-500">Resolved:</span> {formatTimestamp(incident.resolvedAt)}</p>
        )}
      </div>

      <div className="flex gap-3">
        {incident.status === 'ACTIVE' && (
          <button onClick={handleResolve} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
            Mark as RESOLVED
          </button>
        )}
        <button onClick={() => navigate('/admin/incidents')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Back to Incidents
        </button>
      </div>
    </div>
  )
}

export default AdminIncidentDetail