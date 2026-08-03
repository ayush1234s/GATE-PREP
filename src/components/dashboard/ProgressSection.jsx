// src/components/dashboard/ProgressSection.jsx
// Horizontal progress bar section with % label, completed/total counts, and GATE subjects grid.
// Features liquid gradient animations, subject filter tabs, and interactive micro-cards.

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle2, Clock, BookOpen, Sparkles } from 'lucide-react'
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
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to="/subjects"
        className="group block p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 shadow-xs hover:shadow-md"
      >
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white mb-2">
          <span className="flex items-center gap-2 truncate max-w-[75%]">
            <span className="text-base">{icon || '📚'}</span>
            <span className="truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{name}</span>
          </span>
          <span className="text-primary-600 dark:text-primary-400 font-mono text-[11px] bg-primary-500/10 px-2 py-0.5 rounded-md border border-primary-500/20">
            {completed}/{total} ({pct}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${colorGradient} rounded-full shadow-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.04 * index, ease: 'easeOut' }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

const ProgressSection = ({
  progress      = 0,
  completed     = 0,
  total         = 0,
  pending       = 0,
  subjectStats  = [],
}) => {
  const [filter, setFilter] = useState('all') // 'all' | 'in_progress' | 'mastered'

  const filteredStats = subjectStats.filter(s => {
    const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
    if (filter === 'mastered') return pct === 100
    if (filter === 'in_progress') return pct > 0 && pct < 100
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Overall Syllabus Mastery</span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">Track real-time progress across 10 GATE ECE subjects</p>
          </div>
        </div>

        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
          <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">
            {progress}%
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Syllabus Completed</p>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="space-y-1.5">
        <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 via-purple-600 to-emerald-400 rounded-full shadow-md"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
          <span>0% (Beginner)</span>
          <span>50% (Halfway Scholar)</span>
          <span>100% (GATE Master)</span>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, label: 'Completed', value: completed, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
          { icon: Clock,        label: 'Pending',   value: pending,   color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'   },
          { icon: BookOpen,     label: 'Total',     value: total,     color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'     },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className={`text-center p-3.5 rounded-2xl border ${color} shadow-2xs`}
          >
            <Icon className="w-4 h-4 mx-auto mb-1 opacity-90" />
            <p className="text-xl font-black leading-tight">{value}</p>
            <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Per-subject breakdown */}
      {subjectStats.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              10 GATE ECE Subjects Breakdown
            </p>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
              {[
                { id: 'all', label: 'All (10)' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'mastered', label: 'Mastered' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filter === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStats.length > 0 ? (
              filteredStats.map((s, i) => (
                <SubjectRow key={s.name} {...s} index={i} />
              ))
            ) : (
              <div className="col-span-2 text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold">
                No subjects found in this category yet.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProgressSection
