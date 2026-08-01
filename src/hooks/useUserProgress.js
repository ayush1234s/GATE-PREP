// src/hooks/useUserProgress.js
// Real-time hook for the current user's completed lecture IDs.
// Used by subject/lecture pages to show progress checkboxes and bars.

import { useState, useEffect } from 'react'
import { useAuth }             from '@/contexts/AuthContext'
import { subscribeToUserProgress } from '@/firebase/firestore'

/**
 * Returns the user's progress data with real-time Firestore updates.
 *
 * @returns {{
 *   completedIds:  Set<string>,   // Set of completed lecture IDs (fast lookup)
 *   loading:       boolean,
 *   error:         string | null,
 *   isCompleted:   (lectureId: string) => boolean,
 * }}
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
        setData(progressData)
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

  // Convert to a Set for O(1) lookups
  const completedIds = new Set(data?.completedLectureIds ?? [])

  return {
    completedIds,
    loading,
    error,
    isCompleted: (lectureId) => completedIds.has(lectureId),
    totalCompleted: completedIds.size,
  }
}

export default useUserProgress
