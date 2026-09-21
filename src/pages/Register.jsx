import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../firebase/authService'
import { getFriendlyAuthErrorMessage } from '../utils/authErrors'

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })
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

    // Client-side validations
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit phone number.')
      return
    }

    if (formData.emergencyContactPhone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit emergency contact phone number.')
      return
    }

    setLoading(true)
    try {
      await registerUser(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto text-2xl mb-2">
            🆔
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tourist Registration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create your Digital Tourist ID for a safer, protected journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
              Full Legal Name
            </label>
            <input
              name="fullName"
              type="text"
              placeholder="e.g. Priya Sharma"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="priya@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
              Your Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
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
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition pr-16"
                required
                autoComplete="new-password"
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

          <div className="border-t border-gray-200 pt-4 mt-1">
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Emergency Contact Information
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Contact Person Name
                </label>
                <input
                  name="emergencyContactName"
                  type="text"
                  placeholder="e.g. Ramesh Sharma (Father/Spouse)"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Emergency Phone Number
                </label>
                <input
                  name="emergencyContactPhone"
                  type="tel"
                  placeholder="+91 91234 56789"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
            🔒 <strong>Privacy Commitment:</strong> Location tracking is strictly optional and only active when you enable it on your dashboard. Emergency contact details are accessible exclusively to authorized emergency responders.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition shadow-md disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating your Digital Tourist ID...' : 'Register & Get Tourist ID'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-5 text-center">
          Already registered?{' '}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register