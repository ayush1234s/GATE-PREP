// src/firebase/auth.js
// All Firebase Authentication helpers used across the application.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from './config'
import { getUserProfile, createUserProfile, updateUserProfile } from './firestore'
import { sendWelcomeEmail } from '@/services/emailService'

// ─── Sign Up ─────────────────────────────────────────────────────────────────
/**
 * Create a new user and set their displayName.
 * @param {string} name       - Full name for the profile
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (name, email, password) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  try {
    await sendEmailVerification(credential.user)
    console.log('[Auth] Verification email sent to:', email)
  } catch (err) {
    console.warn('[Auth] Verification email notice:', err.message)
  }
  return credential
}

// ─── Log In ──────────────────────────────────────────────────────────────────
/**
 * Sign in with email/password.
 * @param {string}  email
 * @param {string}  password
 * @param {boolean} remember  - true → persist across browser sessions
 * @returns {Promise<UserCredential>}
 */
export const logInWithEmail = async (email, password, remember = true) => {
  const persistence = remember
    ? browserLocalPersistence
    : browserSessionPersistence
  await setPersistence(auth, persistence)
  return signInWithEmailAndPassword(auth, email, password)
}

// ─── Admin Log In ─────────────────────────────────────────────────────────────
/**
 * Admin portal sign-in using Admin ID ("Admin2026") or admin email.
 * Password: "@Admin2026"
 */
export const adminLogIn = async (adminInput, password) => {
  const normalizedInput = adminInput.trim().toLowerCase()
  let targetEmail = adminInput.trim()

  if (normalizedInput === 'admin2026' || normalizedInput === 'admin') {
    targetEmail = 'admin@gateprep.com'
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, targetEmail, password)
    const user = credential.user
    // Ensure admin profile has role: 'admin'
    try {
      await updateUserProfile(user.uid, { role: 'admin', name: 'GATE-PREP Admin' })
    } catch (e) {
      // ignore
    }
    return credential
  } catch (err) {
    // If admin account doesn't exist yet in Firebase Auth, auto-initialize it on first valid password entry
    if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') && password === '@Admin2026') {
      try {
        const credential = await createUserWithEmailAndPassword(auth, 'admin@gateprep.com', '@Admin2026')
        await updateProfile(credential.user, { displayName: 'GATE-PREP Admin' })
        await createUserProfile(credential.user.uid, {
          name: 'GATE-PREP Admin',
          email: 'admin@gateprep.com',
          role: 'admin',
        })
        return credential
      } catch (createErr) {
        console.error('[Admin Auth] Creation failed:', createErr)
      }
    }
    throw err
  }
}

// ─── Admin Manual User Creation ──────────────────────────────────────────────
/**
 * Create a new student account manually from Admin Panel.
 * Creates Firebase Auth account and initializes Firestore user profile.
 */
export const adminCreateUser = async (name, email, password) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  await createUserProfile(credential.user.uid, {
    name,
    email,
    photoURL: null,
  })
  try {
    sendWelcomeEmail(credential.user, name)
  } catch (e) {
    // ignore
  }
  return credential.user
}

// ─── Google Auth ──────────────────────────────────────────────────────────────
/**
 * Sign in or Sign up using Google OAuth Popup.
 * Creates Firestore user profile automatically if first time.
 */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  try {
    const profile = await getUserProfile(user.uid)
    if (!profile) {
      await createUserProfile(user.uid, {
        name: user.displayName || 'Student',
        email: user.email,
        photoURL: user.photoURL || null,
      })
      // Trigger welcome email for new Google user
      sendWelcomeEmail(user, user.displayName)
    } else if (user.photoURL && !profile.photoURL) {
      await updateUserProfile(user.uid, { photoURL: user.photoURL })
    }
  } catch (err) {
    console.warn('Google login profile check error:', err)
  }

  return result
}

// ─── Log Out ─────────────────────────────────────────────────────────────────
export const logOut = () => signOut(auth)

// ─── Forgot Password ─────────────────────────────────────────────────────────
/**
 * Send a password-reset email.
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

// ─── Auth State Observer ─────────────────────────────────────────────────────
/**
 * Subscribe to auth state changes.
 * @param {Function} callback  - called with (user | null)
 * @returns {Function}         - unsubscribe function
 */
export const subscribeToAuthChanges = (callback) =>
  onAuthStateChanged(auth, callback)
