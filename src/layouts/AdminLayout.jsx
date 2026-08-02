// src/layouts/AdminLayout.jsx
// Admin layout mirroring the student AppLayout exactly:
// Fixed left sidebar (desktop) + animated mobile drawer + sticky top navbar.

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen, Megaphone,
  ShieldCheck, LogOut, X, ExternalLink, Bell,
  Menu, GraduationCap,
} from 'lucide-react'
import { useAuth }    from '@/contexts/AuthContext'
import NetworkIndicator from '@/components/common/NetworkIndicator'
import toast from 'react-hot-toast'

// ─── Admin nav items (sidebar) ────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/admin/users',          icon: Users,           label: 'Users Control'   },
  { to: '/admin/curriculum',     icon: BookOpen,        label: 'Curriculum'      },
  { to: '/admin/notifications',  icon: Megaphone,       label: 'Notifications'   },
]

// ─── Sidebar nav link ─────────────────────────────────────────────────────────
const AdminSidebarLink = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group
       ${isActive
         ? 'bg-purple-500/15 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
         : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
       }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="admin-sidebar-active"
            className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-purple-600 dark:bg-purple-400"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
          isActive
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
        }`} />
        <span className="flex-1">{label}</span>
      </>
    )}
  </NavLink>
)

// ─── Admin Sidebar Content ────────────────────────────────────────────────────
const AdminSidebarContent = ({ onClose }) => {
  const { displayName, email } = useAuth()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out of Admin Center.')
      navigate('/admin/login', { replace: true })
    } catch {
      toast.error('Logout failed.')
    }
  }

  const handleGoStudent = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white border-r border-slate-800">

      {/* ── 1. Logo Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight leading-none">
              GATE<span className="text-purple-400">-PREP</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Mobile close */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── 2. Navigation ── */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-500 px-4 mb-3 uppercase tracking-wider">
          Admin Menu
        </p>
        {ADMIN_NAV.map(item => (
          <AdminSidebarLink key={item.to} {...item} onClick={onClose} />
        ))}

        {/* Divider */}
        <div className="pt-4 pb-2">
          <p className="text-[11px] font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider">
            Quick Actions
          </p>
          <button
            onClick={handleGoStudent}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-all"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0 text-slate-600" />
            <span>Student Portal</span>
          </button>
        </div>
      </nav>

      {/* ── 3. Network Status ── */}
      <div className="px-4 mb-3">
        <NetworkIndicator />
      </div>

      {/* ── 4. Admin Footer ── */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Admin avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-purple-400 font-semibold mt-0.5">System Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Navbar (top bar) ───────────────────────────────────────────────────
const AdminNavbar = ({ onMenuClick, pageTitle }) => {
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-sm">

      {/* Left — hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open admin menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">{pageTitle}</h1>
            <p className="text-[10px] font-medium text-slate-500 hidden sm:block mt-0.5">Admin Control Panel</p>
          </div>
        </div>
      </div>

      {/* Right — network + admin badge */}
      <div className="flex items-center gap-2">
        <div className="w-auto max-w-[140px] hidden sm:block">
          <NetworkIndicator compact popupDirection="down" />
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[11px] font-extrabold text-purple-300">
          <ShieldCheck className="w-3 h-3" />
          Admin
        </span>
      </div>
    </header>
  )
}

// ─── Page title from pathname ─────────────────────────────────────────────────
const getPageTitle = (pathname) => {
  if (pathname.includes('/users'))         return 'Users Control'
  if (pathname.includes('/curriculum'))    return 'Curriculum Manager'
  if (pathname.includes('/notifications')) return 'Notifications'
  return 'Admin Dashboard'
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Get page title from current route
  const pathname = window.location.pathname
  const pageTitle = getPageTitle(pathname)

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* ── Fixed Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-30 shadow-sm">
        <AdminSidebarContent />
      </aside>

      {/* ── Mobile Animated Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="admin-mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col fixed top-0 left-0 h-full w-64 z-40 shadow-2xl lg:hidden"
          >
            <AdminSidebarContent onClose={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="admin-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Main area (right of sidebar on desktop) ── */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">

        {/* Sticky navbar */}
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(p => !p)}
          pageTitle={pageTitle}
        />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 xl:p-8 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-800 text-center text-xs text-slate-600 font-medium">
          © 2026 GATE-PREP Admin System · All database changes sync live to Firestore.
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout
