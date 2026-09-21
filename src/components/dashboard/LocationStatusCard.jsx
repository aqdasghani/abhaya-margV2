function LocationStatusCard({ isTracking, onStart, onStop, error }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Location Tracking</h3>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isTracking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isTracking ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {isTracking
          ? 'Your location is being monitored for safety.'
          : 'Enable tracking so your location can be shared in an emergency.'}
      </p>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button
        onClick={isTracking ? onStop : onStart}
        className={`mt-3 text-sm font-medium px-4 py-2 rounded-lg transition ${
          isTracking
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-700 text-white hover:bg-blue-800'
        }`}
      >
        {isTracking ? 'Stop Tracking' : 'Enable Location Tracking'}
      </button>
    </div>
  )
}

export default LocationStatusCard