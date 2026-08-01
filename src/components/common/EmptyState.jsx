// src/components/common/EmptyState.jsx
// Reusable empty state component used across pages.

import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'

/**
 * @param {object}            props
 * @param {React.ElementType} props.icon       - Lucide icon
 * @param {string}            props.title
 * @param {string}            props.description
 * @param {string}            [props.actionLabel]  - CTA button text
 * @param {string}            [props.actionTo]     - React Router link target
 * @param {Function}          [props.onAction]     - Button click handler
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
    )}
    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed mb-6">
      {description}
    </p>
    {actionLabel && (actionTo ? (
      <Link to={actionTo} className="btn-primary">
        {actionLabel}
      </Link>
    ) : (
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    ))}
  </motion.div>
)

export default EmptyState
