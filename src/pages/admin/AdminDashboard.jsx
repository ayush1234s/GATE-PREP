// src/pages/admin/AdminDashboard.jsx
// Ultra-Pro Admin Dashboard — Rich system analytics, recent users snapshot,
// subject breakdown grid, quick admin action shortcuts, and live Firestore status.

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, Layers, PlayCircle, ShieldCheck,
  ArrowRight, UserX, CheckCircle2, RefreshCw,
  Database, Sparkles, Megaphone, Bell
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllUsersProfiles, seedFullCurriculum, subscribeToAdminNotifications } from '@/firebase/firestore'
import { CURRICULUM_DATA } from '@/data/curriculumData'
import { formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [users,         setUsers]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [seeding,       setSeeding]       = useState(false)
  const [broadcastCount, setBroadcastCount] = useState(0)

  // Calculate curriculum stats
  let totalUnits = 0
  let totalLectures = 0
  const subjectStats = Object.values(CURRICULUM_DATA).map(subject => {
    let uCount = (subject.units || []).length
    let lCount = 0
    ;(subject.units || []).forEach(u => {
      lCount += (u.lectures || []).length
      totalUnits++
      totalLectures += (u.lectures || []).length
    })
    return {
      id: subject.id,
      name: subject.name,
      icon: subject.icon,
      units: uCount,
      lectures: lCount,
    }
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const uList = await getAllUsersProfiles()
      setUsers(uList)
    } catch (err) {
      console.warn('Admin load users notice:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Subscribe to admin broadcast count for the dashboard card
  useEffect(() => {
    const unsub = subscribeToAdminNotifications(
      (list) => setBroadcastCount(list.length),
      () => {}
    )
    return unsub
  }, [])

  const disabledUsersCount = users.filter(u => u.disabled).length
  const activeUsersCount   = users.length - disabledUsersCount

  // Seed default curriculum helper
  const handleSeedCurriculum = async () => {
    if (!confirm('Re-seed full 10-subject GATE ECE curriculum to Firestore?')) return
    setSeeding(true)
    const tid = toast.loading('Seeding 10 subjects, 49 units, and 150+ lectures to Firestore...')
    try {
      await seedFullCurriculum(CURRICULUM_DATA)
      toast.success('Full GATE ECE Curriculum seeded successfully! 🎉', { id: tid })
    } catch (err) {
      toast.error('Seeding failed: ' + err.message, { id: tid })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── 1. Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 p-6 md:p-8 text-white shadow-2xl border border-purple-800/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-extrabold text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Admin Control Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300">
                <Database className="w-3.5 h-3.5" /> Firestore Live Connected
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              GATE-PREP System Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time administrative monitoring of user access, account controls, and curriculum video contents across all 10 GATE ECE subjects.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={handleSeedCurriculum}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold transition-all border border-slate-700 shadow-md flex items-center gap-1.5"
              title="Seed default subjects to Firestore"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{seeding ? 'Seeding...' : 'Seed Curriculum'}</span>
            </button>

            <button
              onClick={loadData}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. System Metrics Cards (6 Grid) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
          { label: 'Active Aspirants', value: activeUsersCount, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
          { label: 'Disabled Accounts', value: disabledUsersCount, icon: UserX, color: 'text-red-400 bg-red-950/40 border-red-800/40' },
          { label: 'GATE Subjects', value: Object.keys(CURRICULUM_DATA).length, icon: BookOpen, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
          { label: 'Curriculum Units', value: totalUnits, icon: Layers, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
          { label: 'Video Lectures', value: totalLectures, icon: PlayCircle, color: 'text-pink-400 bg-pink-950/40 border-pink-800/40' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * 0.04 }}
            className={`p-4 rounded-2xl border bg-slate-900/90 shadow-md space-y-2 ${color}`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{value}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold truncate">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 3. Main Action Modules ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Module A: Users Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Users className="w-5 h-5" />
                <h2 className="font-bold text-base text-white">Users Control</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800/50">
                {users.length} Registered
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full control over student user accounts. Disable logins or delete accounts permanently.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">{activeUsersCount} Active</span> • <span className="text-red-400 font-bold">{disabledUsersCount} Disabled</span>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module B: Curriculum Manager */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <BookOpen className="w-5 h-5" />
                <h2 className="font-bold text-base text-white">Curriculum Manager</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800/50">
                {totalLectures} Lectures
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create & edit subjects, units, lectures and YouTube video links for live streaming.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="text-blue-400 font-bold">10 Subjects</span> • <span className="text-amber-400 font-bold">{totalUnits} Units</span>
            </div>
            <button
              onClick={() => navigate('/admin/curriculum')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module C: Notification Broadcaster */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Megaphone className="w-5 h-5" />
                <h2 className="font-bold text-base text-white">Notifications</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800/50">
                {broadcastCount} Sent
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Broadcast announcements to all students. Appears instantly in every user's notification bell.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-amber-500" />
              <span className="text-amber-400 font-bold">{broadcastCount} broadcast{broadcastCount !== 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={() => navigate('/admin/notifications')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. Subject Breakdown Snapshot Grid ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">GATE ECE Subjects Breakdown</h2>
          </div>
          <button
            onClick={() => navigate('/admin/curriculum')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {subjectStats.map(s => (
            <div key={s.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{s.icon || '📚'}</span>
                <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-950/80 border border-indigo-800/40 px-2 py-0.5 rounded-full">
                  {s.lectures} Lecs
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate">{s.name}</p>
              <p className="text-[10px] text-slate-400">{s.units} Units</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard
