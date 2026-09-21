import { QRCodeSVG } from 'qrcode.react'

function TouristIdCard({ tourist }) {
  if (!tourist) return null

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${tourist.touristId}`
    : `https://abhayamarg.web.app/verify/${tourist.touristId}`

  const isLost = tourist.status === 'LOST'

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />

      <div className="relative p-5 sm:p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-100">Digital Tourist ID</p>
            <p className="text-lg font-bold">AbhayaMarg</p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isLost ? 'bg-amber-400 text-gray-900 animate-pulse' : 'bg-green-500/90 text-white'
            }`}
          >
            {tourist.status}
          </span>
        </div>

        <div className="mt-6 flex gap-4 items-center">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 p-1.5 shadow-md">
            <QRCodeSVG
              value={verificationUrl}
              size={68}
              level="M"
              className="w-full h-full"
              title="Scan to verify Tourist ID"
            />
          </div>
          <div>
            <p className="text-xs text-blue-100">Official Tourist ID</p>
            <p className="text-xl font-mono font-bold tracking-wide">{tourist.touristId}</p>
            <a
              href={`/verify/${tourist.touristId}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-200 hover:text-white underline inline-block mt-0.5"
            >
              Verify Status &rarr;
            </a>
          </div>
        </div>

        <div className="mt-5 border-t border-white/20 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-100">Full Name</span>
            <span className="font-medium">{tourist.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">Emergency Contact</span>
            <span className="font-medium text-right">{tourist.emergencyContactName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">Emergency Phone</span>
            <span className="font-medium">{tourist.emergencyContactPhone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TouristIdCard