// src/components/common/ProtectedRoute.jsx
// Wrapper component that guards private routes.
// Redirects unauthenticated users to /login.
// Shows a full-screen spinner while the auth state is being determined.

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth }               from '@/contexts/AuthContext'
import LoadingSpinner            from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, userProfile, loading, logout } = useAuth()
  const location = useLocation()

  // Wait for Firebase to determine auth state before deciding
  if (loading) {
    return <LoadingSpinner fullScreen label="Checking authentication…" />
  }

  // Disabled user check
  if (isAuthenticated && userProfile?.disabled) {
    logout()
    return <Navigate to="/login" replace />
  }

  // Not authenticated → redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
