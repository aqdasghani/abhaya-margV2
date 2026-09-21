function formatTimestamp(timestamp) {
  if (!timestamp) return null
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function LastKnownLocationCard({ location }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-2">Last Known Location</h3>
      {location ? (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Latitude: <span className="font-mono">{location.latitude}</span></p>
          <p>Longitude: <span className="font-mono">{location.longitude}</span></p>
          {location.accuracy != null && (
            <p>Accuracy: <span className="font-mono">±{Math.round(location.accuracy)}m</span></p>
          )}
          <p>Source: <span className="font-mono">{location.source || 'Unknown'}</span></p>
          <p className="text-xs text-gray-400 mt-1">
            Recorded: {formatTimestamp(location.createdAt)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No location has been recorded yet.</p>
      )}
    </div>
  )
}

export default LastKnownLocationCard