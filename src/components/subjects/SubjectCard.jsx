// src/components/subjects/SubjectCard.jsx
// Beautiful subject card — gradient header with icon, stats, progress bar.
// Links to /subjects/:subjectId (Phase 4 builds the unit page).

import { motion }   from 'framer-motion'
import { Link }     from 'react-router-dom'
import {
  BookOpen, ArrowRight, Layers, GraduationCap, CheckCircle2,
} from 'lucide-react'
import { calcProgress } from '@/utils/helpers'

// ─── Color palette (maps Firestore `color` field → Tailwind classes) ──────────
const COLORS = {
  indigo: {
    gradient:  'from-indigo-600 via-indigo-500 to-violet-600',
    badge:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    progress:  'from-indigo-500 to-violet-500',
    glow:      'group-hover:shadow-indigo-500/25',
    dot:       'bg-indigo-500',
  },
  blue: {
    gradient:  'from-blue-600 via-blue-500 to-cyan-600',
    badge:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    progress:  'from-blue-500 to-cyan-500',
    glow:      'group-hover:shadow-blue-500/25',
    dot:       'bg-blue-500',
  },
  green: {
    gradient:  'from-emerald-600 via-emerald-500 to-teal-600',
    badge:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    progress:  'from-emerald-500 to-teal-500',
    glow:      'group-hover:shadow-emerald-500/25',
    dot:       'bg-emerald-500',
  },
  amber: {
    gradient:  'from-amber-500 via-amber-500 to-orange-600',
    badge:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    progress:  'from-amber-500 to-orange-500',
    glow:      'group-hover:shadow-amber-500/25',
    dot:       'bg-amber-500',
  },
  red: {
    gradient:  'from-red-600 via-rose-500 to-pink-600',
    badge:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    progress:  'from-red-500 to-pink-500',
    glow:      'group-hover:shadow-red-500/25',
    dot:       'bg-red-500',
  },
  purple: {
    gradient:  'from-purple-600 via-violet-500 to-indigo-600',
    badge:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    progress:  'from-purple-500 to-indigo-500',
    glow:      'group-hover:shadow-purple-500/25',
    dot:       'bg-purple-500',
  },
  pink: {
    gradient:  'from-pink-600 via-rose-500 to-red-500',
    badge:     'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    progress:  'from-pink-500 to-rose-500',
    glow:      'group-hover:shadow-pink-500/25',
    dot:       'bg-pink-500',
  },
  teal: {
    gradient:  'from-teal-600 via-teal-500 to-cyan-600',
    badge:     'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    progress:  'from-teal-500 to-cyan-500',
    glow:      'group-hover:shadow-teal-500/25',
    dot:       'bg-teal-500',
  },
  slate: {
    gradient:  'from-slate-700 via-slate-600 to-slate-700',
    badge:     'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    progress:  'from-slate-500 to-slate-400',
    glow:      'group-hover:shadow-slate-500/25',
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -5 }}
      className={`
        group relative bg-white dark:bg-card-dark
        rounded-2xl border border-slate-100 dark:border-slate-800
        shadow-sm hover:shadow-xl ${c.glow} transition-all duration-300
        overflow-hidden flex flex-col
      `}
    >
      {/* ── Gradient header ── */}
      <div className={`relative bg-gradient-to-br ${c.gradient} p-5 overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-black/10" />

        <div className="relative flex items-start justify-between">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
            {icon}
          </div>

          {/* Completion badge */}
          {isDone && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white">Done!</span>
            </div>
          )}
        </div>

        <h3 className="mt-3 text-base font-bold text-white leading-snug line-clamp-2">
          {name}
        </h3>

        {/* Stats pills */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
            <Layers className="w-3 h-3" />
            {unitCount} {unitCount === 1 ? 'unit' : 'units'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
            <GraduationCap className="w-3 h-3" />
            {lectureCount} lectures
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Description */}
        {description ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {description}
          </p>
        ) : (
          <div className="flex-1 mb-4" />
        )}

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Progress
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {completed}/{lectureCount}
              <span className="text-slate-400 font-normal ml-1">({progress}%)</span>
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${c.progress}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.07 + 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* CTA button */}
        <Link
          to={`/subjects/${id}`}
          className={`
            mt-4 flex items-center justify-center gap-2
            w-full py-2.5 rounded-xl text-sm font-semibold
            bg-slate-50 dark:bg-slate-800
            hover:bg-gradient-to-r hover:${c.gradient}
            text-slate-700 dark:text-slate-300 hover:text-white
            border border-slate-200 dark:border-slate-700 hover:border-transparent
            transition-all duration-300 group/btn
          `}
        >
          {lectureCount === 0 ? (
            <>
              <BookOpen className="w-4 h-4" />
              View Subject
            </>
          ) : completed === 0 ? (
            <>
              <BookOpen className="w-4 h-4" />
              Start Learning
            </>
          ) : isDone ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Review
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              Continue
            </>
          )}
        </Link>
      </div>
    </motion.div>
  )
}

export default SubjectCard
export { COLORS }
