// src/pages/auth/Login.jsx
// Login page with email/password, Google OAuth, "Remember me" toggle, and forgot-password link.
// Features a dynamic entrance animation: Student scholar unlocks his study portal with glowing keys,
// signal waveforms, and light rays, revealing the login form on the right. Also includes Admin Portal quick link.

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2, Sparkles, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '@/layouts/AuthLayout'
import LoginPortalAnimation from '@/components/auth/LoginPortalAnimation'
import { logInWithEmail, signInWithGoogle, logOut } from '@/firebase/auth'
import { getUserProfile } from '@/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
)

const friendlyError = (code) => {
  const map = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password. Please try again.',
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/too-many-requests':   'Too many attempts. Please try again later.',
    'auth/user-disabled':       'This account has been disabled.',
    'auth/invalid-credential':  'Invalid email or password.',
  }
  return map[code] || 'Login failed. Please check your credentials.'
}

const InputField = ({ id, name, type, value, onChange, placeholder, icon: Icon, error, extra }) => (
  <div className="space-y-1">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon className="w-4 h-4" />
      </span>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-10 py-3 rounded-xl text-sm
          bg-slate-50 dark:bg-slate-800
          border transition-colors outline-none
          text-slate-800 dark:text-slate-100
          placeholder:text-slate-400
          focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
          ${error
            ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
            : 'border-slate-200 dark:border-slate-700'}
        `}
      />
      {extra}
    </div>
    {error && (
      <p className="text-xs text-red-500 pl-1">{error}</p>
    )}
  </div>
)

const Login = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { triggerDisabledModal } = useAuth()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [formData, setFormData]           = useState({ email: '', password: '' })
  const [remember, setRemember]           = useState(true)
  const [showPwd,  setShowPwd]            = useState(false)
  const [loading,  setLoading]            = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors,   setErrors]             = useState({})
  const [replayKey, setReplayKey]         = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.email)    errs.email    = 'Email is required.'
    if (!formData.password) errs.password = 'Password is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const credential = await logInWithEmail(formData.email, formData.password, remember)
      const user = credential.user
      let profile = await getUserProfile(user.uid)

      if (!profile) {
        await createUserProfile(user.uid, {
          name: user.displayName || user.email?.split('@')[0] || 'Student',
          email: user.email,
          photoURL: user.photoURL || null,
        })
        profile = await getUserProfile(user.uid)
      }

      if (profile.disabled) {
        await logOut()
        triggerDisabledModal({
          name: profile.name || user.displayName,
          email: profile.email || user.email,
          studentId: profile.studentId || '—',
        })
        setLoading(false)
        return
      }

      toast.success('Welcome back! 🎉')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const result = await signInWithGoogle()
      const user = result.user
      let profile = await getUserProfile(user.uid)

      if (!profile) {
        await createUserProfile(user.uid, {
          name: user.displayName || user.email?.split('@')[0] || 'Student',
          email: user.email,
          photoURL: user.photoURL || null,
        })
        profile = await getUserProfile(user.uid)
      }

      if (profile.disabled) {
        await logOut()
        triggerDisabledModal({
          name: profile.name || user.displayName,
          email: profile.email || user.email,
          studentId: profile.studentId || '—',
        })
        setGoogleLoading(false)
        return
      }

      toast.success('Signed in with Google! 🎉')
      navigate(from, { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google Sign-In failed: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      leftContent={
        <LoginPortalAnimation
          key={replayKey}
          onReplay={() => setReplayKey(k => k + 1)}
        />
      }
    >
      {/* Synchronized Form Reveal Animation */}
      <motion.div
        key={replayKey}
        initial={{ opacity: 0, scale: 0.94, x: 25 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
      >
        {/* Mobile Header Banner */}
        <div className="lg:hidden mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-400/20 via-primary-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
            🔐
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Unlocking Your Study Portal</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Enter your login credentials to jump right back in.</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
            <span>Welcome back</span>
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Sign in to continue your GATE ECE preparation.
          </p>
        </div>

        {/* Google Sign In Button */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="
            w-full flex items-center justify-center gap-3
            py-3 px-4 rounded-xl font-semibold text-sm
            bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
            border border-slate-200 dark:border-slate-700
            hover:bg-slate-50 dark:hover:bg-slate-750
            transition-all shadow-sm mb-5 disabled:opacity-60
          "
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <GoogleIcon />
          )}
          <span>Continue with Google</span>
        </motion.button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-card-dark px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
            or sign in with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Email Address
            </label>
            <InputField
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <InputField
              id="password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              extra={
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Remember me for 30 days
              </span>
            </label>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || googleLoading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="
              w-full flex items-center justify-center gap-2
              py-3 px-6 rounded-xl font-semibold text-sm
              bg-primary-600 hover:bg-primary-700 text-white
              shadow-lg shadow-primary-600/30 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed mt-2
            "
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Links */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign up now
          </Link>
        </p>

        {/* Admin Portal Entry Badge */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700/60 shadow-xs"
          >
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>Administrator Portal Login →</span>
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}

export default Login
