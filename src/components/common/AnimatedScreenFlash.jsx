// src/components/common/AnimatedScreenFlash.jsx
// Ultra-smooth, responsive animated screen flash & physics bouncing splash intro.
// Features screen flash beam bloom, cubic-bezier spring physics logo, ground shockwaves,
// glowing gradient backdrop, and ultra-fluid progress bar. Hardware accelerated.

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Sparkles, CheckCircle2, Zap } from 'lucide-react'
import { useScreenFlash } from '@/contexts/ScreenFlashContext'

const STATUS_STEPS = [
  'Initializing Core Engine…',
  'Loading Curriculum & Analytics…',
  'Optimizing GATE Workspaces…',
  'System Ready! Welcome to GATE-PREP',
]

export const AnimatedScreenFlash = () => {
  const { isFlashActive, closeFlashScreen } = useScreenFlash()
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  const triggerClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      closeFlashScreen()
      setIsClosing(false)
    }, 450)
  }, [closeFlashScreen])

  useEffect(() => {
    if (!isFlashActive) {
      setStepIndex(0)
      setProgress(0)
      setIsClosing(false)
      return
    }

    // Step text ticker
    const stepInterval = setInterval(() => {
      setStepIndex(prev => (prev < STATUS_STEPS.length - 1 ? prev + 1 : prev))
    }, 550)

    // Smooth progress bar fill animation (60fps requestAnimationFrame effect feel)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 5
      })
    }, 50)

    // Auto dismiss timer (2.5s duration)
    const timer = setTimeout(() => {
      triggerClose()
    }, 2500)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [isFlashActive, triggerClose])

  return (
    <AnimatePresence>
      {isFlashActive && (
        <motion.div
          key="screen-flash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none backdrop-blur-3xl will-change-transform"
        >
          {/* ── Ambient Background Mesh Glow ── */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.3),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.3),rgba(0,0,0,0))]" />

          {/* Floating particle ambient lights */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/5 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />

          {/* ── Ultra-Smooth Screen Flash Lens Bloom Effect ── */}
          <motion.div
            initial={{ scale: 0, opacity: 0.95 }}
            animate={{
              scale: isClosing ? [1, 30] : [0, 9, 0],
              opacity: isClosing ? [0.5, 1] : [0.95, 0.35, 0],
            }}
            transition={{
              duration: isClosing ? 0.45 : 0.85,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute w-36 h-36 rounded-full bg-gradient-to-r from-cyan-300 via-white to-primary-400 blur-2xl shadow-[0_0_120px_rgba(255,255,255,1)] will-change-transform"
          />

          {/* ── Secondary Bright Center Lens Beam ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.4, 2.8, 3.5] }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 m-auto w-[450px] h-[450px] bg-gradient-radial from-primary-400/35 via-purple-500/15 to-transparent rounded-full blur-3xl"
          />

          {/* ── Central Main Card Container ── */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-sm sm:max-w-md w-full">

            {/* Ground shockwave impact ripples anchor */}
            <div className="relative flex items-center justify-center mb-6 sm:mb-8">

              {/* Floor shockwave expanding ripple rings */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{
                  scale: [0.3, 1.7, 2.3],
                  opacity: [0, 0.75, 0],
                }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute w-36 h-36 rounded-full border-2 border-primary-400/70 shadow-[0_0_40px_rgba(99,102,241,0.6)]"
              />

              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{
                  scale: [0.2, 1.4, 1.9],
                  opacity: [0, 0.55, 0],
                }}
                transition={{
                  duration: 1.3,
                  delay: 0.2,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute w-36 h-36 rounded-full border border-purple-400/60"
              />

              {/* 360-degree rotating glowing ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-primary-500 via-purple-500 to-pink-500 opacity-35 blur-lg"
              />

              {/* ── Bouncing Physics Logo Container with Ultra-Fluid Squash & Stretch ── */}
              <motion.div
                initial={{ y: -200, scaleX: 0.75, scaleY: 1.3, opacity: 0 }}
                animate={{
                  y: [-200, 0, -65, 0, -24, 0, -8, 0],
                  scaleX: [0.75, 1.35, 0.82, 1.18, 0.9, 1.06, 0.96, 1],
                  scaleY: [1.3, 0.65, 1.2, 0.82, 1.1, 0.94, 1.04, 1],
                  opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                }}
                transition={{
                  duration: 1.45,
                  times: [0, 0.3, 0.48, 0.64, 0.78, 0.88, 0.95, 1],
                  ease: 'easeOut',
                }}
                className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-white/25 shadow-[0_20px_60px_rgba(79,70,229,0.5)] flex items-center justify-center p-0.5 group will-change-transform"
              >
                {/* Glass reflections */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/25 via-transparent to-transparent pointer-events-none" />

                {/* Inner Icon */}
                <div className="relative w-full h-full rounded-[22px] bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-inner overflow-hidden">
                  {/* Subtle inner grid lines */}
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

                  <GraduationCap className="w-11 h-11 sm:w-14 sm:h-14 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" />

                  <motion.div
                    animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-2 right-2"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300 drop-shadow" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* ── Shimmer Brand Title ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5 mb-6"
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-primary-300 drop-shadow-md">
                GATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-300 to-pink-400">PREP</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
                Master Your Exam with Precision &amp; Speed
              </p>
            </motion.div>

            {/* ── Status Ticker & Progress Bar ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-3 bg-white/5 border border-white/15 backdrop-blur-2xl p-4 rounded-2xl shadow-2xl"
            >
              {/* Ticker step description */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 truncate">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-primary-400 inline-block shrink-0 shadow-[0_0_8px_rgba(99,102,241,1)]"
                  />
                  {STATUS_STEPS[stepIndex]}
                </span>
                <span className="text-primary-300 font-mono text-[11px] font-bold shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden border border-white/10 relative p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 via-cyan-400 to-purple-500 shadow-[0_0_16px_rgba(99,102,241,0.9)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Subtle feature badges */}
              <div className="pt-1 flex items-center justify-center gap-3 text-[10px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 10 Core ECE Subjects
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Analytics
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedScreenFlash
