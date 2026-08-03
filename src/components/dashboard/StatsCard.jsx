// src/components/dashboard/StatsCard.jsx
// Individual stat card with icon, value, label, trend indicator, and micro-hover animations.

import { motion } from 'framer-motion'

const colorMap = {
  indigo: {
    bg:     'bg-indigo-50 dark:bg-indigo-900/20',
    icon:   'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    value:  'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-400/50',
  },
  green: {
    bg:     'bg-emerald-50 dark:bg-emerald-900/20',
    icon:   'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    value:  'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-400/50',
  },
  amber: {
    bg:     'bg-amber-50 dark:bg-amber-900/20',
    icon:   'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    value:  'text-amber-700 dark:text-amber-300',
    border: 'border-amber-100 dark:border-amber-800/50 hover:border-amber-400/50',
  },
  purple: {
    bg:     'bg-purple-50 dark:bg-purple-900/20',
    icon:   'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    value:  'text-purple-700 dark:text-purple-300',
    border: 'border-purple-100 dark:border-purple-800/50 hover:border-purple-400/50',
  },
  blue: {
    bg:     'bg-blue-50 dark:bg-blue-900/20',
    icon:   'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    value:  'text-blue-700 dark:text-blue-300',
    border: 'border-blue-100 dark:border-blue-800/50 hover:border-blue-400/50',
  },
  rose: {
    bg:     'bg-rose-50 dark:bg-rose-900/20',
    icon:   'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    value:  'text-rose-700 dark:text-rose-300',
    border: 'border-rose-100 dark:border-rose-800/50 hover:border-rose-400/50',
  },
}

/**
 * @param {object}           props
 * @param {React.ElementType} props.icon    - Lucide icon component
 * @param {string|number}     props.value   - Main stat value
 * @param {string}            props.label   - Stat label
 * @param {string}            props.color   - One of colorMap keys
 * @param {string}            [props.sub]   - Optional subtitle / context
 * @param {number}            [props.index] - Stagger delay index
 */
const StatsCard = ({ icon: Icon, value, label, color = 'indigo', sub, index = 0 }) => {
  const c = colorMap[color] || colorMap.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-2xl border p-5
        bg-white dark:bg-card-dark
        ${c.border}
        shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default
      `}
    >
      {/* Background gradient blob */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30 blur-2xl ${c.bg} group-hover:scale-125 transition-transform duration-500`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-extrabold leading-none ${c.value}`}>
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate">
              {sub}
            </p>
          )}
        </div>

        {/* Icon badge */}
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 shadow-sm ${c.icon}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default StatsCard
