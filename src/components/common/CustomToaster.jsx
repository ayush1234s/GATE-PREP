// src/components/common/CustomToaster.jsx
// Premium toast system — replaces react-hot-toast's default <Toaster>.
// Every toast has: themed icon, close (✕) button with hover bounce, and a draining progress bar.
// Pauses on hover. Works in both admin (dark-only) and client (light/dark) contexts.

import { useToaster, resolveValue, toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react'

// ─── Per-type theme config ────────────────────────────────────────────────────
const THEMES = {
  success: {
    Icon:    CheckCircle2,
    iconCls: 'text-emerald-400',
    iconBg:  'bg-emerald-500/15 border-emerald-500/30',
    bar:     'bg-emerald-400',
    border:  'border-emerald-800/40',
  },
  error: {
    Icon:    XCircle,
    iconCls: 'text-red-400',
    iconBg:  'bg-red-500/15 border-red-500/30',
    bar:     'bg-red-400',
    border:  'border-red-800/40',
  },
  loading: {
    Icon:    Loader2,
    iconCls: 'text-indigo-400 animate-spin',
    iconBg:  'bg-indigo-500/15 border-indigo-500/30',
    bar:     'bg-indigo-400',
    border:  'border-indigo-800/40',
  },
  blank: {
    Icon:    Info,
    iconCls: 'text-amber-400',
    iconBg:  'bg-amber-500/15 border-amber-500/30',
    bar:     'bg-amber-400',
    border:  'border-amber-800/40',
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
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={
        t.visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: -20, scale: 0.92 }
      }
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        transform: `translateY(${offset}px)`,
        transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'all',
        zIndex: t.visible ? 1 : 0,
      }}
    >
      <div
        className={`
          relative overflow-hidden flex items-start gap-3
          px-4 py-3.5 rounded-2xl
          bg-slate-950/95 border ${theme.border}
          shadow-2xl shadow-black/60 backdrop-blur-xl
          w-[calc(100vw-32px)] sm:w-[360px] max-w-[400px]
          select-none
        `}
      >
        {/* ── Icon ── */}
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${theme.iconBg}`}>
          <Icon className={`w-4 h-4 ${theme.iconCls}`} />
        </div>

        {/* ── Message ── */}
        <div className="flex-1 min-w-0 pt-0.5 pr-1">
          <p className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
            {resolveValue(t.message, t)}
          </p>
        </div>

        {/* ── Interactive Close button ── */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          aria-label="Close notification"
          title="Close notification"
          className="flex-shrink-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer mt-0.5 border border-white/10"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.button>

        {/* ── Progress bar ── */}
        {showBar && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-800/80 overflow-hidden rounded-b-2xl">
            <div
              className={`h-full ${theme.bar} opacity-90 origin-left`}
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
