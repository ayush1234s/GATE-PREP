// src/hooks/useNotifications.js
// Merges per-user lecture-completion notifications with global admin broadcast notifications.
// Users can dismiss individual admin notifications — dismissed IDs are stored per-user in Firestore.
// Plays an iPhone-style chime whenever a NEW admin broadcast arrives in real-time.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  subscribeToNotifications,
  subscribeToAdminNotifications,
  subscribeToUserProfile,
  deleteNotification,
  clearAllNotifications,
  dismissAdminNotification,
  clearDismissedAdminNotifications,
} from '@/firebase/firestore'
import { playNotificationSound } from '@/utils/notificationSound'

export default function useNotifications() {
  const { uid } = useAuth()
  const [userNotifs,   setUserNotifs]   = useState([])
  const [adminNotifs,  setAdminNotifs]  = useState([])
  const [dismissed,    setDismissed]    = useState([])   // dismissed admin notif IDs for this user
  const [loading,      setLoading]      = useState(true)

  // Track previous admin notif IDs so we can detect truly NEW arrivals
  const prevAdminIdsRef  = useRef(null)   // null = initial load (don't play on mount)
  const isFirstLoadRef   = useRef(true)

  // ── Per-user notifications (lecture completions) ─────────────
  useEffect(() => {
    if (!uid) {
      setUserNotifs([])
      setLoading(false)
      return
    }

    const unsub = subscribeToNotifications(
      uid,
      (data) => { setUserNotifs(data); setLoading(false) },
      (err)  => { console.warn('[useNotifications] user subscription:', err.message); setLoading(false) }
    )
    return unsub
  }, [uid])

  // ── Subscribe to user profile to get dismissedAdminNotifIds ──
  useEffect(() => {
    if (!uid) { setDismissed([]); return }

    const unsub = subscribeToUserProfile(
      uid,
      (profile) => {
        setDismissed(profile?.dismissedAdminNotifIds || [])
      },
      (err) => console.warn('[useNotifications] profile subscription:', err.message)
    )
    return unsub
  }, [uid])

  // ── Global admin broadcast notifications + sound trigger ──────
  useEffect(() => {
    const unsub = subscribeToAdminNotifications(
      (data) => {
        const incomingIds = data.map(n => n.id)

        if (isFirstLoadRef.current) {
          // First snapshot — just record the existing IDs, don't play
          prevAdminIdsRef.current = new Set(incomingIds)
          isFirstLoadRef.current  = false
        } else {
          // Check for any IDs that weren't in the previous snapshot
          const prev = prevAdminIdsRef.current || new Set()
          const hasNew = incomingIds.some(id => !prev.has(id))

          if (hasNew) {
            // 🔔 New broadcast arrived — play iPhone tri-tone chime
            playNotificationSound()
          }

          // Update the reference set
          prevAdminIdsRef.current = new Set(incomingIds)
        }

        setAdminNotifs(data)
      },
      (err) => console.warn('[useNotifications] admin broadcast:', err.message)
    )
    return unsub
  }, [])

  // ── Filter out dismissed admin notifications ──────────────────
  const visibleAdminNotifs = adminNotifs.filter(n => !dismissed.includes(n.id))

  // ── Merge & sort (newest first) ───────────────────────────────
  const notifications = [...userNotifs, ...visibleAdminNotifs].sort((a, b) => {
    const tA = a.createdAt?.seconds || 0
    const tB = b.createdAt?.seconds || 0
    return tB - tA
  })

  // ── Actions ───────────────────────────────────────────────────
  const handleDelete = async (notificationId, isAdmin = false) => {
    if (!uid) return
    try {
      if (isAdmin) {
        await dismissAdminNotification(uid, notificationId)
      } else {
        await deleteNotification(uid, notificationId)
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleClearAll = async () => {
    if (!uid) return
    try {
      await clearAllNotifications(uid)
      const adminIds = visibleAdminNotifs.map(n => n.id)
      for (const id of adminIds) {
        await dismissAdminNotification(uid, id)
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  return {
    notifications,
    unreadCount: notifications.length,
    loading,
    deleteNotification: handleDelete,
    clearAllNotifications: handleClearAll,
  }
}
