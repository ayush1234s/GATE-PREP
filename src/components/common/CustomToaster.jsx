// src/components/common/CustomToaster.jsx
// Premium toast system — replaces react-hot-toast's default <Toaster>.
// Every toast has: themed icon, close (✕) button, and a draining progress bar.
// Pauses on hover. Works in both admin (dark-only) and client (light/dark) contexts.

import { useToaster, resolveValue, toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, XCircle, AlertCircle, Loader2, Info } from 'lucide-react'

// ─── Per-type theme config ────────────────────────────────────────────────────
const THEMES = {
  success: {
    Icon:    CheckCircle2,
    iconCls: 'text-emerald-400',
    iconBg:  'bg-emerald-500/15 border-emerald-500/30',
    bar:     'bg-emerald-400',
    border:  'border-emerald-800/30',
  },
  error: {
    Icon:    XCircle,
    iconCls: 'text-red-400',
    iconBg:  'bg-red-500/15 border-red-500/30',
    bar:     'bg-red-400',
    border:  'border-red-800/30',
  },
  loading: {
    Icon:    Loader2,
    iconCls: 'text-indigo-400 animate-spin',
    iconBg:  'bg-indigo-500/15 border-indigo-500/30',
    bar:     'bg-indigo-400',
    border:  'border-indigo-800/30',
  },
  blank: {
    Icon:    Info,
    iconCls: 'text-amber-400',
    iconBg:  'bg-amber-500/15 border-amber-500/30',
    bar:     'bg-amber-400',
    border:  'border-amber-800/30',
  },
}

// ─── Single Toast Card ────────────────────────────────────────────────────────
const ToastCard = ({ t, offset, onDismiss }) => {
  const theme    = THEMES[t.type] ?? THEMES.blank
  const { Icon } = theme
  const duration = t.duration ?? 4000
  const showBar  = t.type !== 'loading' && duration !== Infinity

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={
        t.visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: -16, scale: 0.94 }
      }
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        transform: `translateY(${offset}px)`,
        transition: 'transform 220ms ease',
        pointerEvents: 'all',
        zIndex: t.visible ? 1 : 0,
      }}
    >
      <div
        className={`
          relative overflow-hidden flex items-start gap-3
          px-4 py-3.5 rounded-2xl
          bg-slate-900 border ${theme.border}
          shadow-2xl shadow-black/40
          min-w-[300px] max-w-[400px] w-[360px]
        `}
      >
        {/* ── Icon ── */}
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${theme.iconBg}`}>
          <Icon className={`w-4 h-4 ${theme.iconCls}`} />
        </div>

        {/* ── Message ── */}
        <div className="flex-1 min-w-0 pt-0.5 pr-1">
          <p className="text-sm font-semibold text-white leading-snug break-words">
            {resolveValue(t.message, t)}
          </p>
        </div>

        {/* ── Close button ── */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-700/70 transition-colors mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* ── Progress bar ── */}
        {showBar && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-800/80 overflow-hidden rounded-b-2xl">
            <div
              className={`h-full ${theme.bar} opacity-80 origin-left`}
              style={{
                animation: `toast-shrink ${duration}ms linear forwards`,
                animationPlayState: t.paused ? 'paused' : 'running',
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Custom Toaster (replaces <Toaster />) ────────────────────────────────────
const CustomToaster = () => {
  const { toasts, handlers } = useToaster()
  const { startPause, endPause, calculateOffset, updateHeight } = handlers

  return (
    // Full-screen invisible overlay — captures pause/resume events
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {/* Toast container — top-right */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '360px',
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const offset = calculateOffset(t, {
              reverseOrder: false,
              gutter: 10,
            })

            const ref = (el) => {
              if (el && t.height !== el.getBoundingClientRect().height) {
                updateHeight(t.id, el.getBoundingClientRect().height)
              }
            }

            return (
              <div key={t.id} ref={ref} style={{ position: 'absolute', width: '100%' }}>
                <ToastCard
                  t={t}
                  offset={offset}
                  onDismiss={() => toast.dismiss(t.id)}
                />
              </div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CustomToaster
