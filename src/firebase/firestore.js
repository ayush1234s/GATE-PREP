// src/firebase/firestore.js
// Complete Firestore helpers — user profiles, subjects, units, lectures, progress.
// Phase 3 adds real-time subject/unit/lecture subscriptions.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getCountFromServer,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore'
import { db } from './config'

// ═══════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════

/**
 * Helper to generate a 100% permanent, deterministic Student ID (e.g. GATE-ECE-739482) based on UID.
 */
export const generateStudentId = (uid) => {
  if (uid) {
    const clean = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
    return `GATE-ECE-${clean.padEnd(6, '7')}`
  }
  const num = Math.floor(100000 + Math.random() * 900000)
  return `GATE-ECE-${num}`
}

/**
 * Fetch a user profile document. Auto-generates permanent studentId if missing.
 */
export const getUserProfile = async (uid) => {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    if (!data.studentId) {
      const studentId = generateStudentId(uid)
      try {
        await updateDoc(ref, { studentId })
      } catch {
        // ignore update fail if offline
      }
      return { id: snap.id, ...data, studentId }
    }
    return { id: snap.id, ...data }
  }
  return null
}

/**
 * Create user profile on first signup or admin creation.
 */
export const createUserProfile = async (uid, { name, email, photoURL }) => {
  const ref = doc(db, 'users', uid)
  const studentId = generateStudentId(uid)
  await setDoc(ref, {
    name,
    email,
    studentId,
    photoURL: photoURL || null,
    createdAt:          serverTimestamp(),
    completedLectures:  [],
    totalCompleted:     0,
    totalLectures:      0,
    progressPercent:    0,
  }, { merge: true })
}

/**
 * Update arbitrary fields on a user profile.
 */
export const updateUserProfile = async (uid, data) => {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

/**
 * Real-time listener for user profile changes.
 * @returns {Function} unsubscribe
 */
export const subscribeToUserProfile = (uid, callback, onError) => {
  const ref = doc(db, 'users', uid)
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  }, onError)
}

// ═══════════════════════════════════════════════════════════════
// USER PROGRESS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch user progress document (completedLectureIds array).
 */
export const getUserProgress = async (uid) => {
  const ref  = doc(db, 'userProgress', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : { completedLectureIds: [] }
}

/**
 * Real-time listener for user progress.
 * @returns {Function} unsubscribe
 */
export const subscribeToUserProgress = (uid, callback, onError) => {
  const ref = doc(db, 'userProgress', uid)
  return onSnapshot(ref, (snap) => {
    callback(snap.exists()
      ? snap.data()
      : { completedLectureIds: [], updatedAt: null }
    )
  }, onError)
}

/**
 * Mark a lecture as completed.
 * - Adds lectureId to userProgress.completedLectureIds
 * - Increments users.totalCompleted
 */
export const markLectureCompleted = async (uid, lectureId, totalLectures, notifData = null) => {
  // Update userProgress
  const progressRef = doc(db, 'userProgress', uid)
  const progressSnap = await getDoc(progressRef)

  if (progressSnap.exists()) {
    await updateDoc(progressRef, {
      completedLectureIds: arrayUnion(lectureId),
      updatedAt: serverTimestamp(),
    })
  } else {
    await setDoc(progressRef, {
      completedLectureIds: [lectureId],
      updatedAt: serverTimestamp(),
    })
  }

  // Re-fetch to calculate accurate progress
  const updated = await getDoc(progressRef)
  const completedCount = updated.data()?.completedLectureIds?.length ?? 0
  const progressPercent = totalLectures > 0
    ? Math.round((completedCount / totalLectures) * 100)
    : 0

  // Update user profile stats (use setDoc with merge: true so it creates doc if missing)
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    totalCompleted:  completedCount,
    progressPercent: progressPercent,
    updatedAt:       serverTimestamp(),
  }, { merge: true })

  // Trigger completion notification if details provided
  if (notifData) {
    await addNotification(uid, notifData)
  }
}

/**
 * Unmark a lecture as completed.
 */
export const unmarkLectureCompleted = async (uid, lectureId, totalLectures) => {
  const progressRef = doc(db, 'userProgress', uid)
  await setDoc(progressRef, {
    completedLectureIds: arrayRemove(lectureId),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  const updated = await getDoc(progressRef)
  const completedCount = updated.data()?.completedLectureIds?.length ?? 0
  const progressPercent = totalLectures > 0
    ? Math.round((completedCount / totalLectures) * 100)
    : 0

  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    totalCompleted:  completedCount,
    progressPercent: progressPercent,
    updatedAt:       serverTimestamp(),
  }, { merge: true })
}

// ═══════════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all subjects once (sorted by order field).
 */
export const getSubjects = async () => {
  const q    = query(collection(db, 'subjects'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Real-time listener for subjects collection.
 * NO orderBy — sorts client-side to avoid index/type issues.
 * @returns {Function} unsubscribe
 */
export const subscribeToSubjects = (callback, onError) => {
  const colRef = collection(db, 'subjects')

  return onSnapshot(
    colRef,
    (snap) => {
      const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort client-side — handles both number and string order values
      subjects.sort((a, b) => Number(a.order ?? 99) - Number(b.order ?? 99))
      console.log('[Firestore] subjects:', subjects.length, subjects.map(s => s.name))
      callback(subjects)
    },
    (err) => {
      console.error('[Firestore] subjects listener error:', err.code, err.message)
      if (onError) onError(err)
    }
  )
}

/**
 * Seeds the default 10 GATE ECE subjects into Firestore.
 */
export const seedDefaultSubjects = async (defaultSubjects = []) => {
  for (const subject of defaultSubjects) {
    const { id, unitCount, lectureCount, ...data } = subject
    const ref = doc(db, 'subjects', id)
    await setDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
    }, { merge: true })
  }
  console.log('[Firestore] Seeded default GATE ECE subjects successfully.')
}

/**
 * Seeds the ENTIRE GATE ECE Curriculum (all 10 subjects, 49 units, 150+ lectures) to Firestore.
 */
export const seedFullCurriculum = async (curriculumData) => {
  for (const subjectId of Object.keys(curriculumData)) {
    const subject = curriculumData[subjectId]
    const subRef = doc(db, 'subjects', subjectId)
    await setDoc(subRef, {
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      order: subject.order || 1,
      createdAt: serverTimestamp(),
    }, { merge: true })

    for (const unit of subject.units || []) {
      const unitRef = doc(db, 'subjects', subjectId, 'units', unit.id)
      await setDoc(unitRef, {
        name: unit.name,
        order: unit.order,
        createdAt: serverTimestamp(),
      }, { merge: true })

      for (const lec of unit.lectures || []) {
        const lecRef = doc(db, 'subjects', subjectId, 'units', unit.id, 'lectures', lec.id)
        await setDoc(lecRef, {
          title: lec.title,
          order: lec.order,
          youtubeUrl: lec.youtubeUrl || '',
          createdAt: serverTimestamp(),
        }, { merge: true })
      }
    }
  }
  console.log('[Firestore] Seeded full GATE ECE curriculum successfully.')
}

/**
 * Get the number of units inside a subject (uses COUNT aggregation — 1 read).
 */
export const getUnitCount = async (subjectId) => {
  try {
    const ref  = collection(db, 'subjects', subjectId, 'units')
    const snap = await getCountFromServer(ref)
    return snap.data().count
  } catch {
    return 0
  }
}

/**
 * Get the total number of lectures across all units of a subject.
 * Fetches all unitIds first, then counts lectures in parallel.
 */
export const getLectureCount = async (subjectId) => {
  try {
    const unitsSnap = await getDocs(collection(db, 'subjects', subjectId, 'units'))
    if (unitsSnap.empty) return 0

    const counts = await Promise.all(
      unitsSnap.docs.map(async (unitDoc) => {
        const lectureRef  = collection(db, 'subjects', subjectId, 'units', unitDoc.id, 'lectures')
        const lectureSnap = await getCountFromServer(lectureRef)
        return lectureSnap.data().count
      })
    )
    return counts.reduce((sum, c) => sum + c, 0)
  } catch {
    return 0
  }
}

// ═══════════════════════════════════════════════════════════════
// UNITS
// ═══════════════════════════════════════════════════════════════

/**
 * Real-time listener for units inside a subject.
 * @returns {Function} unsubscribe
 */
export const subscribeToUnits = (subjectId, callback, onError) => {
  const q = query(
    collection(db, 'subjects', subjectId, 'units'),
    orderBy('order')
  )
  return onSnapshot(q, (snap) => {
    const units = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(units)
  }, onError)
}

/**
 * Fetch all units for a subject once.
 */
export const getUnits = async (subjectId) => {
  const q    = query(collection(db, 'subjects', subjectId, 'units'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ═══════════════════════════════════════════════════════════════
// LECTURES
// ═══════════════════════════════════════════════════════════════

/**
 * Real-time listener for lectures inside a unit.
 * @returns {Function} unsubscribe
 */
export const subscribeToLectures = (subjectId, unitId, callback, onError) => {
  const q = query(
    collection(db, 'subjects', subjectId, 'units', unitId, 'lectures'),
    orderBy('order')
  )
  return onSnapshot(q, (snap) => {
    const lectures = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(lectures)
  }, onError)
}

/**
 * Fetch all lectures for a unit once.
 */
export const getLectures = async (subjectId, unitId) => {
  const q    = query(
    collection(db, 'subjects', subjectId, 'units', unitId, 'lectures'),
    orderBy('order')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Fetch ALL lectures across all units of a subject (for progress calc).
 * Returns flat array of { id, subjectId, unitId, title, youtubeUrl, ... }
 */
export const getAllLecturesForSubject = async (subjectId) => {
  const units = await getUnits(subjectId)
  const nested = await Promise.all(
    units.map(async (unit) => {
      const lectures = await getLectures(subjectId, unit.id)
      return lectures.map(l => ({ ...l, unitId: unit.id, subjectId }))
    })
  )
  return nested.flat()
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Add a completion notification for a user.
 */
export const addNotification = async (uid, { subjectName, subjectIcon, unitName, lectureTitle }) => {
  if (!uid) return
  try {
    const colRef = collection(db, 'users', uid, 'notifications')
    await addDoc(colRef, {
      subjectName: subjectName || 'Subject',
      subjectIcon: subjectIcon || '📚',
      unitName: unitName || 'Unit',
      lectureTitle: lectureTitle || 'Lecture',
      message: `Completed "${lectureTitle}"`,
      read: false,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Firestore] Failed to add notification:', err)
  }
}

/**
 * Delete a single notification.
 */
export const deleteNotification = async (uid, notificationId) => {
  if (!uid || !notificationId) return
  const ref = doc(db, 'users', uid, 'notifications', notificationId)
  await deleteDoc(ref)
}

/**
 * Clear all notifications for a user.
 */
export const clearAllNotifications = async (uid) => {
  if (!uid) return
  const colRef = collection(db, 'users', uid, 'notifications')
  const snap = await getDocs(colRef)
  const deletes = snap.docs.map(d => deleteDoc(doc(db, 'users', uid, 'notifications', d.id)))
  await Promise.all(deletes)
}

/**
 * Real-time listener for user notifications.
 */
export const subscribeToNotifications = (uid, callback, onError) => {
  if (!uid) return () => {}
  const colRef = collection(db, 'users', uid, 'notifications')
  return onSnapshot(colRef, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    // Sort client-side (newest first)
    list.sort((a, b) => {
      const tA = a.createdAt?.seconds || 0
      const tB = b.createdAt?.seconds || 0
      return tB - tA
    })
    callback(list)
  }, onError)
}

/**
 * Send a broadcast notification from admin to ALL users.
 * Stores in top-level `adminNotifications` collection.
 * @param {{ subject: string, message: string, link?: string, sentBy?: string }} payload
 */
export const sendAdminBroadcast = async ({ subject, message, link = '', sentBy = 'Admin' }) => {
  const colRef = collection(db, 'adminNotifications')
  await addDoc(colRef, {
    subject: subject || 'Announcement',
    message: message || '',
    link:    link    || '',
    sentBy:  sentBy,
    type:    'admin_broadcast',
    createdAt: serverTimestamp(),
  })
}

/**
 * Real-time listener for global admin broadcast notifications.
 * @returns {Function} unsubscribe
 */
export const subscribeToAdminNotifications = (callback, onError) => {
  const colRef = collection(db, 'adminNotifications')
  return onSnapshot(colRef, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => {
      const tA = a.createdAt?.seconds || 0
      const tB = b.createdAt?.seconds || 0
      return tB - tA
    })
    callback(list)
  }, onError || ((err) => console.warn('[Firestore] adminNotifications error:', err)))
}

/**
 * Update an existing admin broadcast notification.
 * @param {string} notifId
 * @param {{ subject?: string, message?: string, link?: string }} data
 */
export const updateAdminNotification = async (notifId, data) => {
  if (!notifId) return
  const ref = doc(db, 'adminNotifications', notifId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

/**
 * Permanently delete an admin broadcast notification from Firestore.
 * @param {string} notifId
 */
export const deleteAdminNotification = async (notifId) => {
  if (!notifId) return
  await deleteDoc(doc(db, 'adminNotifications', notifId))
}

/**
 * Dismiss a single admin broadcast notification for a specific user.
 * Adds the notification ID to `dismissedAdminNotifIds` array on their user doc.
 */
export const dismissAdminNotification = async (uid, notifId) => {
  if (!uid || !notifId) return
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    dismissedAdminNotifIds: arrayUnion(notifId),
  }, { merge: true })
}

/**
 * Clear all dismissed admin notification IDs for a user (used on "Clear All").
 */
export const clearDismissedAdminNotifications = async (uid) => {
  if (!uid) return
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { dismissedAdminNotifIds: [] })
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNT DELETION & RECOVERY (7-Day Grace Period)
// ═══════════════════════════════════════════════════════════════

/**
 * Schedule account deletion with a 7-day grace period.
 */
export const scheduleAccountDeletion = async (uid) => {
  if (!uid) return
  const userRef = doc(db, 'users', uid)
  const now = Date.now()
  const SevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const deletionDueDate = now + SevenDaysMs

  await updateDoc(userRef, {
    deletionPending: true,
    deletionScheduledAt: serverTimestamp(),
    deletionDueDate: deletionDueDate,
  })
}

/**
 * Cancel account deletion (Recover Account).
 */
export const cancelAccountDeletion = async (uid) => {
  if (!uid) return
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    deletionPending: false,
    deletionScheduledAt: null,
    deletionDueDate: null,
  })
}

/**
 * Permanently purge user document and userProgress if 7 days have passed.
 */
export const purgeDeletedAccount = async (uid) => {
  if (!uid) return
  try {
    await deleteDoc(doc(db, 'users', uid))
    await deleteDoc(doc(db, 'userProgress', uid))
  } catch (err) {
    console.warn('[Firestore] Error purging account:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT HELPERS (Users & Curriculum CRUD)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all registered user profiles from Firestore.
 */
export const getAllUsersProfiles = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Real-time subscription to all users.
 */
export const subscribeToAllUsers = (callback, onError) => {
  return onSnapshot(collection(db, 'users'), (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(list)
  }, onError)
}

/**
 * Toggle user disabled status.
 */
export const toggleUserDisabled = async (uid, currentDisabled) => {
  if (!uid) return
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    disabled: !currentDisabled,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete user account forever from Firestore.
 */
export const deleteUserPermanently = async (uid) => {
  if (!uid) return
  await deleteDoc(doc(db, 'users', uid))
  try {
    await deleteDoc(doc(db, 'userProgress', uid))
  } catch (err) {
    console.warn('Progress document delete notice:', err)
  }
}

// ── Admin Curriculum CRUD ─────────────────────────────────────

export const createSubject = async ({ id, name, icon, color, order }) => {
  const subjectId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const ref = doc(db, 'subjects', subjectId)
  await setDoc(ref, {
    name,
    icon: icon || '📚',
    color: color || 'from-indigo-500 to-purple-600',
    order: Number(order) || 1,
    createdAt: serverTimestamp(),
  }, { merge: true })
  return subjectId
}

export const updateSubject = async (subjectId, data) => {
  const ref = doc(db, 'subjects', subjectId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export const deleteSubject = async (subjectId) => {
  const ref = doc(db, 'subjects', subjectId)
  await deleteDoc(ref)
}

export const createUnit = async (subjectId, { id, name, order }) => {
  const unitId = id || `unit_${Date.now()}`
  const ref = doc(db, 'subjects', subjectId, 'units', unitId)
  await setDoc(ref, {
    name,
    order: Number(order) || 1,
    createdAt: serverTimestamp(),
  }, { merge: true })
  return unitId
}

export const updateUnit = async (subjectId, unitId, data) => {
  const ref = doc(db, 'subjects', subjectId, 'units', unitId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export const deleteUnit = async (subjectId, unitId) => {
  const ref = doc(db, 'subjects', subjectId, 'units', unitId)
  await deleteDoc(ref)
}

export const createLecture = async (subjectId, unitId, { id, title, youtubeUrl, order }) => {
  const lecId = id || `lec_${Date.now()}`
  const ref = doc(db, 'subjects', subjectId, 'units', unitId, 'lectures', lecId)
  await setDoc(ref, {
    title,
    youtubeUrl: youtubeUrl || '',
    order: Number(order) || 1,
    createdAt: serverTimestamp(),
  }, { merge: true })
  return lecId
}

export const updateLecture = async (subjectId, unitId, lectureId, data) => {
  const ref = doc(db, 'subjects', subjectId, 'units', unitId, 'lectures', lectureId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export const deleteLecture = async (subjectId, unitId, lectureId) => {
  const ref = doc(db, 'subjects', subjectId, 'units', unitId, 'lectures', lectureId)
  await deleteDoc(ref)
}
