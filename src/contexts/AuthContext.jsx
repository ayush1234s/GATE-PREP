// src/contexts/AuthContext.jsx
// Global authentication state — wraps the entire app.
// Provides: currentUser, userProfile, loading, login, signup, logout, resetPassword
// Handles real-time listening for disabled or deleted accounts & auto-redirects to /login.

import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToAuthChanges, logOut } from '@/firebase/auth'
import { subscribeToUserProfile, purgeDeletedAccount, generateStudentId } from '@/firebase/firestore'
import AccountRecoveryModal from '@/components/common/AccountRecoveryModal'
import DisabledAccountModal from '@/components/common/DisabledAccountModal'
import toast from 'react-hot-toast'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null)
  const [userProfile, setUserProfile]   = useState(null)
  const [loading, setLoading]           = useState(true)  // true until first auth check
  const [disabledModal, setDisabledModal] = useState({ isOpen: false, userDetails: null })

  // Subscribe to Firebase auth state changes & real-time profile updates
  useEffect(() => {
    let unsubscribeProfile = null

    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      // Clean up previous profile listener if any
      if (unsubscribeProfile) {
        unsubscribeProfile()
        unsubscribeProfile = null
      }

      setCurrentUser(firebaseUser)

      if (firebaseUser) {
        // Subscribe in real-time to Firestore user profile
        unsubscribeProfile = subscribeToUserProfile(
          firebaseUser.uid,
          async (profile) => {
            // Case 1: Account profile document does NOT exist (Auto-repair in Firestore)
            if (!profile) {
              console.log('[Auth] User account document missing in Firestore. Auto-repairing for:', firebaseUser.email)
              try {
                await createUserProfile(firebaseUser.uid, {
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
                  email: firebaseUser.email,
                  photoURL: firebaseUser.photoURL || null,
                })
              } catch (err) {
                console.error('[Auth] Auto-repair profile failed:', err)
              }
              return
            }

            // Case 2: Account is Disabled by Admin
            if (profile.disabled) {
              console.log('[Auth] User account disabled by Admin:', profile.email)
              setDisabledModal({
                isOpen: true,
                userDetails: {
                  name: profile.name || firebaseUser.displayName,
                  email: profile.email || firebaseUser.email,
                  studentId: profile.studentId || '—',
                }
              })
              await logOut()
              setCurrentUser(null)
              setUserProfile(null)
              setLoading(false)
              return
            }

            // Case 3: 7-day deletion grace period expired
            if (profile.deletionPending && profile.deletionDueDate) {
              const now = Date.now()
              if (now >= profile.deletionDueDate) {
                console.log('[Auth] 7-day deletion period expired. Purging account...')
                await purgeDeletedAccount(firebaseUser.uid)
                await logOut()
                setCurrentUser(null)
                setUserProfile(null)
                toast.error('This account was permanently deleted after the 7-day grace period.')
                setLoading(false)
                return
              }
            }

            setUserProfile(profile)
            setLoading(false)
          },
          (err) => {
            console.warn('[Auth] Profile listener notice:', err)
            setLoading(false)
          }
        )
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeAuth) unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [])

  /**
   * Refresh userProfile from Firestore
   */
  const refreshProfile = async () => {
    // Real-time listener handles profile updates automatically
  }

  const triggerDisabledModal = (details) => {
    setDisabledModal({ isOpen: true, userDetails: details })
  }

  const handleLogout = () => logOut()

  const value = {
    currentUser,
    userProfile,
    loading,
    refreshProfile,
    triggerDisabledModal,
    logout: handleLogout,
    // Convenience getters
    isAuthenticated: !!currentUser && !!userProfile && !userProfile.disabled,
    displayName: currentUser?.displayName || userProfile?.name || 'Student',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || userProfile?.photoURL || null,
    studentId: userProfile?.studentId || (currentUser?.uid ? generateStudentId(currentUser.uid) : '—'),
    uid: currentUser?.uid || null,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AccountRecoveryModal />
      <DisabledAccountModal
        isOpen={disabledModal.isOpen}
        onClose={() => setDisabledModal({ isOpen: false, userDetails: null })}
        userDetails={disabledModal.userDetails}
      />
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}

export default AuthContext
