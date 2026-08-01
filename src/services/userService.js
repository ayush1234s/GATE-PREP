// src/services/userService.js
// High-level service for user-related Firestore operations.
// Called from Signup page after Firebase Auth creates the user account.

import { createUserProfile } from '@/firebase/firestore'

/**
 * Called once after successful signup.
 * Creates the user document in Firestore with initial empty progress.
 *
 * @param {string} uid    - Firebase Auth UID
 * @param {string} name   - User's display name
 * @param {string} email  - User's email
 */
export const initializeNewUser = async (uid, name, email) => {
  try {
    await createUserProfile(uid, { name, email })
  } catch (err) {
    // Non-fatal — user can still use the app; profile will be created on next login
    console.error('Failed to create Firestore user profile:', err)
  }
}
