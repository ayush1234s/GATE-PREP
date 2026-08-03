// src/components/subjects/SubjectCard.jsx
// Ultra-premium subject card with gradient headers, micro hover tilt, glowing progress bars, and stats.

import { motion }   from 'framer-motion'
import { Link }     from 'react-router-dom'
import {
  BookOpen, ArrowRight, Layers, GraduationCap, CheckCircle2, Zap
} from 'lucide-react'
import { calcProgress } from '@/utils/helpers'

// ─── Color palette (maps Firestore `color` field → Tailwind classes) ──────────
const COLORS = {
  indigo: {
    gradient:  'from-indigo-600 via-indigo-500 to-purple-600',
    badge:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    progress:  'from-indigo-500 via-purple-500 to-indigo-400',
    glow:      'hover:shadow-indigo-500/25 hover:border-indigo-500/50',
    dot:       'bg-indigo-500',
  },
  blue: {
    gradient:  'from-blue-600 via-blue-500 to-cyan-600',
    badge:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    progress:  'from-blue-500 via-cyan-500 to-blue-400',
    glow:      'hover:shadow-blue-500/25 hover:border-blue-500/50',
    dot:       'bg-blue-500',
  },
  green: {
    gradient:  'from-emerald-600 via-emerald-500 to-teal-600',
    badge:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    progress:  'from-emerald-500 via-teal-500 to-emerald-400',
    glow:      'hover:shadow-emerald-500/25 hover:border-emerald-500/50',
    dot:       'bg-emerald-500',
  },
  amber: {
    gradient:  'from-amber-500 via-amber-500 to-orange-600',
    badge:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    progress:  'from-amber-500 via-orange-500 to-amber-400',
    glow:      'hover:shadow-amber-500/25 hover:border-amber-500/50',
    dot:       'bg-amber-500',
  },
  red: {
    gradient:  'from-red-600 via-rose-500 to-pink-600',
    badge:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    progress:  'from-red-500 via-pink-500 to-red-400',
    glow:      'hover:shadow-red-500/25 hover:border-red-500/50',
    dot:       'bg-red-500',
  },
  purple: {
    gradient:  'from-purple-600 via-violet-500 to-indigo-600',
    badge:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    progress:  'from-purple-500 via-indigo-500 to-purple-400',
    glow:      'hover:shadow-purple-500/25 hover:border-purple-500/50',
    dot:       'bg-purple-500',
  },
  pink: {
    gradient:  'from-pink-600 via-rose-500 to-red-500',
    badge:     'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    progress:  'from-pink-500 via-rose-500 to-pink-400',
    glow:      'hover:shadow-pink-500/25 hover:border-pink-500/50',
    dot:       'bg-pink-500',
  },
  teal: {
    gradient:  'from-teal-600 via-teal-500 to-cyan-600',
    badge:     'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    progress:  'from-teal-500 via-cyan-500 to-teal-400',
    glow:      'hover:shadow-teal-500/25 hover:border-teal-500/50',
    dot:       'bg-teal-500',
  },
  slate: {
    gradient:  'from-slate-700 via-slate-600 to-slate-800',
    badge:     'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    progress:  'from-slate-500 to-slate-400',
    glow:      'hover:shadow-slate-500/25 hover:border-slate-500/50',
    dot:       'bg-slate-500',
  },
}

const DEFAULT_COLOR = COLORS.indigo

/**
 * @param {object}  props
 * @param {string}  props.id            - Firestore document ID
 * @param {string}  props.name          - Subject name
 * @param {string}  [props.description] - Optional description
 * @param {string}  [props.icon]        - Emoji icon (e.g. "📐")
 * @param {string}  [props.color]       - Color key from COLORS map
 * @param {number}  [props.unitCount]   - Total units in subject
 * @param {number}  [props.lectureCount]- Total lectures in subject
 * @param {number}  [props.completed]   - Lectures user completed in this subject
 * @param {number}  [props.index]       - Stagger animation delay index
 */
const SubjectCard = ({
  id,
  name,
  description,
  icon        = '📚',
  color       = 'indigo',
  unitCount   = 0,
  lectureCount = 0,
  completed   = 0,
  index       = 0,
}) => {
  const c       = COLORS[color] || DEFAULT_COLOR
  const progress = calcProgress(completed, lectureCount)
  const isDone   = lectureCount > 0 && completed >= lectureCount

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`
        group relative bg-white dark:bg-card-dark
        rounded-3xl border border-slate-200/80 dark:border-slate-800
        shadow-sm ${c.glow} transition-all duration-300
        overflow-hidden flex flex-col justify-between select-none
      `}
    >
      <div>
        {/* ── Gradient header ── */}
        <div className={`relative bg-gradient-to-br ${c.gradient} p-5 overflow-hidden text-white`}>
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xs" />
          <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-black/10 blur-xs" />

          <div className="relative flex items-start justify-between z-10">
            {/* Icon */}
            <motion.div
              whileHover={{ rotate: 12, scale: 1.15 }}
              className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
            >
              {icon}
            </motion.div>

            {/* Completion badge */}
            {isDone && (
              <div className="flex items-center gap-1 bg-emerald-400 text-slate-950 rounded-full px-3 py-1 shadow-md font-black text-[10px] uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Mastered</span>
              </div>
            )}
          </div>

          <h3 className="mt-3 text-base font-extrabold text-white leading-snug line-clamp-2 drop-shadow-xs">
            {name}
          </h3>

          {/* Stats pills */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/20">
              <Layers className="w-3 h-3" />
              {unitCount} {unitCount === 1 ? 'unit' : 'units'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/20">
              <GraduationCap className="w-3 h-3" />
              {lectureCount} lectures
            </span>
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="p-5 space-y-4">
          {/* Description */}
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Syllabus Progress
              </span>
              <span className="text-primary-600 dark:text-primary-400 font-mono">
                {completed}/{lectureCount} ({progress}%)
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${c.progress} shadow-xs`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div className="p-5 pt-0">
        <Link
          to={`/subjects/${id}`}
          className={`
            flex items-center justify-center gap-2
            w-full py-2.5 rounded-2xl text-xs font-extrabold
            bg-slate-100 dark:bg-slate-800
            hover:bg-gradient-to-r hover:${c.gradient}
            text-slate-700 dark:text-slate-200 hover:text-white
            border border-slate-200 dark:border-slate-700 hover:border-transparent
            transition-all duration-300 shadow-xs hover:shadow-md group/btn
          `}
        >
          {lectureCount === 0 ? (
            <>
              <BookOpen className="w-4 h-4" />
              <span>View Subject</span>
            </>
          ) : completed === 0 ? (
            <>
              <BookOpen className="w-4 h-4" />
              <span>Start Learning</span>
            </>
          ) : isDone ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Material</span>
            </>
          ) : (
            <>
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </Link>
      </div>
    </motion.div>
  )
}

export default SubjectCard
export { COLORS }
