// src/pages/admin/AdminLogin.jsx
// Dedicated Admin Portal Login page. Accepts Admin ID ("Admin2026") and Password ("@Admin2026").

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, LogIn, Loader2, ArrowLeft, Key } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-primary-600/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-primary-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            GATE-PREP Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Authorized Administrator Access Only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin ID / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                placeholder="Enter Admin ID (Admin2026)"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Password (@Admin2026)"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-500 hover:to-primary-500 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Authenticating…' : 'Access Admin Panel'}</span>
          </button>
        </form>

        {/* Return to Client Site */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
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
