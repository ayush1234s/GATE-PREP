// src/components/common/AccountRecoveryModal.jsx
// Modal / Banner presented to users whose account is scheduled for deletion within the 7-day grace period.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RotateCcw, LogOut, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { cancelAccountDeletion } from '@/firebase/firestore'

export default function AccountRecoveryModal() {
  const { uid, userProfile, refreshProfile, logout } = useAuth()
  const [recovering, setRecovering]                  = useState(false)

  if (!userProfile?.deletionPending) return null

  const now = Date.now()
  const dueDate = userProfile.deletionDueDate || (now + 7 * 24 * 60 * 60 * 1000)
  const remainingMs = Math.max(0, dueDate - now)
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

  const handleRecover = async () => {
    setRecovering(true)
    const tid = toast.loading('Recovering your account...')
    try {
      await cancelAccountDeletion(uid)
      if (refreshProfile) await refreshProfile()
      toast.success('Account recovered successfully! Welcome back 🎉', { id: tid })
    } catch (err) {
      toast.error('Failed to recover account: ' + err.message, { id: tid })
    } finally {
      setRecovering(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={  { opacity: 0, scale: 0.9, y: 10 }}
          className="bg-white dark:bg-card-dark rounded-3xl border border-red-200 dark:border-red-800/60 shadow-2xl max-w-md w-full p-6 text-center overflow-hidden relative"
        >
          {/* Top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-600" />

          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-800/40">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
            Account Scheduled for Deletion
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Your account is currently in the <strong>7-day grace period</strong> and will be permanently deleted in{' '}
            <span className="text-red-500 font-bold px-1 bg-red-50 dark:bg-red-900/40 rounded">
              {remainingDays} {remainingDays === 1 ? 'day' : 'days'}
            </span>.
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            If you change your mind, you can recover your account right now with one click.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleRecover}
              disabled={recovering}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all disabled:opacity-60"
            >
              <RotateCcw className="w-4 h-4" />
              {recovering ? 'Recovering Account…' : 'Recover My Account 🎉'}
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out for Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
