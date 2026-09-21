function ProfileSummaryCard({ userProfile, touristProfile }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Profile</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Full Name</span>
          <span className="font-medium">{touristProfile?.fullName || '—'}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Email</span>
          <span className="font-medium">{userProfile?.email || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium">{touristProfile?.phone || '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default ProfileSummaryCard