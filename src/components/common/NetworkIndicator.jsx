// src/components/common/NetworkIndicator.jsx
// Sidebar & responsive Network status & signal strength indicator.
// Displays live Wifi icon, signal bars strength (0-4), network type (4G/3G/Wi-Fi), and interactive details modal/popover.

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Activity, Gauge, Zap, Info, X } from 'lucide-react'
import useNetworkStatus from '@/hooks/useNetworkStatus'

const SignalBars = ({ strength }) => {
  // 4 bars visual indicator
  return (
    <div className="flex items-end gap-0.5 h-3.5">
      {[1, 2, 3, 4].map((bar) => {
        const isActive = strength >= bar
        return (
          <div
            key={bar}
            className={`w-1 rounded-xs transition-all duration-300 ${
              isActive
                ? strength >= 3
                  ? 'bg-emerald-500'
                  : strength === 2
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
            style={{ height: `${bar * 25}%` }}
          />
        )
      })}
    </div>
  )
}

const NetworkIndicator = ({ compact = false }) => {
  const {
    isOnline,
    signalStrength,
    effectiveType,
    downlink,
    rtt,
    saveData,
    isChecking,
    checkConnection,
  } = useNetworkStatus()

  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef(null)

  // Close popover on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Label helper
  const getNetworkLabel = () => {
    if (!isOnline) return 'Offline'
    if (effectiveType === '4g') return '4G / Wi-Fi'
    if (effectiveType === '3g') return '3G Network'
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'Slow Network'
    return 'Online'
  }

  // Quality badge helper
  const getQualityText = () => {
    if (!isOnline) return 'Disconnected'
    if (signalStrength === 4) return 'Excellent'
    if (signalStrength === 3) return 'Good'
    if (signalStrength === 2) return 'Fair'
    return 'Weak'
  }

  return (
    <div ref={popoverRef} className="relative inline-block w-full">
      {/* ── Main Indicator Pill ── */}
      <button
        onClick={() => setShowPopover((prev) => !prev)}
        className={`w-full flex items-center justify-between transition-all duration-200 group rounded-2xl ${
          compact
            ? 'px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-800'
            : 'px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
        }`}
        title="Click to view network details"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon Badge */}
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              !isOnline
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                : signalStrength >= 3
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4 animate-pulse" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
          </div>

          {!compact && (
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {getNetworkLabel()}
                </span>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
              </div>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                {getQualityText()} • {rtt ? `${rtt}ms` : isOnline ? 'Connected' : 'No Signal'}
              </p>
            </div>
          )}
        </div>

        {/* Signal Bars */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SignalBars strength={signalStrength} />
        </div>
      </button>

      {/* ── Popover Details Card ── */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-72 rounded-3xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-2xl p-4 z-50 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    isOnline
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}
                >
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                    Network Details
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Live connectivity metrics</p>
                </div>
              </div>
              <button
                onClick={() => setShowPopover(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity className="w-3.5 h-3.5" />
                  Status:
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                  }`}
                >
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Zap className="w-3.5 h-3.5" />
                  Network Type:
                </span>
                <span className="font-bold text-slate-800 dark:text-white uppercase">
                  {effectiveType || 'Standard'}
                </span>
              </div>

              {downlink && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Gauge className="w-3.5 h-3.5" />
                    Est. Speed:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {downlink} Mbps
                  </span>
                </div>
              )}

              {rtt && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Info className="w-3.5 h-3.5" />
                    Latency (RTT):
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">{rtt} ms</span>
                </div>
              )}
            </div>

            {/* Manual test button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={checkConnection}
                disabled={isChecking}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{isChecking ? 'Testing...' : 'Test Connection Speed'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NetworkIndicator
