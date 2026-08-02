// src/components/layout/Navbar.jsx
// Ultra-Pro Navigation Bar — Glassmorphic styling, page title & live progress chip,
// interactive notifications dropdown with counter badge, student ID preview, and user menu.

import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate }    from 'react-router-dom'
import { motion, AnimatePresence }     from 'framer-motion'
import {
  Menu, Sun, Moon, Bell, LogOut, User, ChevronDown,
  Trash2, CheckCircle2, BookOpen, X, Sparkles, Fingerprint,
  ClipboardList, ShieldCheck, Copy, Check
} from 'lucide-react'
import { useAuth }  from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import useNotifications from '@/hooks/useNotifications'
import useUserProgress from '@/hooks/useUserProgress'
import { CURRICULUM_DATA } from '@/data/curriculumData'
import { Avatar }   from './Sidebar'
import toast        from 'react-hot-toast'
import NetworkIndicator from '@/components/common/NetworkIndicator'

// Page title map
const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',  sub: 'Overview & Analytics' },
  '/subjects':  { title: 'Subjects',   sub: '10 Core GATE ECE Topics' },
  '/tasks':     { title: 'My Tasks',   sub: 'Syllabus Tracker' },
  '/profile':   { title: 'Profile',    sub: 'Account & Preferences' },
}

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const seconds = Math.floor((new Date() - date) / 1000)

  if (seconds < 60)  return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ─── Notification Dropdown Panel ──────────────────────────────────────────────
const NotificationPanel = ({ onClose }) => {
  const { notifications, deleteNotification, clearAllNotifications } = useNotifications()

  const handleClearAll = async () => {
    await clearAllNotifications()
    toast.success('All notifications cleared')
  }

  const handleDeleteOne = async (e, id, isAdmin) => {
    e.stopPropagation()
    await deleteNotification(id, isAdmin)
    toast.success('Notification removed')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={  { opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed top-16 left-3 right-3 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-96 rounded-3xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-white leading-none">Notifications</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time activity &amp; announcements</p>
          </div>
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
              {notifications.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[11px] text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="py-10 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mx-auto mb-2 border border-emerald-100 dark:border-emerald-800/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">All caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">Completed lectures &amp; admin announcements appear here.</p>
          </div>
        ) : (
          notifications.map((item) => {
            const isAdmin = item.type === 'admin_broadcast'
            return (
              <div
                key={item.id}
                className={`p-3.5 transition-colors group flex items-start justify-between gap-3 ${
                  isAdmin
                    ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10 border-l-2 border-amber-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base shadow-xs ${
                    isAdmin
                      ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isAdmin ? '📢' : (item.subjectIcon || '🎓')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {isAdmin ? (item.subject || 'Announcement') : (item.subjectName || 'Subject')}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {isAdmin ? (
                      <>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                          {item.message}
                        </p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            <BookOpen className="w-3 h-3" /> Open Link
                          </a>
                        )}
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Admin Broadcast
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.unitName || 'Unit'}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                          <span className="truncate">{item.lectureTitle || 'Lecture'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteOne(e, item.id, isAdmin)}
                  title="Remove notification"
                  className="p-1.5 rounded-lg transition-all opacity-80 hover:opacity-100 flex-shrink-0 mt-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}


// ─── Pro User Dropdown Menu ───────────────────────────────────────────────────
const UserMenu = ({ onClose }) => {
  const { displayName, email, studentId, logout } = useAuth()
  const navigate  = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyId = (e) => {
    e.stopPropagation()
    if (studentId) {
      navigator.clipboard.writeText(studentId)
      setCopied(true)
      toast.success('Student ID copied! 📋')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLogout = async () => {
    onClose()
    try {
      await logout()
      toast.success('Logged out successfully.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Failed to log out.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={  { opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-2xl py-2 z-50 overflow-hidden"
    >
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-slate-800 dark:text-white truncate">{displayName}</p>
          <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md">
            PRO
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate">{email}</p>

        {/* Student ID Copy Pill */}
        <button
          onClick={handleCopyId}
          className="mt-2.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
        >
          <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{studentId}</span>
          </span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Menu items */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => { navigate('/profile'); onClose() }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <User className="w-4 h-4 text-primary-600" />
          <span>My Profile & Stats</span>
        </button>

        <button
          onClick={() => { navigate('/tasks'); onClose() }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ClipboardList className="w-4 h-4 text-purple-600" />
          <span>My Tasks & Progress</span>
        </button>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 p-1 mt-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme }   = useTheme()
  const { displayName, photoURL, studentId } = useAuth()
  const { notifications }         = useNotifications()
  const { completedIds }          = useUserProgress()
  const location                  = useLocation()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)

  const userMenuRef = useRef(null)
  const notifRef    = useRef(null)

  const pageMeta  = PAGE_TITLES[location.pathname] || { title: 'GATE-PREP', sub: 'ECE Platform' }
  const unreadCount = notifications.length

  // Calculate overall syllabus percentage
  let totalSyllabusLectures = 0
  Object.values(CURRICULUM_DATA).forEach(s => {
    (s.units || []).forEach(u => {
      totalSyllabusLectures += (u.lectures || []).length
    })
  })
  const completedCount = completedIds.size
  const progressPct    = totalSyllabusLectures > 0 ? Math.round((completedCount / totalSyllabusLectures) * 100) : 0

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 bg-white/85 dark:bg-card-dark/85 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm">

      {/* Left — Hamburger + Title & Live Progress Chip */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-none">
              {pageMeta.title}
            </h1>
            <p className="text-[10px] font-medium text-slate-400 hidden sm:block mt-0.5">
              {pageMeta.sub}
            </p>
          </div>

          {/* Live Progress Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800/40 text-[11px] font-bold text-primary-700 dark:text-primary-300">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{progressPct}% Mastered</span>
          </div>
        </div>
      </div>

      {/* Right — Theme Toggle + Notifications + Pro User Pill */}
      <div className="flex items-center gap-2">

        {/* Network Indicator (Responsive) */}
        <div className="w-auto max-w-[140px] hidden sm:block">
          <NetworkIndicator compact popupDirection="down" />
        </div>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'sun' : 'moon'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate:   0, opacity: 1 }}
              exit={  { rotate:  90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {isDark
                ? <Sun  className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-slate-500" />
              }
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Notification Bell with Badge Counter */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white font-extrabold text-[9px] ring-2 ring-white dark:ring-card-dark animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </AnimatePresence>
        </div>

        {/* User Pill & Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            id="user-menu-btn"
            onClick={() => setUserMenuOpen(p => !p)}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-xs"
            aria-label="User menu"
          >
            <Avatar name={displayName} photoURL={photoURL} size="sm" />
            <div className="hidden sm:block text-left pr-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[90px] leading-tight">
                {displayName.split(' ')[0]}
              </p>
              <p className="text-[9px] font-semibold text-primary-600 dark:text-primary-400 leading-none mt-0.5">
                GATE Aspirant
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} />}
          </AnimatePresence>
        </div>

      </div>
    </header>
  )
}

export default Navbar
