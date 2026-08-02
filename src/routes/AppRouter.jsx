// src/routes/AppRouter.jsx
// All application routes — public (auth), private (student app), and admin portal routes.

import { lazy, Suspense }     from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute         from '@/components/common/ProtectedRoute'
import AdminProtectedRoute    from '@/components/common/AdminProtectedRoute'
import LoadingSpinner         from '@/components/common/LoadingSpinner'
import AppLayout              from '@/layouts/AppLayout'
import AdminLayout            from '@/layouts/AdminLayout'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Auth pages (no layout)
const Login          = lazy(() => import('@/pages/auth/Login'))
const Signup         = lazy(() => import('@/pages/auth/Signup'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))

// Student pages (wrapped in AppLayout)
const Dashboard      = lazy(() => import('@/pages/Dashboard'))
const Subjects       = lazy(() => import('@/pages/Subjects'))
const Units          = lazy(() => import('@/pages/Units'))
const Lectures       = lazy(() => import('@/pages/Lectures'))
const Tasks          = lazy(() => import('@/pages/Tasks'))
const Profile        = lazy(() => import('@/pages/Profile'))

// Admin pages (wrapped in AdminLayout)
const AdminLogin          = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboard      = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers          = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminCurriculum     = lazy(() => import('@/pages/admin/AdminCurriculum'))
const AdminNotifications  = lazy(() => import('@/pages/admin/AdminNotifications'))

const PageLoader = () => <LoadingSpinner fullScreen label="Loading page…" />

// ─── HOC: wraps a page in ProtectedRoute + AppLayout ─────────────────────────
const PrivatePage = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>
      {children}
    </AppLayout>
  </ProtectedRoute>
)

// ─── HOC: wraps a page in AdminProtectedRoute + AdminLayout ───────────────────
const AdminPage = ({ children }) => (
  <AdminProtectedRoute>
    <AdminLayout>
      {children}
    </AdminLayout>
  </AdminProtectedRoute>
)

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public / auth routes ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Admin routes ── */}
        <Route path="/admin/login"          element={<AdminLogin />} />
        <Route path="/admin/dashboard"      element={<AdminPage><AdminDashboard /></AdminPage>} />
        <Route path="/admin/users"          element={<AdminPage><AdminUsers /></AdminPage>} />
        <Route path="/admin/curriculum"     element={<AdminPage><AdminCurriculum /></AdminPage>} />
        <Route path="/admin/notifications"  element={<AdminPage><AdminNotifications /></AdminPage>} />
        <Route path="/admin"                element={<Navigate to="/admin/dashboard" replace />} />

        {/* ── Student protected routes ── */}
        <Route path="/dashboard"                   element={<PrivatePage><Dashboard /></PrivatePage>} />
        <Route path="/subjects"                    element={<PrivatePage><Subjects  /></PrivatePage>} />
        <Route path="/subjects/:subjectId"         element={<PrivatePage><Units     /></PrivatePage>} />
        <Route path="/subjects/:subjectId/:unitId" element={<PrivatePage><Lectures /></PrivatePage>} />
        <Route path="/tasks"                       element={<PrivatePage><Tasks     /></PrivatePage>} />
        <Route path="/profile"                     element={<PrivatePage><Profile   /></PrivatePage>} />

        {/* ── Catch-all ── */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default AppRouter
