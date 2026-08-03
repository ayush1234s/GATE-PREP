// src/components/auth/LoginPortalAnimation.jsx
// Interactive Framer Motion Animated Character (Student Scholar unlocking study portal)
// Sparks glowing security keys, signal waveforms, and holographic light rays towards the login form.

import { motion } from 'framer-motion'
import { Sparkles, BookOpen, ShieldCheck, Key, Lock, Activity } from 'lucide-react'

const LoginPortalAnimation = ({ onReplay }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white select-none">
      {/* Background Ambient Glow Orbs */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.25, 1, 1.25], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary-500/25 blur-3xl pointer-events-none"
      />

      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 z-10"
      >
        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
          <BookOpen className="w-5 h-5 text-emerald-300" />
        </div>
        <span className="text-2xl font-black tracking-tight text-white">
          GATE<span className="text-emerald-400">-PREP</span>
        </span>
      </motion.div>

      {/* Center Character Scene */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 min-h-[340px]">
        <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center">

          {/* 1. Floating Hologram Items */}
          {/* Floating Key Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 30 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1, 1], y: [-10, -75, -90], x: [10, 45, 55], rotate: [10, 15, 10] }}
            transition={{ duration: 1.3, delay: 0.8, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-1/2 left-1/2 z-30 p-2.5 rounded-2xl bg-emerald-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-emerald-200"
          >
            <Key className="w-4 h-4 text-slate-950" />
            <span>Secure Access</span>
          </motion.div>

          {/* Floating Waveform Chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 30 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1, 1], y: [-10, -85, -105], x: [-10, -50, -60], rotate: [-10, -15, -10] }}
            transition={{ duration: 1.4, delay: 1.0, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-1/2 left-1/2 z-30 p-2.5 rounded-2xl bg-indigo-500 text-white font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-indigo-300"
          >
            <Activity className="w-4 h-4 text-amber-300" />
            <span>ECE Signals</span>
          </motion.div>

          {/* Floating Shield */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 30 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1, 1], y: [-10, -125, -140], x: [0, 10, 15] }}
            transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-1/2 left-1/2 z-30 p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-xs shadow-xl flex items-center gap-1.5 border-2 border-amber-200"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Dashboard Unlocked</span>
          </motion.div>

          {/* Sparkles */}
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8], y: [-20, -90] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/3 right-1/4 z-30 text-emerald-300"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>

          {/* Hologram Light Column */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.8, 0.6], scaleY: [0, 1.2, 1] }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-52 h-52 bg-gradient-to-t from-emerald-400/40 via-primary-500/20 to-transparent blur-xl pointer-events-none rounded-full"
          />

          {/* Main SVG Illustration: Scholar Boy at Study Portal Desk */}
          <motion.svg
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
            viewBox="0 0 240 240"
            className="w-full h-full drop-shadow-2xl relative z-20"
          >
            <defs>
              <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Boy Body in Study Jacket */}
            <path d="M 65 190 Q 120 160 175 190 L 185 240 L 55 240 Z" fill="url(#suitGrad)" />
            {/* Jacket Collar */}
            <path d="M 95 170 Q 120 190 145 170 Q 120 185 95 170 Z" fill="#3b82f6" />

            {/* Head */}
            <circle cx="120" cy="128" r="32" fill="#fed7aa" />
            {/* Hair */}
            <path d="M 88 124 C 88 92 110 86 120 86 C 135 86 152 96 152 124 C 145 108 135 108 120 108 C 105 108 95 113 88 124 Z" fill="#020617" />

            {/* Glasses */}
            <rect x="98" y="122" width="18" height="12" rx="3" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <rect x="124" y="122" width="18" height="12" rx="3" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="116" y1="128" x2="124" y2="128" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Smile */}
            <path d="M 112 144 Q 120 152 128 144" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

            {/* Desk Surface */}
            <rect x="40" y="195" width="160" height="12" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

            {/* Glowing Open Laptop */}
            <path d="M 80 195 L 160 195 L 150 162 L 90 162 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            {/* Screen Content Glow */}
            <rect x="94" y="165" width="52" height="26" rx="3" fill="url(#laptopGrad)" opacity="0.9" />
            {/* Signal Waveform on Screen */}
            <path d="M 98 178 Q 106 168 114 178 T 130 178 T 144 178" fill="none" stroke="#ffffff" strokeWidth="2" />

            {/* Lock to Shield Glow Icon on Screen */}
            <circle cx="120" cy="178" r="4" fill="#f59e0b" />

            {/* Typing Hands */}
            <circle cx="88" cy="192" r="5" fill="#fed7aa" />
            <circle cx="152" cy="192" r="5" fill="#fed7aa" />
          </motion.svg>
        </div>

        {/* Text Caption */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center space-y-2 mt-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Secure Aspirant Login Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, Scholar!
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Enter your credentials on the right to jump right back into your GATE ECE prep journey.
          </p>
        </motion.div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="flex items-center justify-between z-10 pt-4 border-t border-white/10 text-xs text-slate-400"
      >
        <span>© {new Date().getFullYear()} GATE-PREP</span>
        <button
          onClick={onReplay}
          className="hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold underline decoration-dotted"
        >
          Replay Unlock ✨
        </button>
      </motion.div>
    </div>
  )
}

export default LoginPortalAnimation
