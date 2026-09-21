function GeofenceWarningBanner({ zones }) {
  if (!zones || zones.length === 0) return null

  const riskStyles = {
    LOW: 'bg-green-50 border-green-200 text-green-800',
    MEDIUM: 'bg-amber-50 border-amber-200 text-amber-800',
    HIGH: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className="space-y-2">
      {zones.map((zone) => (
        <div
          key={zone.id}
          className={`border rounded-2xl p-4 text-sm font-medium ${riskStyles[zone.riskLevel] || riskStyles.LOW}`}
        >
          ⚠ You have entered a geo-fenced zone: <span className="font-bold">{zone.name}</span>
          {' '}· Risk level: <span className="font-bold">{zone.riskLevel}</span>
        </div>
      ))}
    </div>
  )
}

export default GeofenceWarningBanner