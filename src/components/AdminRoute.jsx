import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
  const { currentUser, userProfile } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (userProfile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute