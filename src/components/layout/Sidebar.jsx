import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
]



function Sidebar({ onNavigate }) {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white w-64">
      <div className="px-5 py-5 border-b border-gray-800">
        <p className="text-lg font-bold tracking-wide">TouristShield</p>
        <p className="text-xs text-gray-400">Safety Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

    </div>
  )
}

export default Sidebar