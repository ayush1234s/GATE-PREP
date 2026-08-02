// src/layouts/AdminLayout.jsx
// Dedicated layout shell for Admin Portal — Top Header navigation, Admin badges,
// quick navigation tabs, and system status indicators.

import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, LayoutDashboard, Users, BookOpen,
  LogOut, ExternalLink, Sparkles
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import NetworkIndicator from '@/components/common/NetworkIndicator'

const ADMIN_NAV = [
  { to: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/users',      label: 'Users Control', icon: Users          },
  { to: '/admin/curriculum', label: 'Curriculum & Videos', icon: BookOpen  },
]

const AdminLayout = ({ children }) => {
  const { logout, displayName } = useAuth()
  const navigate = useNavigate()

  const handleAdminLogout = async () => {
    try {
      await logout()
      toast.success('Signed out of Admin Center.')
      navigate('/admin/login', { replace: true })
    } catch {
      toast.error('Logout failed.')
    }
  }

  const handleGoToStudentLogin = async () => {
    try {
      await logout()
      toast('Redirecting to Student Login...', { icon: '🎓' })
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

      {/* ── Admin Top Navigation Header ── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between shadow-xl">

        {/* Brand & Admin Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-base font-black text-white tracking-tight truncate">GATE-PREP Admin</h1>
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full flex-shrink-0">
                System Admin
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate hidden sm:block">Control Panel & Database Management</p>
          </div>
        </div>

        {/* Admin Nav Tabs */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60">
          {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Network Indicator */}
          <div className="w-auto max-w-[130px] hidden sm:block">
            <NetworkIndicator compact />
          </div>

          {/* Return to Client Site (Requires Student Login) */}
          <button
            onClick={handleGoToStudentLogin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
            title="Switch to Student Login"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Student Login</span>
          </button>

          {/* Admin Sign Out */}
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-colors border border-red-800/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 p-2 text-xs font-bold">
        {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl ${
                isActive ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* ── Admin Footer ── */}
      <footer className="py-4 px-6 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
        © 2026 GATE-PREP Admin System. All database modifications sync live to Firestore.
      </footer>

    </div>
  )
}

export default AdminLayout
