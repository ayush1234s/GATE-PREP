// src/services/userService.js
// High-level service for user-related Firestore operations.
// Called from Signup page or Auth listener after Firebase Auth creates the user account.

import { createUserProfile } from '@/firebase/firestore'

/**
 * Called once after successful signup or Google OAuth login.
 * Creates/ensures the user document in Firestore with initial progress fields.
 *
 * @param {string|object} userOrUid - Firebase Auth User object OR UID string
 * @param {string} [nameInput]      - User's display name
 * @param {string} [emailInput]     - User's email
 */
export const initializeNewUser = async (userOrUid, nameInput, emailInput) => {
  try {
    let uid = userOrUid
    let name = nameInput
    let email = emailInput

    if (typeof userOrUid === 'object' && userOrUid !== null) {
      uid = userOrUid.uid
      if (!name) name = userOrUid.displayName
      if (!email) email = userOrUid.email
    }

    if (!uid || typeof uid !== 'string' || uid === '[object Object]') {
      console.warn('initializeNewUser: Invalid UID received:', userOrUid)
      return null
    }

    return await createUserProfile(uid, {
      name: name || 'Student Aspirant',
      email: email || '',
    })
  } catch (err) {
    console.error('Failed to create Firestore user profile:', err)
  }
}
