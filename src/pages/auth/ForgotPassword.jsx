// src/pages/auth/ForgotPassword.jsx
// Sends a Firebase password-reset email and shows a success state.

import { useState }   from 'react'
import { Link }       from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, Send, CheckCircle2 } from 'lucide-react'
import toast          from 'react-hot-toast'
import AuthLayout     from '@/layouts/AuthLayout'
import { resetPassword } from '@/firebase/auth'

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset email sent! Check your inbox.')
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : 'Something went wrong. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">

        {/* ── Success state ── */}
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              We sent a password reset link to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
              Click the link in the email to set a new password.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Didn't receive it? Check spam or{' '}
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-primary-600 hover:underline font-medium"
              >
                try again
              </button>
              .
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </motion.div>

        ) : (

          /* ── Form state ── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                Forgot password?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1">
                <label htmlFor="reset-email" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`
                      w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-slate-50 dark:bg-slate-800
                      border transition-colors outline-none
                      text-slate-800 dark:text-slate-100
                      placeholder:text-slate-400
                      focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                      ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}
                    `}
                  />
                </div>
                {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="
                  w-full flex items-center justify-center gap-2
                  py-3 px-6 rounded-xl font-semibold text-sm
                  bg-primary-600 hover:bg-primary-700 text-white
                  transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-md
                "
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Reset Link</>
                }
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}

export default ForgotPassword
