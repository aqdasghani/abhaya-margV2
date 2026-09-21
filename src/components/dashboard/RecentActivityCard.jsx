function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

function RecentActivityCard({ incidents = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Recent Safety Activity</h3>
      {incidents.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {incidents.map((incident) => (
            <li key={incident.id} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <span className="font-medium text-red-600">{incident.incidentType}</span>
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {incident.status}
                </span>
              </div>
              <span className="text-gray-400 text-xs">{formatTimestamp(incident.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RecentActivityCard