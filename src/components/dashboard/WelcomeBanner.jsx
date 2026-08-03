// src/components/dashboard/WelcomeBanner.jsx
// Ultra-impressive greeting banner with dynamic time-based greeting, user name,
// motivational quote, daily target progress, and quick CTA actions.

import { useMemo, useState } from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { Zap, Target, Sparkles, RefreshCw, ArrowRight, Award, ShieldCheck } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { Link } from 'react-router-dom'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning',   emoji: '☀️', sub: 'Ready to conquer today’s GATE targets?' }
  if (hour < 17) return { text: 'Good Afternoon',  emoji: '⚡', sub: 'Keep the momentum going strong!' }
  if (hour < 21) return { text: 'Good Evening',    emoji: '🌆', sub: 'Great time for a focused study session.' }
  return             { text: 'Night Owl Mode',     emoji: '🦉', sub: 'Quiet night hours build top ranks!' }
}

const MOTIVATIONAL_QUOTES = [
  'Every lecture completed brings you closer to AIR 1 in GATE ECE.',
  'Small daily progress accumulates into extraordinary exam results.',
  'Consistency beats intensity. Master one concept at a time.',
  'Your future AIR rank will thank you for studying today.',
  'Focus on conceptual clarity and problem-solving speed.',
  'Turn your weak topics into your strongest scoring areas.',
]

const WelcomeBanner = ({ name, completedCount = 0, progress = 0 }) => {
  const { text: greetText, emoji } = useMemo(() => getGreeting(), [])
  const [quoteIndex, setQuoteIndex] = useState(0)

  const quote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length]
  const today = useMemo(() => formatDate(new Date()), [])
  const scholarLevel = Math.max(1, Math.floor(completedCount / 5) + 1)

  const nextQuote = () => setQuoteIndex(prev => prev + 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-900/50"
    >
      {/* Background ambient glowing shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"
        />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl" />

        {/* Decorative Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="banner-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#banner-grid)" />
        </svg>
      </div>

      <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left — Greeting & Motivation */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center gap-1.5 text-slate-100">
              <span>{emoji}</span> {greetText}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 backdrop-blur text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Level {scholarLevel} Scholar
            </span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              {today}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Welcome back, <span className="text-amber-300">{name}!</span> 👋
          </h1>

          {/* Quote Box with Refresh Button & AnimatePresence */}
          <div className="flex items-start gap-2.5 max-w-xl bg-slate-900/80 backdrop-blur border border-slate-700/60 p-3.5 rounded-2xl shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-xs sm:text-sm text-slate-200 italic flex-1 leading-relaxed"
              >
                "{quote}"
              </motion.p>
            </AnimatePresence>
            <button
              onClick={nextQuote}
              className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"
              title="Next motivational tip"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-lg shadow-primary-600/30 transition-all hover:scale-105"
            >
              <span>Continue Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur border border-white/20 transition-all"
            >
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span>Track Progress</span>
            </Link>
          </div>
        </div>

        {/* Right — Animated Vector Character Graphic */}
        <div className="relative flex-shrink-0 hidden lg:flex items-center justify-center w-56 h-48">
          {/* Floating Chip Badges */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur border border-amber-400/50 text-amber-300 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 z-20"
          >
            <Award className="w-3 h-3 text-amber-400" /> AIR 1 Target
          </motion.div>

          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur border border-emerald-400/50 text-emerald-300 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 z-20"
          >
            <Zap className="w-3 h-3 text-emerald-400" /> {progress}% Mastered
          </motion.div>

          {/* SVG Character */}
          <motion.svg
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-2xl"
          >
            <circle cx="100" cy="100" r="70" fill="#312e81" opacity="0.4" />
            <path d="M 50 160 Q 100 135 150 160 L 160 200 L 40 200 Z" fill="#4f46e5" />
            <circle cx="100" cy="105" r="28" fill="#fed7aa" />
            <path d="M 72 100 C 72 75 90 70 100 70 C 112 70 128 78 128 100 C 120 88 112 88 100 88 C 88 88 80 92 72 100 Z" fill="#0f172a" />
            <circle cx="90" cy="106" r="3" fill="#0f172a" />
            <circle cx="110" cy="106" r="3" fill="#0f172a" />
            <path d="M 93 116 Q 100 122 107 116" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            {/* Laptop */}
            <rect x="65" y="152" width="70" height="8" rx="2" fill="#1e293b" />
            <path d="M 75 152 L 125 152 L 120 125 L 80 125 Z" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
            <rect x="84" y="128" width="32" height="18" rx="2" fill="#38bdf8" opacity="0.8" />
          </motion.svg>
        </div>

      </div>
    </motion.div>
  )
}

export default WelcomeBanner
