// src/layouts/AuthLayout.jsx
// Centered card layout for Login, Signup, and ForgotPassword pages.
// Features a split design: animated left panel (or custom illustration) + right form panel.

import { motion } from 'framer-motion'
import { BookOpen, Zap, Target, TrendingUp } from 'lucide-react'

const defaultFeatures = [
  { icon: BookOpen,   text: 'Dynamic GATE ECE Syllabus'   },
  { icon: Zap,        text: 'YouTube Lectures Embedded'    },
  { icon: Target,     text: 'Track Your Progress Daily'    },
  { icon: TrendingUp, text: 'Smart Dashboard Analytics'   },
]

const AuthLayout = ({ children, leftContent }) => {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-purple-700">
        {leftContent ? (
          leftContent
        ) : (
          <>
            {/* Background blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary-500/20 blur-2xl" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between p-12 w-full">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y:  0  }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  GATE<span className="text-primary-300">-PREP</span>
                </span>
              </motion.div>

              {/* Hero text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x:  0  }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
                  Ace GATE ECE<br />
                  <span className="text-primary-300">One Lecture at a Time</span>
                </h1>
                <p className="text-primary-200 text-lg leading-relaxed mb-10">
                  A smart study platform that tracks your progress,
                  serves embedded YouTube lectures, and keeps your
                  entire syllabus organized — all in one place.
                </p>

                {/* Feature list */}
                <div className="space-y-4">
                  {defaultFeatures.map(({ icon: Icon, text }, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x:  0  }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-primary-100 text-sm font-medium">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-primary-400 text-xs"
              >
                © {new Date().getFullYear()} GATE-PREP. Built for GATE ECE aspirants.
              </motion.p>
            </div>
          </>
        )}
      </div>

      {/* ── Right Panel (form area) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 dark:bg-surface-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y:  0  }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              GATE<span className="text-primary-600">-PREP</span>
            </span>
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-card p-8 border border-slate-100 dark:border-slate-800">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout
