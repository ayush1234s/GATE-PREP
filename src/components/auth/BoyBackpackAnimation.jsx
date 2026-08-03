// src/components/auth/BoyBackpackAnimation.jsx
// Interactive Framer Motion Animated Character (Boy opening study backpack)
// Sparks books, trophies, and magical light rays out of the backpack revealing the signup form.

import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Trophy, GraduationCap } from 'lucide-react'

const BoyBackpackAnimation = ({ onReplay }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-indigo-950 text-white select-none">
      {/* Background Ambient Glow Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
      />

      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 z-10"
      >
        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
          <BookOpen className="w-5 h-5 text-amber-300" />
        </div>
        <span className="text-2xl font-black tracking-tight text-white">
          GATE<span className="text-primary-400">-PREP</span>
        </span>
      </motion.div>

      {/* Center Character Scene */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 min-h-[340px]">
        {/* Animated Boy + Backpack SVG */}
        <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center">

          {/* 1. Floating Magical Icons coming out of the backpack */}
          {/* Floating Book 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 40, x: 0 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1, 1], y: [-10, -70, -85], x: [-10, -40, -50], rotate: [-10, -15, -10] }}
            transition={{ duration: 1.2, delay: 1.0, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-1/2 left-1/2 z-30 p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-amber-200"
          >
            <BookOpen className="w-4 h-4 text-slate-950" />
            <span>GATE ECE</span>
          </motion.div>

          {/* Floating Trophy 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 40, x: 0 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1, 1], y: [-10, -90, -110], x: [10, 50, 65], rotate: [10, 20, 15] }}
            transition={{ duration: 1.3, delay: 1.2, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-1/2 left-1/2 z-30 p-2.5 rounded-2xl bg-emerald-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-emerald-200"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>AIR 1 Goal</span>
          </motion.div>

          {/* Floating Grad Cap 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 40, x: 0 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1, 1], y: [-10, -130, -145], x: [0, 10, 15], rotate: [0, -5, 5] }}
            transition={{ duration: 1.4, delay: 1.4, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-1/2 left-1/2 z-30 p-2 rounded-2xl bg-purple-500 text-white font-bold text-xs shadow-xl flex items-center gap-1 border border-purple-300"
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>IIT Admission</span>
          </motion.div>

          {/* Floating Sparkle Particles */}
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8], y: [-20, -100] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/3 left-1/4 z-30 text-amber-300"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>

          {/* Glowing Light Ray from Backpack */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.8, 0.5], scaleY: [0, 1.2, 1] }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-t from-amber-400/40 via-primary-400/20 to-transparent blur-xl pointer-events-none rounded-full"
          />

          {/* Main SVG Illustration: Student Boy with Backpack */}
          <motion.svg
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
            viewBox="0 0 240 240"
            className="w-full h-full drop-shadow-2xl relative z-20"
          >
            <defs>
              <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#3730a3" />
              </linearGradient>
              <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Boy Body & Hoodie */}
            <path d="M 70 190 Q 120 160 170 190 L 180 240 L 60 240 Z" fill="url(#hoodieGrad)" />
            {/* Hoodie Collar */}
            <path d="M 95 170 Q 120 190 145 170 Q 120 180 95 170 Z" fill="#6366f1" />

            {/* Boy Head */}
            <circle cx="120" cy="130" r="32" fill="#fed7aa" />
            {/* Hair */}
            <path d="M 88 126 C 88 95 110 90 120 90 C 135 90 152 100 152 126 C 145 110 135 110 120 110 C 105 110 95 115 88 126 Z" fill="#1e1b4b" />

            {/* Eyes & Smile */}
            <circle cx="108" cy="130" r="3.5" fill="#0f172a" />
            <circle cx="132" cy="130" r="3.5" fill="#0f172a" />
            {/* Wink Sparkle in Eye */}
            <circle cx="110" cy="128" r="1.2" fill="#ffffff" />
            <circle cx="134" cy="128" r="1.2" fill="#ffffff" />
            {/* Happy Smile */}
            <path d="M 110 142 Q 120 150 130 142" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

            {/* Headphones */}
            <path d="M 86 128 Q 120 80 154 128" fill="none" stroke="#ec4899" strokeWidth="5" strokeLinecap="round" />
            <rect x="82" y="120" width="8" height="16" rx="4" fill="#f43f5e" />
            <rect x="150" y="120" width="8" height="16" rx="4" fill="#f43f5e" />

            {/* Open Backpack in front */}
            <g>
              {/* Bag Base */}
              <rect x="90" y="165" width="60" height="55" rx="14" fill="url(#bagGrad)" stroke="#b45309" strokeWidth="2" />
              {/* Bag Pocket */}
              <rect x="100" y="185" width="40" height="28" rx="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <circle cx="120" cy="199" r="4" fill="#78350f" />

              {/* Animated Opening Flap of Backpack */}
              <motion.path
                initial={{ d: "M 90 165 Q 120 165 150 165 Q 120 185 90 165 Z" }}
                animate={{ d: [
                  "M 90 165 Q 120 165 150 165 Q 120 185 90 165 Z",
                  "M 90 165 Q 120 135 150 165 Q 120 145 90 165 Z"
                ]}}
                transition={{ duration: 0.8, delay: 0.7 }}
                fill="#f59e0b" stroke="#78350f" strokeWidth="2"
              />
            </g>

            {/* Boy's Left & Right Arms Opening the Bag */}
            <motion.path
              initial={{ rotate: 0 }}
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              d="M 72 180 Q 90 190 100 178" fill="none" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round"
            />
            <motion.path
              initial={{ rotate: 0 }}
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
              d="M 168 180 Q 150 190 140 178" fill="none" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round"
            />
          </motion.svg>
        </div>

        {/* Text Caption under animation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center space-y-2 mt-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Unpacking Your GATE Success Package
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to Ace GATE ECE?
          </h2>
          <p className="text-primary-200 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Fill out your details on the right to open your student account and start tracking your preparation today!
          </p>
        </motion.div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="flex items-center justify-between z-10 pt-4 border-t border-white/10 text-xs text-primary-300"
      >
        <span>© {new Date().getFullYear()} GATE-PREP</span>
        <button
          onClick={onReplay}
          className="hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold underline decoration-dotted"
        >
          Replay Unpacking ✨
        </button>
      </motion.div>
    </div>
  )
}

export default BoyBackpackAnimation
