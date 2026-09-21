import { useEffect, useState } from 'react'
import {
  subscribeToGeofences,
  createGeofence,
  updateGeofence,
  setGeofenceActive,
  deleteGeofence,
  syncGovernmentGeofences,
} from '../../firebase/geofenceService'
import { fetchGovernmentRiskZones } from '../../services/govGeofenceService'

const emptyForm = { name: '', description: '', latitude: '', longitude: '', radius: '', riskLevel: 'LOW' }

function AdminGeofences() {
  const [geofences, setGeofences] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL | GOV | MANUAL

  useEffect(() => {
    const unsub = subscribeToGeofences(setGeofences)
    return unsub
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function startEdit(geofence) {
    setEditingId(geofence.id)
    setForm({
      name: geofence.name,
      description: geofence.description || '',
      latitude: String(geofence.latitude),
      longitude: String(geofence.longitude),
      radius: String(geofence.radius),
      riskLevel: geofence.riskLevel || 'LOW',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        radius: parseFloat(form.radius),
        riskLevel: form.riskLevel,
        source: 'MANUAL',
      }
      if (editingId) {
        await updateGeofence(editingId, payload)
      } else {
        await createGeofence(payload)
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function handleToggleActive(geofence) {
    await setGeofenceActive(geofence.id, !geofence.active)
  }

  async function handleDelete(geofence) {
    if (window.confirm(`Are you sure you want to delete geofence "${geofence.name}"?`)) {
      await deleteGeofence(geofence.id)
    }
  }

  async function handleSyncGovernment() {
    setSyncing(true)
    setSyncResult(null)
    setError('')
    try {
      const { zones, source } = await fetchGovernmentRiskZones()
      const result = await syncGovernmentGeofences(zones)
      setSyncResult({ ...result, source })
    } catch (err) {
      setError(`Failed to sync government hazard zones: ${err.message}`)
    }
    setSyncing(false)
  }

  const riskBadge = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700',
  }

  const filteredGeofences = geofences.filter((g) => {
    if (filter === 'GOV') return g.source === 'GOVERNMENT_API'
    if (filter === 'MANUAL') return g.source !== 'GOVERNMENT_API'
    return true
  })

  const govCount = geofences.filter((g) => g.source === 'GOVERNMENT_API').length
  const manualCount = geofences.length - govCount

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Safety Geofences</h1>
          <p className="text-gray-500 text-sm">
            Configure safety perimeters from official government databases and custom administrative zones.
          </p>
        </div>
      </div>

      {/* Government Database / API Integration Panel */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Official Integration
              </span>
              <span className="text-xs text-blue-200">NDMA · ASI · SDMA · Coastal · Forest</span>
            </div>
            <h2 className="text-lg font-bold">Government Hazard & Restricted Zone Databases</h2>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Synchronize live disaster warning corridors (landslides, flash-floods), protected national heritage
              conservation perimeters, and active wildlife crossing safety buffers directly from official government databases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleSyncGovernment}
              disabled={syncing}
              className="bg-white hover:bg-blue-50 text-blue-900 font-semibold px-5 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2 disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {syncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing API...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.75A.75.75 0 003 12.828v4.479a.75.75 0 001.5 0v-2.18l.432.432a7 7 0 0011.758-3.155.75.75 0 00-1.378-.58zM4.688 8.576a5.5 5.5 0 019.201-2.466l.312.311H11.768a.75.75 0 000 1.5h4.482A.75.75 0 0017 7.172V2.693a.75.75 0 00-1.5 0v2.18l-.432-.432A7 7 0 003.31 7.596a.75.75 0 001.378.58z" clipRule="evenodd" />
                  </svg>
                  Sync Government API Zones
                </>
              )}
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mt-4 p-3 bg-blue-950/60 border border-blue-400/40 rounded-xl text-xs flex items-center justify-between flex-wrap gap-2 text-blue-100">
            <span>
              ✓ Synchronized successfully: <strong>{syncResult.addedCount} new zones added</strong>,{' '}
              <strong>{syncResult.skippedCount} existing zones up to date</strong>. Source:{' '}
              <span className="font-mono">{syncResult.source}</span>.
            </span>
            <button
              onClick={() => setSyncResult(null)}
              className="text-blue-300 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Manual Geofence Addition / Edit Form */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">
            {editingId ? 'Edit Geofence' : 'Add Custom Geofence (Manual)'}
          </h3>
          <span className="text-xs text-gray-500">
            Manual administrator entry
          </span>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-3">
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              name="name"
              placeholder="e.g. Dangerous Cliff Edge / Construction Perimeter"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea
              name="description"
              placeholder="Safety guidelines or warnings displayed to tourists inside this zone..."
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Latitude</label>
            <input
              name="latitude"
              type="number"
              step="any"
              placeholder="e.g. 28.6139"
              value={form.latitude}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Longitude</label>
            <input
              name="longitude"
              type="number"
              step="any"
              placeholder="e.g. 77.2090"
              value={form.longitude}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Radius (meters)</label>
            <input
              name="radius"
              type="number"
              step="any"
              placeholder="e.g. 500"
              value={form.radius}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">Risk Level</label>
            <select
              name="riskLevel"
              value={form.riskLevel}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="LOW">LOW — Advisory / Informational</option>
              <option value="MEDIUM">MEDIUM — Caution / Restricted Entry</option>
              <option value="HIGH">HIGH — Critical Hazard / Danger Zone</option>
            </select>
          </div>
          <div className="sm:col-span-1 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? 'Saving...' : editingId ? 'Update Zone' : 'Add Geofence'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="sm:col-span-3 text-red-600 text-xs font-medium">{error}</p>}
        </form>
      </div>

      {/* Geofences List Table with Filter Tabs */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Zones ({geofences.length})
            </button>
            <button
              onClick={() => setFilter('GOV')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'GOV'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Government API ({govCount})
            </button>
            <button
              onClick={() => setFilter('MANUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'MANUAL'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Manual ({manualCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 border-b">
              <tr>
                <th className="p-3">Zone Details</th>
                <th className="p-3">Source</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Radius</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGeofences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No geofences found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredGeofences.map((geofence) => {
                  const isGov = geofence.source === 'GOVERNMENT_API'
                  return (
                    <tr key={geofence.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <p className="font-semibold text-gray-800">{geofence.name}</p>
                        {geofence.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{geofence.description}</p>
                        )}
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          {Number(geofence.latitude).toFixed(4)}, {Number(geofence.longitude).toFixed(4)}
                        </p>
                      </td>
                      <td className="p-3">
                        {isGov ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            Govt ({geofence.agency || 'NDMA'})
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 w-fit">
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskBadge[geofence.riskLevel] || riskBadge.LOW}`}>
                          {geofence.riskLevel}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-700">{geofence.radius}m</td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            geofence.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {geofence.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(geofence)}
                            className="text-blue-700 hover:underline text-xs font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">·</span>
                          <button
                            onClick={() => handleToggleActive(geofence)}
                            className="text-gray-600 hover:underline text-xs font-medium cursor-pointer"
                          >
                            {geofence.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <span className="text-gray-300">·</span>
                          <button
                            onClick={() => handleDelete(geofence)}
                            className="text-red-600 hover:underline text-xs font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminGeofences