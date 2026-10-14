// src/contexts/ScreenFlashContext.jsx
// Provides global state and controls for triggering the animated screen flash & bouncing splash screen.

import { createContext, useContext, useState, useEffect } from 'react'

const ScreenFlashContext = createContext({
  isFlashActive: false,
  triggerFlashScreen: () => {},
  closeFlashScreen: () => {},
})

export const ScreenFlashProvider = ({ children }) => {
  const [isFlashActive, setIsFlashActive] = useState(false)

  // Auto-play flash screen on initial load of each browser session
  useEffect(() => {
    const hasSeenFlash = sessionStorage.getItem('gate_prep_has_seen_flash')
    if (!hasSeenFlash) {
      setIsFlashActive(true)
      sessionStorage.setItem('gate_prep_has_seen_flash', 'true')
    }
  }, [])

  const triggerFlashScreen = () => {
    setIsFlashActive(true)
  }

  const closeFlashScreen = () => {
    setIsFlashActive(false)
  }

  return (
    <ScreenFlashContext.Provider
      value={{
        isFlashActive,
        triggerFlashScreen,
        closeFlashScreen,
      }}
    >
      {children}
    </ScreenFlashContext.Provider>
  )
}

export const useScreenFlash = () => {
  const context = useContext(ScreenFlashContext)
  if (!context) {
    throw new Error('useScreenFlash must be used within a ScreenFlashProvider')
  }
  return context
}

export default ScreenFlashContext
