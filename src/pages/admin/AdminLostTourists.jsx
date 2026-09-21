import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToTourists } from '../../firebase/adminService'

function AdminLostTourists() {
  const [tourists, setTourists] = useState([])

  useEffect(() => {
    const unsub = subscribeToTourists(setTourists)
    return unsub
  }, [])

  const lostTourists = tourists.filter((t) => t.status === 'LOST')

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lost Tourists</h1>
        <p className="text-gray-500 text-sm">{lostTourists.length} tourist{lostTourists.length !== 1 ? 's' : ''} currently marked as lost</p>
      </div>

      {lostTourists.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-sm text-gray-500">No tourists are currently marked as lost.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lostTourists.map((tourist) => (
            <Link
              key={tourist.uid}
              to={`/admin/lost/${tourist.uid}`}
              className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition block"
            >
              <p className="font-semibold text-gray-800">{tourist.fullName}</p>
              <p className="text-xs font-mono text-gray-500">{tourist.touristId}</p>
              <span className="inline-block mt-2 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">LOST</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminLostTourists