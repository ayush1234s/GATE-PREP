// src/components/dashboard/WelcomeBanner.jsx
// Ultra-impressive greeting banner with dynamic time-based greeting, user name,
// motivational quote, daily target progress, and quick CTA actions.

import { useMemo, useState } from 'react'
import { motion }  from 'framer-motion'
import { Zap, Target, BookOpen, Sparkles, RefreshCw, ArrowRight, Flame } from 'lucide-react'
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

const WelcomeBanner = ({ name, completedCount = 0, totalCount = 0, progress = 0 }) => {
  const { text: greetText, emoji, sub: greetSub } = useMemo(() => getGreeting(), [])
  const [quoteIndex, setQuoteIndex] = useState(0)

  const quote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length]
  const today = useMemo(() => formatDate(new Date()), [])

  const nextQuote = () => setQuoteIndex(prev => prev + 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0   }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-purple-800 text-white shadow-2xl"
    >
      {/* Background ambient glowing shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl" />

        {/* Decorative Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="banner-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#banner-grid)" />
        </svg>
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Left — Greeting & Motivation */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center gap-1.5 text-xs font-bold">
                <span>{emoji}</span> {greetText}
              </span>
              <span className="text-xs text-primary-200 font-medium">
                {today}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="text-amber-300">{name}!</span> 👋
            </h1>

            {/* Quote Box with Refresh Button */}
            <div className="flex items-start gap-2 max-w-xl bg-white/10 backdrop-blur border border-white/15 p-3.5 rounded-2xl">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-primary-100 italic flex-1 leading-relaxed">
                "{quote}"
              </p>
              <button
                onClick={nextQuote}
                className="p-1 text-white/70 hover:text-white transition-colors"
                title="Next motivational tip"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/subjects"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-700 hover:bg-amber-300 hover:text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                <span>Continue Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-xs text-primary-200 font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {progress}% Syllabus Mastered
              </span>
            </div>
          </div>

          {/* Right — Quick Progress Badges */}
          <div className="flex flex-row md:flex-col gap-3 flex-shrink-0">
            <div className="flex-1 md:flex-initial bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-4 text-center md:text-right min-w-[150px]">
              <p className="text-[10px] font-extrabold text-primary-200 uppercase tracking-widest">Completed</p>
              <p className="text-3xl font-black text-white leading-none mt-1">{completedCount}</p>
              <p className="text-[11px] text-primary-200 mt-1">out of {totalCount} lectures</p>
            </div>

            <div className="flex-1 md:flex-initial bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-4 text-center md:text-right min-w-[150px]">
              <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">Mastery Rate</p>
              <p className="text-3xl font-black text-white leading-none mt-1">{progress}%</p>
              <div className="w-full h-1.5 rounded-full bg-white/20 mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-300 to-emerald-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}

export default WelcomeBanner
