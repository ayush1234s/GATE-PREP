// src/hooks/useNotifications.js
// Custom hook to manage user notifications in real-time.

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  subscribeToNotifications,
  deleteNotification,
  clearAllNotifications,
} from '@/firebase/firestore'

export default function useNotifications() {
  const { uid } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!uid) {
      setNotifications([])
      setLoading(false)
      return
    }

    const unsub = subscribeToNotifications(
      uid,
      (data) => {
        setNotifications(data)
        setLoading(false)
      },
      (err) => {
        console.warn('[useNotifications] Subscription notice:', err.message)
        setLoading(false)
      }
    )

    return unsub
  }, [uid])

  const handleDelete = async (notificationId) => {
    if (!uid) return
    try {
      await deleteNotification(uid, notificationId)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleClearAll = async () => {
    if (!uid) return
    try {
      await clearAllNotifications(uid)
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    loading,
    deleteNotification: handleDelete,
    clearAllNotifications: handleClearAll,
  }
}
