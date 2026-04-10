import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MessageSquare, FileText, Bell, LayoutGrid, Settings, LogIn, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/',              icon: MessageSquare, label: 'Chat'       },
  { to: '/forms',         icon: FileText,      label: 'Forms'      },
  { to: '/announcements', icon: Bell,          label: 'News'       },
  { to: '/sitemap',       icon: LayoutGrid,    label: 'Directory'  },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) => location.pathname === to

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer flex-shrink-0">
          <img src="/logo.png" alt="Yamamer" className="h-8 w-8 object-contain" />
          <span className="font-bold text-violet-900 text-lg tracking-tight">Yamamer</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                isActive(to)
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                isActive('/admin')
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <Settings size={15} />
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150 cursor-pointer"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors duration-150 cursor-pointer shadow-sm"
            >
              <LogIn size={15} />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-violet-100 bg-white px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive(to) ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {user && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive('/admin') ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings size={16} />
              Admin
            </Link>
          )}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white cursor-pointer"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
