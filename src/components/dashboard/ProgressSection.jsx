// src/components/dashboard/ProgressSection.jsx
// Horizontal progress bar section with % label, completed/total counts, and GATE subjects grid.

import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle2, Clock, BookOpen, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SUBJECT_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-purple-500 to-indigo-500',
  'from-teal-500 to-emerald-500',
  'from-cyan-500 to-blue-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
]

// Mini subject progress card
const SubjectRow = ({ name, icon, completed, total, index = 0 }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const colorGradient = SUBJECT_COLORS[index % SUBJECT_COLORS.length]

  return (
    <Link
      to="/subjects"
      className="group block p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
    >
      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white mb-2">
        <span className="flex items-center gap-2 truncate max-w-[75%]">
          <span className="text-base">{icon || '📚'}</span>
          <span className="truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{name}</span>
        </span>
        <span className="text-slate-400 font-mono text-[11px]">
          {completed}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorGradient} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.05 * index, ease: 'easeOut' }}
        />
      </div>
    </Link>
  )
}

const ProgressSection = ({
  progress      = 0,
  completed     = 0,
  total         = 0,
  pending       = 0,
  subjectStats  = [],
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-800 dark:text-white">Overall Syllabus Mastery</h2>
            <p className="text-xs text-slate-400">Track real-time progress across 10 GATE ECE subjects</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">
            {progress}%
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Completed</p>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="space-y-1.5">
        <div className="h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 via-purple-600 to-emerald-500 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
          <span>0% (Start)</span>
          <span>50% (Halfway)</span>
          <span>100% (GATE Ready)</span>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, label: 'Completed', value: completed, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: Clock,        label: 'Pending',   value: pending,   color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'   },
          { icon: BookOpen,     label: 'Total',     value: total,     color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'     },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`text-center p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 ${color}`}>
            <Icon className="w-4 h-4 mx-auto mb-1 opacity-90" />
            <p className="text-xl font-black leading-tight">{value}</p>
            <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-subject breakdown */}
      {subjectStats.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              10 GATE ECE Subjects breakdown
            </p>
            <Link to="/subjects" className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectStats.map((s, i) => (
              <SubjectRow key={s.name} {...s} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProgressSection
