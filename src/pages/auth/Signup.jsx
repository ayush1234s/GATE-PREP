// src/pages/auth/Signup.jsx
// Signup page — name, email, password, confirm password + Google OAuth.
// Creates Firebase Auth user + Firestore profile on success.

import { useState }       from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion }         from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react'
import toast              from 'react-hot-toast'
import AuthLayout         from '@/layouts/AuthLayout'
import { signUpWithEmail, signInWithGoogle } from '@/firebase/auth'
import { initializeNewUser } from '@/services/userService'
import { sendWelcomeEmail }   from '@/services/emailService'

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
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/weak-password':        'Password should be at least 6 characters.',
    'auth/operation-not-allowed':'Sign-up is currently disabled. Contact support.',
  }
  return map[code] || 'Sign-up failed. Please try again.'
}

const Signup = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })
  const [showPwd,  setShowPwd]            = useState(false)
  const [showCPwd, setShowCPwd]           = useState(false)
  const [loading,  setLoading]            = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors,   setErrors]             = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim())      errs.name    = 'Full name is required.'
    if (!formData.email)            errs.email   = 'Email is required.'
    if (formData.password.length < 6)
                                    errs.password = 'Password must be at least 6 characters.'
    if (formData.password !== formData.confirmPassword)
                                    errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { user } = await signUpWithEmail(
        formData.name.trim(),
        formData.email,
        formData.password,
      )
      await initializeNewUser(user.uid, formData.name.trim(), formData.email)
      sendWelcomeEmail(user, formData.name.trim())
      toast.success('Account created! Welcome to GATE-PREP 🚀')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Signed in with Google! Welcome to GATE-PREP 🚀')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google Sign-Up failed: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const Field = ({ label, id, name, type, placeholder, icon: Icon, endAdornment }) => (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="w-4 h-4" />
        </span>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full pl-10 ${endAdornment ? 'pr-10' : 'pr-4'} py-3 rounded-xl text-sm
            bg-slate-50 dark:bg-slate-800
            border transition-colors outline-none
            text-slate-800 dark:text-slate-100
            placeholder:text-slate-400
            focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            ${errors[name]
              ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
              : 'border-slate-200 dark:border-slate-700'}
          `}
        />
        {endAdornment}
      </div>
      {errors[name] && <p className="text-xs text-red-500 pl-1">{errors[name]}</p>}
    </div>
  )

  const ToggleBtn = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
          Create your account
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Join thousands preparing for GATE ECE.
        </p>
      </div>

      {/* Google Sign Up Button */}
      <motion.button
        type="button"
        onClick={handleGoogleSignUp}
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
        <span>Sign up with Google</span>
      </motion.button>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-card-dark px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
          or sign up with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Full Name" id="name" name="name" type="text"
          placeholder="John Doe" icon={User} />

        <Field label="Email" id="email" name="email" type="email"
          placeholder="you@example.com" icon={Mail} />

        <Field label="Password" id="password" name="password"
          type={showPwd ? 'text' : 'password'}
          placeholder="At least 6 characters" icon={Lock}
          endAdornment={<ToggleBtn show={showPwd} toggle={() => setShowPwd(p => !p)} />}
        />

        <Field label="Confirm Password" id="confirmPassword" name="confirmPassword"
          type={showCPwd ? 'text' : 'password'}
          placeholder="Re-enter your password" icon={Lock}
          endAdornment={<ToggleBtn show={showCPwd} toggle={() => setShowCPwd(p => !p)} />}
        />

        {/* Password strength hint */}
        {formData.password && (
          <div className="flex items-center gap-1.5">
            {[...Array(4)].map((_, i) => {
              const strength = Math.min(Math.floor(formData.password.length / 3), 4)
              const colors   = ['bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400']
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i < strength ? colors[strength - 1] : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )
            })}
            <span className="text-xs text-slate-400 ml-1">
              {['','Weak','Fair','Good','Strong'][Math.min(Math.floor(formData.password.length / 3), 4)]}
            </span>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading || googleLoading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="
            w-full flex items-center justify-center gap-2
            py-3 px-6 rounded-xl font-semibold text-sm
            bg-primary-600 hover:bg-primary-700 text-white
            transition-colors disabled:opacity-60 disabled:cursor-not-allowed
            shadow-md hover:shadow-primary-500/40
          "
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
            : <><UserPlus className="w-4 h-4" /> Create Account</>
          }
        </motion.button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>🛡️ Administrator Portal Login</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Signup
