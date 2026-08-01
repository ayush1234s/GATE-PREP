// src/components/common/DisabledAccountModal.jsx
// Popup modal displayed when a user account has been disabled by the Administrator.

import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, UserX, X, Lock, Mail, Fingerprint } from 'lucide-react'

const DisabledAccountModal = ({ isOpen, onClose, userDetails }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          className="w-full max-w-md bg-slate-900 border border-red-800/60 rounded-3xl p-6 text-left space-y-5 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient red glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-500 flex-shrink-0 shadow-lg shadow-red-950/50">
              <UserX className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/50">
                Access Restricted
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Account Disabled by Admin
              </h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            Your GATE-PREP student account has been disabled by the platform administrator. You are currently restricted from logging into the student app or accessing lectures.
          </p>

          {/* User Details Box */}
          {userDetails && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <UserX className="w-3.5 h-3.5 text-red-400" /> {userDetails.name || 'Student'}
                </span>
                <span className="font-mono text-purple-300 font-bold">{userDetails.studentId || '—'}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{userDetails.email}</p>
            </div>
          )}

          {/* Help Notice */}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-[11px] text-red-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>If you believe this is an error, please contact Administrator support.</span>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>I Understand</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DisabledAccountModal
