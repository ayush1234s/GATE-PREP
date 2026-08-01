// src/components/common/AdminProtectedRoute.jsx
// Protected route wrapper for Admin Portal — verifies admin privileges.

import { Navigate } from 'react-router-dom'
import { useAuth }  from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen label="Verifying admin credentials…" />
  }

  const isAdmin =
    currentUser?.email === 'admin@gateprep.com' ||
    userProfile?.role === 'admin' ||
    userProfile?.email === 'admin@gateprep.com'

  if (!currentUser || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminProtectedRoute
