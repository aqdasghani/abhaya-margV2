import { useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/authService'
import { useAdminEmergencyAlerts } from '../../hooks/useAdminEmergencyAlerts'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const {
    activeAlerts,
    dismissAlert,
    dismissAll,
    soundEnabled,
    setSoundEnabled,
  } = useAdminEmergencyAlerts()

  async function handleLogout() {
    await logoutUser()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button className="md:hidden text-gray-700" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Emergency sound chime active' : 'Emergency sound chime muted'}
              className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                soundEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span>{soundEnabled ? '🔔 Alert Sound On' : '🔕 Alert Sound Off'}</span>
            </button>

            <span className="text-sm text-gray-600 hidden sm:inline">{userProfile?.displayName} (Admin)</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Real-Time Emergency Notification Banner */}
        {activeAlerts.length > 0 && (
          <div className="bg-red-600 text-white px-4 py-3 shadow-lg animate-pulse">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="font-bold text-sm sm:text-base">
                    URGENT EMERGENCY ALERT ({activeAlerts.length} new incident{activeAlerts.length > 1 ? 's' : ''})
                  </p>
                  <p className="text-xs text-red-100">
                    Latest: {activeAlerts[0].incidentType} from Tourist {activeAlerts[0].touristId || 'Unknown'} ({activeAlerts[0].incidentId})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to={`/admin/incidents/${activeAlerts[0].incidentId}`}
                  onClick={() => dismissAlert(activeAlerts[0].incidentId)}
                  className="bg-white text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition shadow"
                >
                  View Incident &rarr;
                </Link>
                <button
                  onClick={dismissAll}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-red-500 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout