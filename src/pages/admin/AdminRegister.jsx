import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerAdmin } from '../../firebase/authService'
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors'

function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [adminKey, setAdminKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (!adminKey.trim()) {
      setError('Admin Security Passcode is required.')
      return
    }

    setLoading(true)
    try {
      await registerAdmin(formData, adminKey)
      navigate('/admin')
    } catch (err) {
      if (err.message && err.message.includes('Admin Security Passcode')) {
        setError(err.message)
      } else {
        setError(getFriendlyAuthErrorMessage(err))
      }
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
            Internal Clearance
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-3">Register Admin Officer</h1>
          <p className="text-xs text-gray-400 mt-1">
            Create an authorized safety administration account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Officer / Full Name
            </label>
            <input
              name="fullName"
              type="text"
              placeholder="e.g. Commander Vikram Rathore"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Official Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="officer@safety.gov.in"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition pr-16"
                required
                autoComplete="new-password"
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

          {/* Admin Security Key */}
          <div className="border-t border-gray-800 pt-3">
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>Admin Security Passcode</span>
              <span className="text-[10px] text-gray-500 font-normal">Required for authorization</span>
            </label>
            <input
              type="password"
              placeholder="Enter master authorization code"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-gray-800/80 border border-amber-600/50 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 placeholder-gray-600 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              Default system passcode: <code className="text-amber-400 font-mono bg-gray-800 px-1 py-0.5 rounded">ABHAYA-ADMIN-2026</code>
            </p>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800/70 text-red-200 px-3.5 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 text-sm mt-1"
          >
            {loading ? 'Creating Admin Account...' : 'Register & Launch Console'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Already have an administrator account?{' '}
          <Link to="/admin/login" className="text-amber-400 font-semibold hover:underline">
            Admin Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AdminRegister
