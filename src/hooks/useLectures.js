// src/hooks/useLectures.js
// Hook to fetch lectures for a given subjectId and unitId.
// Subscribes to Firestore lectures collection with fallback to CURRICULUM_DATA.

import { useState, useEffect } from 'react'
import { subscribeToLectures } from '@/firebase/firestore'
import { CURRICULUM_DATA }    from '@/data/curriculumData'

const useLectures = (subjectId, unitId) => {
  const [lectures, setLectures]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [isDefault, setIsDefault] = useState(false)

  const subjectMeta = CURRICULUM_DATA[subjectId]
  const staticUnit  = (subjectMeta?.units || []).find(u => u.id === unitId)

  useEffect(() => {
    if (!subjectId || !unitId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToLectures(
      subjectId,
      unitId,
      (rawLectures) => {
        if (rawLectures.length === 0) {
          const fallbackLectures = staticUnit?.lectures || []
          setLectures(fallbackLectures)
          setIsDefault(true)
          setLoading(false)
          return
        }

        setIsDefault(false)
        setLectures(rawLectures)
        setLoading(false)
      },
      (err) => {
        console.warn('Lectures Firestore error, using fallback:', err)
        const fallbackLectures = staticUnit?.lectures || []
        setLectures(fallbackLectures)
        setIsDefault(true)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [subjectId, unitId])

  return { lectures, loading, error, isDefault, staticUnit, subjectMeta }
}

export default useLectures
