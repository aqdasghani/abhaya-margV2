import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { currentUser, userProfile } = useAuth()
  const [lookupId, setLookupId] = useState('')
  const navigate = useNavigate()

  function handleLookup(e) {
    e.preventDefault()
    if (lookupId.trim()) {
      navigate(`/verify/${lookupId.trim()}`)
    }
  }

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-blue-50 via-white to-gray-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span>🇮🇳 Smart India Hackathon Innovation</span>
          <span>·</span>
          <span>Smart Tourist Safety System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
          AbhayaMarg: <span className="text-blue-700">TouristShield</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Intelligent Geo-Fencing, Digital Tourist Identity, and Instant Emergency Response for Safe & Worry-Free Travel.
        </p>

        {/* Dual Portal Entry Cards */}
        {currentUser ? (
          <div className="mt-8 flex justify-center">
            <Link
              to={userProfile?.role === 'admin' ? '/admin' : '/dashboard'}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition text-base flex items-center gap-2"
            >
              <span>{userProfile?.role === 'admin' ? '🛡️ Open Admin Console' : '🧳 Open Safety Dashboard'}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            {/* Card 1: Tourist Portal */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl mb-3">
                  🧳
                </div>
                <h2 className="text-lg font-bold text-gray-900">Tourist Portal</h2>
                <p className="text-xs text-gray-500 mt-1">
                  For visitors & travelers. Get your Digital Tourist ID, enable live GPS tracking, and trigger one-touch SOS.
                </p>
              </div>

              <div className="mt-5 flex gap-2.5">
                <Link
                  to="/login"
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-center py-2.5 rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  Tourist Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-center py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Get Tourist ID
                </Link>
              </div>
            </div>

            {/* Card 2: Admin Portal */}
            <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-gray-800 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl flex items-center justify-center text-xl mb-3">
                  🛡️
                </div>
                <h2 className="text-lg font-bold text-white">Admin Portal</h2>
                <p className="text-xs text-gray-400 mt-1">
                  For emergency responders & administrators. Live fleet tracking map, real-time SOS alerts, and geofence manager.
                </p>
              </div>

              <div className="mt-5 flex gap-2.5">
                <Link
                  to="/admin/login"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 text-center py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Admin Sign In
                </Link>
                <Link
                  to="/admin/register"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-gray-700 text-center py-2.5 rounded-xl text-xs font-medium transition"
                >
                  Register Officer
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Digital ID Quick Verification Card */}
        <div className="mt-10 max-w-lg mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-center">
            🔍 Rapid Digital ID Verification
          </h2>
          <p className="text-xs text-gray-500 text-center mt-1">
            Emergency responders or authorities can verify a tourist's safety status:
          </p>

          <form onSubmit={handleLookup} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g. TS-2026-00001"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
            >
              Verify
            </button>
          </form>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-200 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">🆔</div>
            <h3 className="font-bold text-gray-800 text-lg">Digital Tourist ID & QR</h3>
            <p className="text-sm text-gray-600 mt-2">
              Sequential verified tourist identity cards with scannable QR codes for seamless offline or on-field identity validation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">📍</div>
            <h3 className="font-bold text-gray-800 text-lg">Live Geo-Fencing & Bounds</h3>
            <p className="text-sm text-gray-600 mt-2">
              Real-time proximity calculations that alert tourists immediately if they wander into designated high-risk or restricted zones.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">🚨</div>
            <h3 className="font-bold text-gray-800 text-lg">Instant SOS Incident Alert</h3>
            <p className="text-sm text-gray-600 mt-2">
              One-touch emergency beacon capturing fresh GPS fixes, broadcasting real-time audio and visual alerts to incident responders.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-xs py-6 px-4 text-center">
        <p>© 2026 AbhayaMarg / TouristShield · Smart Tourist Safety & Incident Response System.</p>
        <p className="mt-1 text-gray-500">
          Emergency response assistance · Integrates with National Emergency Helpline (112).
        </p>
      </footer>
    </div>
  )
}

export default Home