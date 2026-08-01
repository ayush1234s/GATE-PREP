// src/pages/Dashboard.jsx
// Full dashboard page — welcome banner, stats grid, progress section, continue studying.
// All stats update in real-time based on completed lectures.

import { useMemo }       from 'react'
import { motion }        from 'framer-motion'
import {
  BookOpen, CheckCircle2, Clock, BarChart3,
  BookMarked, Flame, ArrowRight,
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
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Welcome banner ── */}
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

      {/* ── Stats cards ── */}
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

      {/* ── Two-column layout: Progress + Tip ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Progress section (2/3 width) */}
        <div className="lg:col-span-2">
          <ProgressSection
            progress={progressPct}
            completed={completedCount}
            total={totalLecturesCount}
            pending={pendingCount}
            subjectStats={subjectStats}
          />
        </div>

        {/* Right column — Tip + Quick links */}
        <div className="flex flex-col gap-4">

          {/* GATE Tip of the Day */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/40 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Tip of the Day
              </p>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {tip}
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              {[
                { to: '/subjects', icon: BookMarked, label: 'Browse Subjects',  sub: 'View all GATE ECE topics' },
                { to: '/tasks',    icon: CheckCircle2,label: 'My Tasks & Progress', sub: 'Filter completed & pending'  },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-400 truncate">{sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Account info */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Account Summary
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Member since</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{joinedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lectures done</span>
                <span className="font-medium text-emerald-600">{completedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Overall score</span>
                <span className="font-medium text-primary-600">{progressPct}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Continue Studying ── */}
      <ContinueStudying lectures={pendingLectures} />

    </div>
  )
}

export default Dashboard
