import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, logoutUser } from '../../firebase/authService'
import { getUserProfile } from '../../firebase/userService'
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await loginUser(email, password)
      const profile = await getUserProfile(user.uid)

      // Strict role enforcement: Only admins may enter through this portal
      if (profile?.role !== 'admin') {
        // Immediately invalidate session for unauthorized non-admin
        await logoutUser()
        setError('ACCESS DENIED: This account does not possess Administrator clearance. Tourists must sign in through the Tourist Portal.')
        setLoading(false)
        return
      }

      navigate('/admin')
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-950 via-gray-900 to-slate-900 flex items-center justify-center py-12 px-4 text-white">
      <div className="max-w-md w-full bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-800 p-6 sm:p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-3 shadow-inner">
            🛡️
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Authorized Personnel Only
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-3">Admin Command Portal</h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to access fleet monitoring, emergency SOS, and geofence controls
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Official Admin Email
            </label>
            <input
              type="email"
              placeholder="officer@safety.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pr-16"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800/70 text-red-200 px-3.5 py-3 rounded-xl text-xs font-medium leading-relaxed">
              <p>{error}</p>
              {error.includes('Tourist Portal') && (
                <Link
                  to="/login"
                  className="inline-block mt-2 font-bold text-amber-400 hover:underline"
                >
                  &rarr; Click here to go to Tourist Portal
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 text-sm mt-1"
          >
            {loading ? 'Authenticating Clearance...' : 'Authenticate & Enter Console'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <Link
            to="/admin/register"
            className="text-amber-400 hover:underline font-medium"
          >
            Register Admin Account &rarr;
          </Link>
          <Link to="/login" className="text-gray-400 hover:text-white underline">
            Tourist Portal
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
