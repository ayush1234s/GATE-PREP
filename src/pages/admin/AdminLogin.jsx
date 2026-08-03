// src/pages/admin/AdminLogin.jsx
// Dedicated Admin Portal Login page — Ultra-premium glassmorphism, animated security key/vault lock visuals,
// rotating holographic halo, and smooth entrance transitions. Accepts Admin ID ("Admin2026") and Password ("@Admin2026").

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, Loader2, ArrowLeft, Key, Sparkles, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminLogIn } from '@/firebase/auth'

const AdminLogin = () => {
  const navigate = useNavigate()

  const [adminId, setAdminId]   = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!adminId.trim() || !password) {
      toast.error('Please enter Admin ID and Password.')
      return
    }

    setLoading(true)
    const tid = toast.loading('Authenticating Admin Center...')
    try {
      await adminLogIn(adminId, password)
      toast.success('Admin Portal Access Granted! 🛡️', { id: tid })
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      console.error('[Admin Login Error]:', err)
      toast.error('Admin authentication failed. Please check credentials.', { id: tid })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient glowing shapes */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.25, 1, 1.25], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl pointer-events-none"
      />

      {/* Decorative Grid Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="admin-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#admin-grid)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Metallic Sweep Overlay */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent skew-x-12 pointer-events-none rounded-3xl"
        />

        {/* Top Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="relative w-16 h-16 mx-auto">
            {/* Rotating border halo */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500 via-amber-400 to-indigo-500 p-0.5 blur-xs"
            />
            <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-tr from-purple-600 to-primary-600 flex items-center justify-center shadow-xl shadow-purple-600/30">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
              <ShieldAlert className="w-3 h-3 text-purple-400" /> Authorized Admin Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>GATE-PREP Admin</span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter master credentials to unlock system management.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label htmlFor="admin-id" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin ID / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-id"
                type="text"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                placeholder="Enter Admin ID (Admin2026)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-slate-800/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-mono transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-pwd" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-pwd"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Password (@Admin2026)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-slate-800/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-mono transition-all"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 border border-purple-400/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            <span>{loading ? 'Authenticating Center…' : 'Access Admin Portal'}</span>
          </motion.button>
        </form>

        {/* Return to Client Site */}
        <div className="pt-2 border-t border-slate-800/80 text-center relative z-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
