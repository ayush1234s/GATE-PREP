// src/hooks/useSubjects.js
// Real-time subjects hook.
// Merges Firestore subjects with DEFAULT_SUBJECTS so every single subject
// has complete unitCount and lectureCount statistics and displays progress perfectly!

import { useState, useEffect } from 'react'
import { subscribeToSubjects, getUnitCount, getLectureCount, seedDefaultSubjects } from '@/firebase/firestore'
import { DEFAULT_SUBJECTS } from '@/data/defaultSubjects'

const defaultMap = {}
DEFAULT_SUBJECTS.forEach(s => {
  defaultMap[s.id] = s
})

// Helper to merge Firestore raw data with default data
const mergeSubjectsWithDefaults = async (rawSubjects) => {
  // Start with default subjects list
  const mergedMap = new Map()
  DEFAULT_SUBJECTS.forEach(ds => {
    mergedMap.set(ds.id, { ...ds })
  })

  // Override with Firestore data when available
  rawSubjects.forEach(fsSubject => {
    const existing = mergedMap.get(fsSubject.id) || defaultMap[fsSubject.id] || {}
    mergedMap.set(fsSubject.id, {
      ...existing,
      ...fsSubject,
      // Retain default unit & lecture counts if Firestore count is 0
      unitCount: fsSubject.unitCount || existing.unitCount || 0,
      lectureCount: fsSubject.lectureCount || existing.lectureCount || 0,
    })
  })

  const mergedList = Array.from(mergedMap.values())
  mergedList.sort((a, b) => Number(a.order ?? 99) - Number(b.order ?? 99))

  // Try to query real Firestore subcollection counts in parallel
  const enriched = await Promise.all(
    mergedList.map(async (subject) => {
      try {
        const [fsUnits, fsLectures] = await Promise.all([
          getUnitCount(subject.id),
          getLectureCount(subject.id),
        ])
        const defaultSub = defaultMap[subject.id]
        return {
          ...subject,
          unitCount: fsUnits > 0 ? fsUnits : (defaultSub?.unitCount || subject.unitCount || 0),
          lectureCount: fsLectures > 0 ? fsLectures : (defaultSub?.lectureCount || subject.lectureCount || 0),
        }
      } catch {
        const defaultSub = defaultMap[subject.id]
        return {
          ...subject,
          unitCount: subject.unitCount || defaultSub?.unitCount || 0,
          lectureCount: subject.lectureCount || defaultSub?.lectureCount || 0,
        }
      }
    })
  )

  return enriched
}

const useSubjects = () => {
  const [subjects, setSubjects]   = useState(DEFAULT_SUBJECTS)
  const [loading,  setLoading]    = useState(true)
  const [error,    setError]      = useState(null)
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    console.log('[useSubjects] subscribing...')

    const unsubscribe = subscribeToSubjects(
      async (rawSubjects) => {
        try {
          const merged = await mergeSubjectsWithDefaults(rawSubjects)
          setSubjects(merged)
          setIsDefault(rawSubjects.length === 0)
          setLoading(false)
          setError(null)
        } catch (err) {
          console.warn('[useSubjects] merge error:', err)
          setSubjects(DEFAULT_SUBJECTS)
          setLoading(false)
        }
      },
      (err) => {
        console.error('[useSubjects] error:', err.code, err.message)
        setSubjects(DEFAULT_SUBJECTS)
        setIsDefault(true)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const seedAllSubjects = async () => {
    try {
      await seedDefaultSubjects(DEFAULT_SUBJECTS)
    } catch (err) {
      console.error('Failed to seed subjects:', err)
    }
  }

  return { subjects, loading, error, isDefault, seedAllSubjects }
}

export default useSubjects
