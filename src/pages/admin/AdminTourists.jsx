import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToTourists } from '../../firebase/adminService'

function AdminTourists() {
  const [tourists, setTourists] = useState([])

  useEffect(() => {
    const unsub = subscribeToTourists(setTourists)
    return unsub
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Tourists</h1>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Tourist ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {tourists.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No tourists registered yet.</td>
              </tr>
            ) : (
              tourists.map((tourist) => (
                <tr key={tourist.uid} className="border-t">
                  <td className="p-3 font-mono">{tourist.touristId}</td>
                  <td className="p-3">{tourist.fullName}</td>
                  <td className="p-3">{tourist.phone}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      tourist.status === 'LOST' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {tourist.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/tourists/${tourist.uid}`} className="text-blue-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminTourists