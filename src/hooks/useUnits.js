// src/hooks/useUnits.js
// Hook to fetch units for a given subjectId.
// Merges Firestore units with CURRICULUM_DATA fallback!

import { useState, useEffect } from 'react'
import { subscribeToUnits, getLectures } from '@/firebase/firestore'
import { CURRICULUM_DATA } from '@/data/curriculumData'

const useUnits = (subjectId) => {
  const [units, setUnits]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [isDefault, setIsDefault] = useState(false)

  const subjectMeta = CURRICULUM_DATA[subjectId] || {
    name: 'Subject',
    icon: '📚',
    color: 'indigo',
    units: [],
  }

  useEffect(() => {
    if (!subjectId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToUnits(
      subjectId,
      async (rawUnits) => {
        if (rawUnits.length === 0) {
          // Fallback to static curriculum units
          const fallbackUnits = (subjectMeta.units || []).map(u => ({
            ...u,
            lectureCount: u.lectures?.length || 0,
          }))
          setUnits(fallbackUnits)
          setIsDefault(true)
          setLoading(false)
          return
        }

        setIsDefault(false)
        // Enrich Firestore units with lecture counts
        const enriched = await Promise.all(
          rawUnits.map(async (unit) => {
            try {
              const lectures = await getLectures(subjectId, unit.id)
              return { ...unit, lectureCount: lectures.length }
            } catch {
              return { ...unit, lectureCount: 0 }
            }
          })
        )

        setUnits(enriched)
        setLoading(false)
      },
      (err) => {
        console.warn('Units Firestore error, falling back to static:', err)
        const fallbackUnits = (subjectMeta.units || []).map(u => ({
          ...u,
          lectureCount: u.lectures?.length || 0,
        }))
        setUnits(fallbackUnits)
        setIsDefault(true)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [subjectId])

  return { units, loading, error, isDefault, subjectMeta }
}

export default useUnits
