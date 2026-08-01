// src/components/common/LoadingSpinner.jsx
// Full-screen or inline loading spinner with optional label.

import { motion } from 'framer-motion'

const LoadingSpinner = ({
  fullScreen = false,
  size       = 'md',
  label      = 'Loading…',
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`
          ${sizeMap[size]}
          rounded-full
          border-primary-200 border-t-primary-600
          dark:border-primary-800 dark:border-t-primary-400
        `}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {label && (
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          {label}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}

export default LoadingSpinner
