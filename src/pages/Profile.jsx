// src/pages/Profile.jsx
// World-Class User Profile & Settings Page — Hero Banner with Glassmorphism,
// Gamified Achievement Badges, Subject Mastery Breakdown, Profile Settings, and 7-Day Danger Zone.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Calendar, Shield, Key, CheckCircle2,
  BookOpen, Flame, LogOut, Save, Award, BarChart3,
  Copy, Check, Fingerprint, Trash2, AlertTriangle,
  X, Sparkles, Trophy, Zap, Compass, Star, ChevronRight,
  ShieldCheck, ExternalLink, RefreshCw
} from 'lucide-react'
import toast                 from 'react-hot-toast'
import { useAuth }           from '@/contexts/AuthContext'
import useUserProgress       from '@/hooks/useUserProgress'
import { CURRICULUM_DATA }   from '@/data/curriculumData'
import { formatDate }        from '@/utils/helpers'
import { resetPassword }     from '@/firebase/auth'
import { updateUserProfile, scheduleAccountDeletion } from '@/firebase/firestore'
import { updateProfile }     from 'firebase/auth'
import { useNavigate }       from 'react-router-dom'

// ─── Delete Account Confirmation Modal ───────────────────────────────────────
const DeleteAccountModal = ({ isOpen, onClose, studentId, uid, logout }) => {
  const navigate = useNavigate()
  const [confirmInput, setConfirmInput] = useState('')
  const [deleting, setDeleting]         = useState(false)

  if (!isOpen) return null

  const isConfirmed = confirmInput.trim() === studentId

  const handleScheduleDelete = async () => {
    if (!isConfirmed || !uid) return
    setDeleting(true)
    const tid = toast.loading('Scheduling account deletion...')
    try {
      await scheduleAccountDeletion(uid)
      toast.success('Account scheduled for deletion! You have 7 days to recover it by logging in.', { id: tid, duration: 6000 })
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error('Failed to schedule deletion: ' + err.message, { id: tid })
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={  { opacity: 0, scale: 0.9, y: 10 }}
          className="bg-white dark:bg-card-dark rounded-3xl border border-red-200 dark:border-red-800/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">Delete Account</h3>
              <p className="text-[11px] text-red-500 font-semibold uppercase tracking-wider">7-Day Grace Period Active</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
            <p>
              Your account will be queued for <strong>permanent deletion in 7 days</strong>.
            </p>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
              💡 <strong>Recovery Window:</strong> You can log in anytime within the next 7 days to cancel deletion and instantly recover your account!
            </div>
            <p className="text-xs">
              To confirm, type your Student ID <strong className="font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{studentId}</strong> below:
            </p>

            <input
              type="text"
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              placeholder={`Type ${studentId} to confirm`}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleDelete}
              disabled={!isConfirmed || deleting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? 'Scheduling…' : 'Schedule 7-Day Deletion'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
  const { currentUser, userProfile, displayName, email, photoURL, studentId, uid, logout, refreshProfile } = useAuth()
  const { completedIds } = useUserProgress()

  const [activeTab, setActiveTab]     = useState('overview') // 'overview' | 'settings' | 'security'
  const [name, setName]               = useState(displayName || '')
  const [isUpdating, setIsUpdating]   = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [copied, setCopied]           = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Total syllabus metrics
  let totalSyllabusLectures = 0
  Object.values(CURRICULUM_DATA).forEach(s => {
    (s.units || []).forEach(u => {
      totalSyllabusLectures += (u.lectures || []).length
    })
  })

  const completedCount = completedIds.size
  const progressPct    = totalSyllabusLectures > 0 ? Math.round((completedCount / totalSyllabusLectures) * 100) : 0
  const joinedDate     = userProfile?.createdAt ? formatDate(userProfile.createdAt) : '—'
  const initials       = (name || email || 'S').slice(0, 2).toUpperCase()

  // Per-subject breakdown
  const subjectBreakdown = useMemo(() => {
    return Object.values(CURRICULUM_DATA).map(subject => {
      let done = 0
      let total = 0
      ;(subject.units || []).forEach(u => {
        ;(u.lectures || []).forEach(l => {
          total++
          if (completedIds.has(l.id)) done++
        })
      })
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      return {
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        done,
        total,
        pct,
      }
    })
  }, [completedIds])

  // Gamified Badges
  const badges = [
    { id: 'first_step', title: 'First Step', desc: 'Completed 1st lecture', icon: Sparkles, color: 'from-amber-400 to-orange-500', earned: completedCount >= 1 },
    { id: 'consistent', title: 'On a Roll', desc: 'Completed 5+ lectures', icon: Zap, color: 'from-blue-400 to-indigo-600', earned: completedCount >= 5 },
    { id: 'master_10',  title: 'Topic Scholar', desc: 'Completed 10+ lectures', icon: Trophy, color: 'from-emerald-400 to-teal-600', earned: completedCount >= 10 },
    { id: 'gate_pro',   title: 'GATE Specialist', desc: 'Reached 25%+ syllabus', icon: Star, color: 'from-purple-400 to-pink-600', earned: progressPct >= 25 },
  ]

  const handleCopyId = () => {
    if (studentId) {
      navigator.clipboard.writeText(studentId)
      setCopied(true)
      toast.success('Student ID copied to clipboard! 📋')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsUpdating(true)
    const tid = toast.loading('Updating profile...')
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: name.trim() })
      }
      if (uid) {
        await updateUserProfile(uid, { name: name.trim() })
      }
      if (refreshProfile) await refreshProfile()
      toast.success('Profile updated successfully!', { id: tid })
    } catch (err) {
      toast.error('Failed to update name: ' + err.message, { id: tid })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendResetEmail = async () => {
    if (!email) return
    setIsResetting(true)
    const tid = toast.loading('Sending password reset link...')
    try {
      await resetPassword(email)
      toast.success('Password reset link sent to ' + email, { id: tid })
    } catch (err) {
      toast.error('Failed to send reset email: ' + err.message, { id: tid })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── 1. Hero Banner with Glassmorphism ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0   }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-purple-800 p-6 md:p-8 text-white shadow-2xl"
      >
        {/* Glowing background shapes */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left min-w-0">
            {/* Avatar with verified & achievement badges overlay */}
            <div className="relative flex-shrink-0 group">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white/40 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur border-2 border-white/40 text-white font-black text-3xl flex items-center justify-center shadow-2xl">
                  {initials}
                </div>
              )}

              {/* Verified Aspirant Badge (Top-Right near image) */}
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white" title="Verified GATE Aspirant">
                <ShieldCheck className="w-4 h-4 text-emerald-950" />
              </div>

              {/* Golden GATE ECE Rank Badge (Bottom-Right near image) */}
              <div className="absolute -bottom-2 -right-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-2.5 py-1 rounded-xl shadow-xl border-2 border-white flex items-center gap-1 font-black text-[10px] uppercase tracking-wider" title="GATE ECE 2026 Aspirant Badge">
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span>GATE ECE</span>
              </div>
            </div>

            {/* Name, Email, ID */}
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur text-white border border-white/20">
                  GATE ECE Aspirant
                </span>
              </div>

              {/* ID & Email bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-medium text-primary-100">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors backdrop-blur px-3 py-1 rounded-xl text-white font-mono font-bold border border-white/20 shadow-sm"
                  title="Click to copy Student ID"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                  <span>{studentId}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white/70" />}
                </button>

                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                  <Mail className="w-3.5 h-3.5" /> {email}
                </span>
              </div>

              <p className="text-[11px] text-primary-200 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5" /> Member since {joinedDate}
              </p>
            </div>
          </div>

          {/* Right: Quick Progress Badge & Logout */}
          <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0 w-full md:w-auto">
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-4 text-center md:text-right w-full sm:w-auto min-w-[180px]">
              <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Syllabus Mastered</p>
              <p className="text-3xl font-black text-white leading-none mt-1">{progressPct}%</p>
              <div className="w-full h-1.5 rounded-full bg-white/20 mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-300 to-emerald-300 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/80 transition-all backdrop-blur text-white text-xs font-bold w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Top Navigation Tabs ── */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Badges', icon: BarChart3 },
          { id: 'settings', label: 'Edit Profile Details', icon: User     },
          { id: 'security', label: 'Security & Danger Zone', icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === id
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & BADGES ── */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Completed Lectures', value: completedCount,         icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Overall Progress',   value: `${progressPct}%`,     icon: BarChart3,    color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
              { label: 'Total Syllabus',     value: totalSyllabusLectures, icon: BookOpen,     color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'       },
              { label: 'Study Streak',       value: 'Active 🔥',           icon: Flame,        color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'   },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <div
                key={label}
                className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">
                  {value}
                </p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Gamified Achievements Section */}
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-slate-800 dark:text-white">Achievements & Badges</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {badges.filter(b => b.earned).length} / {badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {badges.map((b) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      b.earned
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 shadow-sm'
                        : 'bg-slate-50/40 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800 opacity-50 grayscale'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center mb-3 shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white mb-0.5">{b.title}</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{b.desc}</p>
                    {b.earned && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        Unlocked 🎉
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Subject Mastery Progress Section */}
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-base text-slate-800 dark:text-white">Subject Mastery Progress (10 Core Subjects)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectBreakdown.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <span>{s.name}</span>
                    </span>
                    <span className="text-primary-600 dark:text-primary-400">{s.pct}% ({s.done}/{s.total})</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

      {/* ── TAB 2: EDIT PROFILE DETAILS ── */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-base text-slate-800 dark:text-white">Edit Profile Credentials</h2>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4 max-w-lg">
            {/* Unique Student ID Card */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Unique Student ID
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 font-bold text-xs">
                    ID:
                  </span>
                  <input
                    type="text"
                    value={studentId}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono font-bold bg-primary-50/50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 outline-none cursor-default"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="px-3.5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                  title="Copy Student ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Your unique GATE-PREP student identifier generated on registration.</p>
            </div>

            <div>
              <label htmlFor="display-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Display Name
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                required
              />
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <input
                id="email-address"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Managed securely by Firebase Authentication.</p>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving…' : 'Save Profile Changes'}
            </button>
          </form>
        </motion.div>
      )}

      {/* ── TAB 3: SECURITY & DANGER ZONE ── */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Password Security */}
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-base text-slate-800 dark:text-white">Account Security</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Reset Password</p>
                <p className="text-xs text-slate-400 mt-0.5">Receive a password reset email link at {email}</p>
              </div>

              <button
                onClick={handleSendResetEmail}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors flex-shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                {isResetting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </div>
          </div>

          {/* Danger Zone: 7-Day Account Deletion */}
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-red-200 dark:border-red-900/40 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-red-100 dark:border-red-900/30 pb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-base text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Delete Account (7-Day Grace Period)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Queue account for permanent deletion with a 7-day recovery window. Requires Student ID confirmation.
                </p>
              </div>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </button>
            </div>
          </div>

        </motion.div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        studentId={studentId}
        uid={uid}
        logout={logout}
      />

    </div>
  )
}

export default Profile
