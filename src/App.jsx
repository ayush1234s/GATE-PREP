// src/App.jsx
// Root component — wraps the app in AuthProvider + ThemeProvider.
// Renders the global <Toaster> and AppRouter.

import { Toaster }      from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AppRouter        from '@/routes/AppRouter'
import OfflineModal     from '@/components/common/OfflineModal'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Global Offline connectivity popup modal */}
        <OfflineModal />

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background:   '#1e1b4b',
              color:        '#e0e7ff',
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     '14px',
              borderRadius: '12px',
              border:       '1px solid rgba(99,102,241,0.3)',
              boxShadow:    '0 8px 32px rgba(31,38,135,0.37)',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#e0e7ff' },
            },
            error: {
              style: {
                background: '#1f1010',
                border:     '1px solid rgba(239,68,68,0.3)',
              },
              iconTheme: { primary: '#ef4444', secondary: '#fee2e2' },
            },
          }}
        />
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
