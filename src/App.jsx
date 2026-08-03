// src/App.jsx
// Root component — wraps the app in AuthProvider + ThemeProvider.
// Renders the custom global <CustomToaster> with close buttons and AppRouter.

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AppRouter        from '@/routes/AppRouter'
import CustomToaster    from '@/components/common/CustomToaster'
import OfflineModal     from '@/components/common/OfflineModal'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Global Offline connectivity popup modal */}
        <OfflineModal />

        {/* Global custom toast notifications with Close (✕) buttons */}
        <CustomToaster />

        {/* Main Application Router */}
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
