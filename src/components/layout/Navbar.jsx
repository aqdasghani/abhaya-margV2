import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/authService'

function Navbar() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const isAdmin = userProfile?.role === 'admin'

  async function handleLogout() {
    await logoutUser()
    navigate('/')
  }

  return (
    <nav className="bg-blue-900 text-white px-4 sm:px-6 py-3.5 flex justify-between items-center shadow-md border-b border-blue-800/80">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🛡️</span>
        <div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight block leading-tight text-white">
            AbhayaMarg
          </span>
          <span className="text-[10px] text-blue-300 font-semibold tracking-wider uppercase block">
            TouristShield Safety
          </span>
        </div>
      </Link>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
        <Link
          to="/"
          className="text-blue-200 hover:text-white transition px-2 py-1.5 hidden md:inline"
        >
          Home
        </Link>

        {currentUser ? (
          /* Logged In State */
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 px-3.5 py-2 rounded-xl font-bold transition shadow-sm text-xs sm:text-sm"
              >
                <span>🛡️ Admin Console</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-semibold transition shadow-sm text-xs sm:text-sm"
              >
                <span>🧳 Safety Dashboard</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-xs bg-red-600/90 text-white px-3 py-2 rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          /* Logged Out: Two completely separate portal buttons */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Button 1: Tourist Portal */}
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border border-blue-600/60 shadow-sm"
            >
              <span>🧳</span>
              <span>Tourist Portal</span>
            </Link>

            {/* Button 2: Admin Portal */}
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-md"
            >
              <span>🛡️</span>
              <span>Admin Portal</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar