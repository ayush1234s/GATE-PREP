// src/components/layout/Sidebar.jsx
// Minimalist, high-end Linear/Apple glassmorphic sidebar navigation.
// Features floating active spring pill, 360-degree logo glow, animated progress bar,
// live network status indicator, and elegant user profile footer.

import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  User,
  LogOut,
  GraduationCap,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useAuth }  from '@/contexts/AuthContext'
import useUserProgress from '@/hooks/useUserProgress'
import { CURRICULUM_DATA } from '@/data/curriculumData'
import toast        from 'react-hot-toast'
import NetworkIndicator from '@/components/common/NetworkIndicator'

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subjects',  icon: BookOpen,        label: 'Subjects'  },
  { to: '/tasks',     icon: ClipboardList,   label: 'My Tasks'  },
  { to: '/profile',   icon: User,            label: 'Profile'   },
]

// ─── Single nav link (Glassmorphic Linear Style) ──────────────────────────────
const SidebarLink = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group select-none
       ${isActive
         ? 'text-primary-600 dark:text-primary-400 font-bold'
         : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
       }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Floating active background glass pill */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-glass-pill"
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/15 via-purple-500/10 to-transparent border border-primary-500/30 shadow-xs pointer-events-none"
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          />
        )}

        {/* Left glowing accent bar for active tab */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-2.5 bottom-2.5 w-1.5 rounded-r-full bg-primary-600 dark:bg-primary-400 shadow-sm"
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          />
        )}

        <motion.div
          whileHover={{ scale: 1.1, x: 2 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
            isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
          }`} />
        </motion.div>

        <span className="flex-1 relative z-10">{label}</span>
      </>
    )}
  </NavLink>
)

// ─── User Avatar ──────────────────────────────────────────────────────────────
const Avatar = ({ name, photoURL, size = 'sm' }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'

  return (
    <div className="relative flex-shrink-0">
      {photoURL ? (
        <img
          src={photoURL}
          alt={name || 'User Avatar'}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className={`${sz} rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs`}
        />
      ) : (
        <div className={`${sz} rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs`}>
          {initials}
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-card-dark" title="Active Aspirant" />
    </div>
  )
}

// ─── Sidebar inner content (Clean & Uncluttered) ──────────────────────────────
const SidebarContent = ({ onClose }) => {
  const { displayName, email, photoURL, logout } = useAuth()
  const { completedIds } = useUserProgress()
  const navigate = useNavigate()

  // Calculate overall syllabus percentage
  let totalSyllabusLectures = 0
  Object.values(CURRICULUM_DATA).forEach(s => {
    (s.units || []).forEach(u => {
      totalSyllabusLectures += (u.lectures || []).length
    })
  })
  const completedCount = completedIds.size
  const progressPct    = totalSyllabusLectures > 0 ? Math.round((completedCount / totalSyllabusLectures) * 100) : 0

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Failed to log out.')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card-dark text-slate-800 dark:text-white border-r border-slate-100 dark:border-slate-800/80 shadow-xs select-none">

      {/* ── 1. Clean Logo Header with Animated Ring ── */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative p-0.5">
            {/* Rotating border halo */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-400 via-primary-500 to-purple-600 p-0.5 blur-xs opacity-70"
            />
            <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-purple-600 flex items-center justify-center shadow-md shadow-primary-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          </div>

          <div>
            <p className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-1">
              <span>GATE</span><span className="text-primary-600 dark:text-primary-400">-PREP</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">ECE 2026 Edition</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── 2. Navigation Menu ── */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-wider">
          Main Navigation
        </p>

        {NAV_ITEMS.map(item => (
          <SidebarLink key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* ── 3. Live Network Status Widget ── */}
      <div className="px-4 mb-3">
        <NetworkIndicator />
      </div>

      {/* ── 4. Dynamic Progress Widget ── */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="px-4 py-3 mx-4 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 shadow-2xs"
      >
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
            <span>Syllabus Progress</span>
          </span>
          <span className="text-primary-600 dark:text-primary-400 font-extrabold">{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* ── 5. User Footer ── */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar name={displayName} photoURL={photoURL} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

    </div>
  )
}

// ─── Main Sidebar export ──────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop — fixed */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile — animated drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col fixed top-0 left-0 h-full w-64 z-40 shadow-2xl lg:hidden"
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
export { Avatar }
