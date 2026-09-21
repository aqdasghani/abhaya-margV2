function CurrentLocationCard({ coordinates, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-2">Current Location</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Fetching location...</p>
      ) : coordinates ? (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Latitude: <span className="font-mono">{coordinates.latitude}</span></p>
          <p>Longitude: <span className="font-mono">{coordinates.longitude}</span></p>
          {coordinates.accuracy != null && (
            <p>Accuracy: <span className="font-mono">±{Math.round(coordinates.accuracy)}m</span></p>
          )}
          {coordinates.source && (
            <p>Source: <span className="font-mono">{coordinates.source}</span></p>
          )}
        </div>
      ) : (
        <p className="text-sm text-amber-600 font-medium">Current location unavailable.</p>
      )}
    </div>
  )
}

export default CurrentLocationCard