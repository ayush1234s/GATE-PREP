// src/hooks/useNotifications.js
// Merges per-user lecture-completion notifications with global admin broadcast notifications.
// Users can dismiss individual admin notifications — dismissed IDs are stored per-user in Firestore.

import { useState, useEffect } from 'react'
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

export default function useNotifications() {
  const { uid } = useAuth()
  const [userNotifs,   setUserNotifs]   = useState([])
  const [adminNotifs,  setAdminNotifs]  = useState([])
  const [dismissed,    setDismissed]    = useState([])   // dismissed admin notif IDs for this user
  const [loading,      setLoading]      = useState(true)

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

  // ── Global admin broadcast notifications ─────────────────────
  useEffect(() => {
    const unsub = subscribeToAdminNotifications(
      (data) => setAdminNotifs(data),
      (err)  => console.warn('[useNotifications] admin broadcast:', err.message)
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
        // Store dismiss in user profile — keeps global notif intact
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
      // Clear user's own lecture-completion notifications
      await clearAllNotifications(uid)
      // Clear user's dismissed-admin list so visible admin notifs also disappear
      // by adding ALL currently visible admin notif IDs to dismissed
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
