// src/components/dashboard/ContinueStudying.jsx
// "Continue Studying" section — displays the next uncompleted lectures in the syllabus
// with instant "Resume Lecture" direct links.

import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { PlayCircle, ArrowRight, Sparkles } from 'lucide-react'

// ─── Single Lecture Card ──────────────────────────────────────────────────────
export const LectureCard = ({ subjectId, subjectName, subjectIcon, unitId, unitName, title, order }) => {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/subjects/${subjectId}/units/${unitId}`)}
      className="group relative bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      {/* Top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Subject & Unit Badge */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm flex-shrink-0">
            {subjectIcon || '📚'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
              {subjectName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {unitName}
            </p>
          </div>
        </div>

        {/* Lecture Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
      </div>

      {/* Bottom CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Lecture {order || 1}
        </span>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-600 text-white shadow-sm group-hover:bg-primary-700 transition-all">
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Resume Lecture</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const ContinueStudying = ({ lectures = [] }) => {
  const isAllCompleted = lectures.length === 0

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary-600" />
            <span>Continue Studying</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pick up right where you left off in your GATE ECE prep
          </p>
        </div>

        <Link
          to="/subjects"
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
        >
          <span>All Subjects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid Content */}
      {!isAllCompleted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lectures.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <LectureCard {...l} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center font-black text-xl shadow-lg">
            🎉
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">All Syllabus Lectures Completed!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300 max-w-md mx-auto">
            Amazing dedication! You have finished all available lectures. Keep revising PYQs and mock tests for GATE ECE.
          </p>
        </div>
      )}
    </div>
  )
}

export default ContinueStudying
