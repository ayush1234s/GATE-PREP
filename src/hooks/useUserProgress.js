// src/hooks/useUserProgress.js
// Real-time hook for the current user's completed lecture IDs.
// Used by subject/lecture pages to show progress checkboxes and bars.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth }             from '@/contexts/AuthContext'
import { subscribeToUserProgress } from '@/firebase/firestore'

/**
 * Returns the user's progress data with real-time Firestore updates.
 * Memoized to prevent re-render cascades in long lists.
 */
const useUserProgress = () => {
  const { uid }   = useAuth()
  const [data,    setData]    = useState({ completedLectureIds: [] })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToUserProgress(
      uid,
      (progressData) => {
        setData(progressData || { completedLectureIds: [] })
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('User progress listener error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [uid])

  // Convert to a Set for O(1) lookups memoized on data
  const completedIds = useMemo(() => {
    return new Set(data?.completedLectureIds ?? [])
  }, [data?.completedLectureIds])

  // Memoized lookup helper
  const isCompleted = useCallback(
    (lectureId) => completedIds.has(lectureId),
    [completedIds]
  )

  return {
    completedIds,
    loading,
    error,
    isCompleted,
    totalCompleted: completedIds.size,
  }
}

export default useUserProgress
