// src/hooks/useNetworkStatus.js
// Custom React hook for tracking real-time internet connectivity & signal strength.

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Network Information API state
  const [netInfo, setNetInfo] = useState(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    return {
      effectiveType: conn?.effectiveType || '4g',
      downlink: conn?.downlink || null,
      rtt: conn?.rtt || null,
      saveData: conn?.saveData || false,
    }
  })

  // Calculate signal strength (0 to 4)
  const calculateStrength = useCallback((online, info) => {
    if (!online) return 0

    const { effectiveType, downlink, rtt } = info
    if (effectiveType === '4g') {
      if (downlink && downlink >= 5 && rtt && rtt <= 100) return 4 // Strongest
      if (downlink && downlink >= 2) return 3 // Good
      return 3 // Standard 4G
    }
    if (effectiveType === '3g') return 2 // Moderate
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return 1 // Weak
    return 4 // Default fallback for unsupported browsers when online
  }, [])

  const signalStrength = calculateStrength(isOnline, netInfo)

  // Manual ping verification to test actual internet reachability
  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    try {
      // Ping favicon or lightweight asset with timestamp cache-buster
      const response = await fetch(`/favicon.svg?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      })
      const onlineNow = response.ok || response.status < 400
      setIsOnline(onlineNow)
      setIsChecking(false)
      return onlineNow
    } catch {
      // Fetch failed -> offline
      setIsOnline(false)
      setIsChecking(false)
      return false
    }
  }, [])

  useEffect(() => {
    const updateConn = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (conn) {
        setNetInfo({
          effectiveType: conn.effectiveType || '4g',
          downlink: conn.downlink || null,
          rtt: conn.rtt || null,
          saveData: conn.saveData || false,
        })
      }
    }

    const handleOnline = () => {
      setIsOnline(true)
      updateConn()
      if (wasOffline) {
        toast.success('Internet connection restored! You are back online.', {
          id: 'network-restored-toast',
          duration: 4000,
          icon: '🌐',
        })
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      toast.error('Internet connection lost. You are offline.', {
        id: 'network-offline-toast',
        duration: 4000,
        icon: '📡',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (conn) {
      conn.addEventListener('change', updateConn)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (conn) {
        conn.removeEventListener('change', updateConn)
      }
    }
  }, [wasOffline])

  return {
    isOnline,
    signalStrength,
    effectiveType: netInfo.effectiveType,
    downlink: netInfo.downlink,
    rtt: netInfo.rtt,
    saveData: netInfo.saveData,
    isChecking,
    checkConnection,
  }
}
