// src/components/common/SkeletonLoader.jsx
// Shimmer skeleton placeholders for async loading states.

import { motion } from 'framer-motion'

// Base shimmer div
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
)

// ── Stats card skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-8 w-16" />
        <Shimmer className="h-3 w-28" />
      </div>
      <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
    </div>
  </div>
)

// ── Subject card skeleton
export const SubjectCardSkeleton = () => (
  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
    <div className="flex items-center gap-4 mb-4">
      <Shimmer className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
    </div>
    <Shimmer className="h-2 w-full rounded-full" />
  </div>
)

// ── Lecture card skeleton
export const LectureCardSkeleton = () => (
  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
    <Shimmer className="aspect-video w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-3/4" />
    </div>
  </div>
)

// ── Welcome banner skeleton
export const WelcomeSkeleton = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 p-6 md:p-8 animate-pulse">
    <div className="space-y-3">
      <Shimmer className="h-3 w-40 bg-slate-300 dark:bg-slate-600" />
      <Shimmer className="h-8 w-64 bg-slate-300 dark:bg-slate-600" />
      <Shimmer className="h-4 w-80 bg-slate-300 dark:bg-slate-600" />
    </div>
  </div>
)

// ── Generic skeleton grid (for subjects/lectures pages)
const SkeletonLoader = ({ type = 'card', count = 4 }) => {
  const templates = {
    stats:   StatsCardSkeleton,
    subject: SubjectCardSkeleton,
    lecture: LectureCardSkeleton,
  }
  const Component = templates[type] || StatsCardSkeleton

  return (
    <div className={`grid gap-4 ${
      type === 'stats'
        ? 'grid-cols-2 lg:grid-cols-4'
        : type === 'subject'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Component />
        </motion.div>
      ))}
    </div>
  )
}

export default SkeletonLoader
