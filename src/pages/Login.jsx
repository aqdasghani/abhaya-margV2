import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, logoutUser } from '../firebase/authService'
import { getUserProfile } from '../firebase/userService'
import { getFriendlyAuthErrorMessage } from '../utils/authErrors'

function Login() {
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

      // Collision prevention: If an admin tries to sign in here, direct them to the Admin Portal
      if (profile?.role === 'admin') {
        await logoutUser()
        setError('NOTICE: This account is registered as an Administrator. Please sign in via the Admin Portal.')
        setLoading(false)
        return
      }

      navigate('/dashboard')
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-3 shadow-inner">
            🧳
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Tourist Safety Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Tourist Sign In</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access your Digital Tourist ID, live tracking, and safety tools
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
              Registered Email
            </label>
            <input
              type="email"
              placeholder="tourist@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition pr-16"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-3 rounded-xl text-xs font-medium leading-relaxed">
              <p>{error}</p>
              {error.includes('Admin Portal') && (
                <Link
                  to="/admin/login"
                  className="inline-block mt-2 font-bold text-blue-800 hover:underline"
                >
                  &rarr; Click here to open the Admin Portal
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition shadow-md disabled:opacity-60 text-sm mt-1"
          >
            {loading ? 'Signing In...' : 'Sign In to Safety Dashboard'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <Link to="/register" className="text-blue-700 font-semibold hover:underline">
            Register for Tourist ID &rarr;
          </Link>
          <Link to="/admin/login" className="text-amber-700 font-medium hover:underline flex items-center gap-1">
            <span>🛡️</span>
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login