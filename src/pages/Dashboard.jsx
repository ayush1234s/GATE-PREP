// src/pages/Dashboard.jsx
// Full dashboard page — welcome banner, stats grid, progress section, continue studying.
// All stats update in real-time based on completed lectures with staggered entrance animations.

import { useMemo }       from 'react'
import { motion }        from 'framer-motion'
import {
  BookOpen, CheckCircle2, Clock, BarChart3,
  BookMarked, Flame, ArrowRight, Sparkles, Shield
} from 'lucide-react'
import { Link }          from 'react-router-dom'
import { useAuth }       from '@/contexts/AuthContext'
import useUserProgress   from '@/hooks/useUserProgress'
import { CURRICULUM_DATA } from '@/data/curriculumData'
import { formatDate }    from '@/utils/helpers'
import WelcomeBanner     from '@/components/dashboard/WelcomeBanner'
import StatsCard         from '@/components/dashboard/StatsCard'
import ProgressSection   from '@/components/dashboard/ProgressSection'
import ContinueStudying  from '@/components/dashboard/ContinueStudying'
import { WelcomeSkeleton, StatsCardSkeleton } from '@/components/common/SkeletonLoader'

const GATE_TIPS = [
  'Spend at least 2 hours daily on weak subjects for consistent improvement.',
  'Attempt previous year GATE questions after each topic.',
  'Focus on Networks and Signals — they carry the highest weightage.',
  'Use active recall: close your notes and explain concepts aloud.',
  'Review your mistakes weekly to identify recurring patterns.',
  'Take full-length mock tests every weekend to improve time management.',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const Dashboard = () => {
  const { userProfile, loading: authLoading, displayName } = useAuth()
  const { completedIds, loading: progressLoading }          = useUserProgress()

  const loading = authLoading || progressLoading

  // Calculate total syllabus lectures
  const totalLecturesCount = useMemo(() => {
    let total = 0
    Object.values(CURRICULUM_DATA).forEach(subject => {
      (subject.units || []).forEach(unit => {
        total += (unit.lectures || []).length
      })
    })
    return total
  }, [])

  // Calculate user completion metrics
  const completedCount = completedIds.size
  const pendingCount   = Math.max(0, totalLecturesCount - completedCount)
  const progressPct    = totalLecturesCount > 0 ? Math.round((completedCount / totalLecturesCount) * 100) : 0

  // Per-subject breakdown
  const subjectStats = useMemo(() => {
    return Object.values(CURRICULUM_DATA).map(subject => {
      let completed = 0
      let total = 0
      ;(subject.units || []).forEach(unit => {
        ;(unit.lectures || []).forEach(lec => {
          total++
          if (completedIds.has(lec.id)) {
            completed++
          }
        })
      })
      return {
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        completed,
        total,
      }
    })
  }, [completedIds])

  // Get next uncompleted lectures for "Continue Studying"
  const pendingLectures = useMemo(() => {
    const list = []
    for (const subject of Object.values(CURRICULUM_DATA)) {
      for (const unit of subject.units || []) {
        for (const lec of unit.lectures || []) {
          if (!completedIds.has(lec.id)) {
            list.push({
              id: lec.id,
              subjectId: subject.id,
              subjectName: subject.name,
              subjectIcon: subject.icon,
              unitId: unit.id,
              unitName: unit.name,
              title: lec.title,
              order: lec.order,
            })
            if (list.length >= 3) return list
          }
        }
      }
    }
    return list
  }, [completedIds])

  const joinedDate = userProfile?.createdAt
    ? formatDate(userProfile.createdAt)
    : '—'

  const tip = useMemo(() =>
    GATE_TIPS[Math.floor(Math.random() * GATE_TIPS.length)], [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >

      {/* ── Welcome banner ── */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <WelcomeSkeleton />
        ) : (
          <WelcomeBanner
            name={displayName}
            completedCount={completedCount}
            totalCount={totalLecturesCount}
            progress={progressPct}
          />
        )}
      </motion.div>

      {/* ── Stats cards ── */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={BookOpen}
              value={totalLecturesCount}
              label="Total Lectures"
              color="indigo"
              sub="10 GATE ECE subjects"
              index={0}
            />
            <StatsCard
              icon={CheckCircle2}
              value={completedCount}
              label="Completed"
              color="green"
              sub={totalLecturesCount > 0 ? `${progressPct}% of syllabus` : 'Start studying!'}
              index={1}
            />
            <StatsCard
              icon={Clock}
              value={pendingCount}
              label="Pending"
              color="amber"
              sub={pendingCount > 0 ? 'Lectures remaining' : 'All done! 🎉'}
              index={2}
            />
            <StatsCard
              icon={BarChart3}
              value={`${progressPct}%`}
              label="Overall Score"
              color="purple"
              sub={`Joined ${joinedDate}`}
              index={3}
            />
          </div>
        )}
      </motion.div>

      {/* ── Two-column layout: Progress + Tip ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Progress section (2/3 width) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ProgressSection
            progress={progressPct}
            completed={completedCount}
            total={totalLecturesCount}
            pending={pendingCount}
            subjectStats={subjectStats}
          />
        </motion.div>

        {/* Right column — Tip + Quick links */}
        <div className="flex flex-col gap-4">

          {/* GATE Tip of the Day */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl border border-amber-200 dark:border-amber-800/40 p-5 shadow-sm space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-500 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              </div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                GATE Tip of the Day
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-200 leading-relaxed italic">
              "{tip}"
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
          >
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Quick Actions
            </p>
            <div className="space-y-2">
              {[
                { to: '/subjects', icon: BookMarked, label: 'Browse Subjects',  sub: 'View all GATE ECE topics' },
                { to: '/tasks',    icon: CheckCircle2,label: 'My Tasks & Progress', sub: 'Filter completed & pending'  },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-primary-400/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</p>
                    <p className="text-xs text-slate-400 truncate">{sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Account Summary */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
          >
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Account Summary
            </p>
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-500">
                <span>Member since</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{joinedDate}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Lectures done</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{completedCount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Overall score</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 font-mono">{progressPct}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Continue Studying ── */}
      <motion.div variants={itemVariants}>
        <ContinueStudying lectures={pendingLectures} />
      </motion.div>

    </motion.div>
  )
}

export default Dashboard
