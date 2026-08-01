// src/contexts/ThemeContext.jsx
// Manages dark / light mode. Persists to localStorage.
// Respects the user's OS preference on first visit.

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('gate-prep-theme')
      if (saved) return saved === 'dark'
    } catch (_) { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply / remove 'dark' class on <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('gate-prep-theme', isDark ? 'dark' : 'light')
    } catch (_) { /* ignore */ }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

export default ThemeContext
