function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString()
}

function LocationHistoryCard({ history = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Recent Location History</h3>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No location history yet.</p>
      ) : (
        <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
          {history.map((reading) => (
            <li key={reading.id} className="flex justify-between border-b pb-2 last:border-0">
              <span className="font-mono text-xs">
                {reading.latitude.toFixed(5)}, {reading.longitude.toFixed(5)}
              </span>
              <span className="text-xs text-gray-500">
                {reading.source} · {formatTimestamp(reading.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LocationHistoryCard