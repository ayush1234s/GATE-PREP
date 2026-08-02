// src/components/common/OfflineModal.jsx
// Full-screen overlay popup when internet connection drops.
// Automatically dismisses when connection is restored.

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react'
import useNetworkStatus from '@/hooks/useNetworkStatus'

const OfflineModal = () => {
  const { isOnline, isChecking, checkConnection } = useNetworkStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div
            key="offline-modal-card"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-card-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 dark:border-red-900/50 text-center relative overflow-hidden"
          >
            {/* Background glowing gradient decoration */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Offline Icon Container with animated pulsing ring */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-red-500/20 dark:bg-red-500/30 animate-ping opacity-75" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-red-500/30">
                <WifiOff className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            {/* Text details */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Offline Mode Active</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Internet Connection Lost
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              We couldn’t reach the network. Please check your Wi-Fi or mobile data connection.
            </p>

            {/* Live Auto-reconnect status pill */}
            <div className="mt-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <span>Waiting for connection to restore...</span>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={checkConnection}
                disabled={isChecking}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-primary-500/25 transition-all disabled:opacity-75 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking Connection...' : 'Check Connection'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
              This window will automatically disappear as soon as you are reconnected.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineModal
