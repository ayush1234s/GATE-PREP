// src/pages/Profile.jsx
// World-Class User Profile & Settings Page — Ultra-Premium Dark/Light Glassmorphism,
// Holographic Rotating Avatar Halo, 3D Tilt Metallic Student ID Card, Fluid Progress Animations,
// Gamified Achievement Medals, Profile Credentials Editor, and 7-Day Recovery Danger Zone.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Calendar, Shield, Key, CheckCircle2,
  BookOpen, LogOut, Save, Award, BarChart3,
  Copy, Check, Fingerprint, Trash2, AlertTriangle,
  X, Sparkles, Trophy, Zap, Star, ShieldCheck,
  Target, Edit3, Camera, TrendingUp, Lock, CheckCircle
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

// Predefined Avatars for quick selection
const PRESET_AVATARS = [
  { id: 'scholar',   url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Scholar' },
  { id: 'engineer',  url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Engineer' },
  { id: 'innovator', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Innovator' },
  { id: 'master',    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', label: 'Master' },
  { id: 'cyberpunk', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', label: 'Cyber' },
  { id: 'astro',     url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', label: 'Astro' },
]

// ─── 3D Tilt Metallic Student ID Card ───────────────────────────────────────
const StudentDigitalIdCard = ({ displayName, studentId, email, avatarUrl, photoURL, initials }) => {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotateX(-y / 12)
    setRotateY(x / 12)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white border border-amber-400/40 shadow-2xl space-y-4 overflow-hidden group cursor-pointer"
      >
        {/* Metallic Shine Sweep Overlay */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
        />

        <div className="flex items-center justify-between z-10 relative">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Student Identity Card
          </span>
          <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300 border border-white/10">
            GATE ECE
          </span>
        </div>

        <div className="flex items-center gap-4 z-10 relative">
          <div className="relative">
            {avatarUrl || photoURL ? (
              <img
                src={avatarUrl || photoURL}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400 text-white font-black text-xl flex items-center justify-center shadow-lg">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
              <Check className="w-3 h-3 text-slate-950" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-base text-white truncate">{displayName}</h4>
            <p className="text-xs font-mono text-amber-300 font-bold">{studentId}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
          </div>
        </div>

        {/* Barcode & Security Micro Chip */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 relative">
          <div className="flex items-center gap-1">
            {/* Barcode lines graphic */}
            <div className="flex items-center gap-0.5 opacity-60">
              <div className="w-1 h-5 bg-slate-200" />
              <div className="w-0.5 h-5 bg-slate-200" />
              <div className="w-1.5 h-5 bg-slate-200" />
              <div className="w-0.5 h-5 bg-slate-200" />
              <div className="w-1 h-5 bg-slate-200" />
              <div className="w-2 h-5 bg-slate-200" />
            </div>
            <span className="text-[9px] text-slate-400 ml-1">VERIFIED</span>
          </div>

          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            STATUS: ACTIVE
          </span>
        </div>
      </motion.div>
    </div>
  )
}

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
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
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

  const [activeTab, setActiveTab]         = useState('overview') // 'overview' | 'badges' | 'settings' | 'security'
  const [name, setName]                   = useState(displayName || '')
  const [avatarUrl, setAvatarUrl]         = useState(photoURL || '')
  const [targetYear, setTargetYear]       = useState(userProfile?.targetYear || 'GATE ECE 2026')
  const [targetRank, setTargetRank]       = useState(userProfile?.targetRank || 'AIR Top 100')
  const [bio, setBio]                     = useState(userProfile?.bio || 'Determined GATE ECE aspirant building deep concept mastery!')
  const [isUpdating, setIsUpdating]       = useState(false)
  const [isResetting, setIsResetting]     = useState(false)
  const [copied, setCopied]               = useState(false)
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
  const scholarLevel   = Math.max(1, Math.floor(completedCount / 5) + 1)

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
    { id: 'first_step', title: 'First Step', desc: 'Completed 1st lecture', icon: Sparkles, color: 'from-amber-400 to-orange-500', earned: completedCount >= 1, req: '1 Lecture' },
    { id: 'consistent', title: 'On a Roll', desc: 'Completed 5+ lectures', icon: Zap, color: 'from-blue-400 to-indigo-600', earned: completedCount >= 5, req: '5 Lectures' },
    { id: 'master_10',  title: 'Topic Scholar', desc: 'Completed 10+ lectures', icon: Trophy, color: 'from-emerald-400 to-teal-600', earned: completedCount >= 10, req: '10 Lectures' },
    { id: 'gate_pro',   title: 'GATE Specialist', desc: 'Reached 25%+ syllabus', icon: Star, color: 'from-purple-400 to-pink-600', earned: progressPct >= 25, req: '25% Progress' },
    { id: 'halfway',    title: 'Halfway Hero', desc: 'Reached 50%+ syllabus', icon: Award, color: 'from-cyan-400 to-blue-600', earned: progressPct >= 50, req: '50% Progress' },
    { id: 'champion',   title: 'AIR Contender', desc: 'Reached 75%+ syllabus', icon: Target, color: 'from-amber-300 via-yellow-400 to-amber-500', earned: progressPct >= 75, req: '75% Progress' },
  ]

  const handleCopyId = () => {
    if (studentId) {
      navigator.clipboard.writeText(studentId)
      setCopied(true)
      toast.success('Student ID copied to clipboard! 📋')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsUpdating(true)
    const tid = toast.loading('Saving profile changes...')
    try {
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: name.trim(),
          photoURL: avatarUrl.trim() || null
        })
      }
      if (uid) {
        await updateUserProfile(uid, {
          name: name.trim(),
          photoURL: avatarUrl.trim() || null,
          targetYear,
          targetRank,
          bio
        })
      }
      if (refreshProfile) await refreshProfile()
      toast.success('Profile updated successfully!', { id: tid })
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message, { id: tid })
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* ── 1. Hero Banner with Holographic Animated Halo Ring ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-indigo-900/50"
      >
        {/* Glow ambient Orbs */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.25, 1, 1.25], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

          {/* Left: Avatar & Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left min-w-0">
            {/* Avatar Container with 360 Rotating Holographic Ring */}
            <div className="relative flex-shrink-0 group">
              <div className="relative p-1.5">
                {/* Rotating Gradient Halo Border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400 via-primary-500 to-purple-500 p-1 blur-xs"
                />

                <div className="relative z-10 rounded-2xl overflow-hidden bg-slate-950 p-1">
                  {avatarUrl || photoURL ? (
                    <img
                      src={avatarUrl || photoURL}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-slate-900 shadow-inner group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 border-2 border-white/20 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-inner">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Shield Badge (Top-Right) */}
              <motion.div
                whileHover={{ scale: 1.15, rotate: 10 }}
                className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900 z-20 cursor-pointer"
                title="Verified GATE ECE Aspirant"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-950" />
              </motion.div>

              {/* Level Badge (Bottom) */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-3 py-0.5 rounded-full shadow-xl border-2 border-slate-900 flex items-center gap-1 font-black text-[10px] uppercase tracking-wider z-20 cursor-pointer"
                title="Scholar Level"
              >
                <Award className="w-3 h-3 text-slate-950" />
                <span>Level {scholarLevel} Scholar</span>
              </motion.div>
            </div>

            {/* Name, Credentials & Bio */}
            <div className="space-y-2.5 min-w-0 pt-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 backdrop-blur text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Aspirant
                </span>
              </div>

              {/* Student ID & Email Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-medium text-slate-300">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 transition-colors backdrop-blur px-3 py-1 rounded-xl text-white font-mono font-bold border border-slate-700/60 shadow-sm"
                  title="Click to copy Student ID"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                  <span>{studentId}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>

                <span className="flex items-center gap-1.5 bg-slate-800/60 backdrop-blur px-3 py-1 rounded-xl border border-slate-700/40 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-primary-300" /> {email}
                </span>
              </div>

              {/* Personal Bio & Target Goal */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-purple-300 font-semibold bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                  <Target className="w-3.5 h-3.5" /> {targetYear} ({targetRank})
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Joined {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Circular Progress Summary & Actions */}
          <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0 w-full md:w-auto">
            <div className="bg-slate-900/80 backdrop-blur border border-indigo-900/60 rounded-2xl p-4 text-center md:text-right w-full sm:w-auto min-w-[200px] shadow-lg">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syllabus Mastered</span>
                <span className="text-xs font-bold text-emerald-400">{completedCount} / {totalSyllabusLectures}</span>
              </div>
              <p className="text-3xl font-black text-white leading-none mb-2">{progressPct}%</p>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-400 via-primary-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                onClick={logout}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-600 hover:text-white border border-red-500/30 text-red-300 text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Navigation Tabs with Pill Glow Indicator ── */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Mastery', icon: BarChart3 },
          { id: 'badges',   label: 'Achievements & Badges', icon: Trophy, badge: badges.filter(b => b.earned).length },
          { id: 'settings', label: 'Edit Profile & Avatar', icon: User     },
          { id: 'security', label: 'Security & Recovery', icon: Shield   },
        ].map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center relative ${
              activeTab === id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {badge !== undefined && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT WITH ANMATED SPRING TRANSITION ── */}
      <AnimatePresence mode="wait">
        {/* ── TAB 1: OVERVIEW & MASTERY ── */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="space-y-6"
          >
            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Completed Lectures', value: `${completedCount} / ${totalSyllabusLectures}`, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Overall Progress',   value: `${progressPct}%`, icon: TrendingUp, color: 'text-primary-500 bg-primary-500/10 border-primary-500/20' },
                { label: 'Subject Count',      value: '10 Core ECE', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                { label: 'Scholar Level',      value: `Level ${scholarLevel}`, icon: Award, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">
                    {value}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Subject Mastery Progress Section */}
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  <h2 className="font-bold text-base text-slate-800 dark:text-white">Subject Mastery Progress (10 Core Subjects)</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">GATE ECE Curriculum</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectBreakdown.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2.5 hover:border-primary-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{s.icon}</span>
                        <span className="truncate max-w-[200px]">{s.name}</span>
                      </span>
                      <span className="text-primary-600 dark:text-primary-400 font-mono">{s.pct}% ({s.done}/{s.total})</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* ── TAB 2: ACHIEVEMENTS & BADGES ── */}
        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-base text-slate-800 dark:text-white">Gamified Achievements & Medals</h2>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {badges.filter(b => b.earned).length} / {badges.length} Unlocked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b) => {
                  const Icon = b.icon
                  return (
                    <motion.div
                      key={b.id}
                      whileHover={b.earned ? { scale: 1.04, rotate: 1 } : {}}
                      transition={{ duration: 0.2 }}
                      className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                        b.earned
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 shadow-md'
                          : 'bg-slate-50/40 dark:bg-slate-800/10 border-slate-200/50 dark:border-slate-800 opacity-60 grayscale'
                      }`}
                    >
                      {/* Metallic Shine for Earned Badges */}
                      {b.earned && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-300/20 to-transparent pointer-events-none" />
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {b.req}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-800 dark:text-white mb-1">{b.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{b.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          b.earned ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                          {b.earned ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Unlocked & Earned
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: EDIT PROFILE & AVATAR ── */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Predefined Avatars & Student ID Card Preview */}
            <div className="space-y-6 lg:col-span-1">
              {/* 3D Tilt Metallic Student Digital ID Card */}
              <StudentDigitalIdCard
                displayName={name || displayName}
                studentId={studentId}
                email={email}
                avatarUrl={avatarUrl}
                photoURL={photoURL}
                initials={initials}
              />

              {/* Quick Avatar Selector */}
              <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary-500" /> Choose Preset Avatar
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AVATARS.map((av) => (
                    <motion.button
                      key={av.id}
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAvatarUrl(av.url)}
                      className={`p-1 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                        avatarUrl === av.url
                          ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-12 h-12 rounded-xl object-cover" />
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{av.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Form details */}
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="font-bold text-base text-slate-800 dark:text-white">Edit Profile Details & Goals</h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                  <label htmlFor="avatar-url" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Avatar Photo URL (Custom Image)
                  </label>
                  <input
                    id="avatar-url"
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="target-year" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Exam Year
                    </label>
                    <select
                      id="target-year"
                      value={targetYear}
                      onChange={e => setTargetYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      <option value="GATE ECE 2026">GATE ECE 2026</option>
                      <option value="GATE ECE 2027">GATE ECE 2027</option>
                      <option value="GATE ECE 2028">GATE ECE 2028</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="target-rank" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Rank Goal
                    </label>
                    <input
                      id="target-rank"
                      type="text"
                      value={targetRank}
                      onChange={e => setTargetRank(e.target.value)}
                      placeholder="e.g. AIR Top 100"
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio-text" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Aspirant Bio / Target Line
                  </label>
                  <textarea
                    id="bio-text"
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Share your GATE preparation motivation..."
                  />
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdating ? 'Saving…' : 'Save Profile Changes'}
                  </motion.button>
                </div>
              </form>
            </div>

          </motion.div>
        )}

        {/* ── TAB 4: SECURITY & RECOVERY ── */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="space-y-6"
          >

            {/* Password Security Card */}
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-base text-slate-800 dark:text-white">Account Security & Password</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Reset Password Link</p>
                  <p className="text-xs text-slate-400 mt-0.5">Receive a secure password reset link to {email}</p>
                </div>

                <button
                  onClick={handleSendResetEmail}
                  disabled={isResetting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors flex-shrink-0"
                >
                  <Key className="w-4 h-4" />
                  {isResetting ? 'Sending…' : 'Send Reset Email'}
                </button>
              </div>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-red-200 dark:border-red-900/40 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-red-100 dark:border-red-900/30 pb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-base text-red-600 dark:text-red-400">Danger Zone</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Delete Account (7-Day Grace Period)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Queue account for permanent deletion with a 7-day recovery window. Requires Student ID confirmation.
                  </p>
                </div>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

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
