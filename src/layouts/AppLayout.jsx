// src/layouts/AppLayout.jsx
// Main layout for all authenticated pages.
// Composes: fixed Sidebar (desktop) + animated mobile drawer + sticky Navbar + scrollable content.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Navbar  from '@/components/layout/Navbar'

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100/80 dark:bg-surface-dark">

      {/* ── Fixed Sidebar ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Main area (shifted right on desktop to clear sidebar) ── */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 xl:p-8 overflow-auto">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>

        {/* ── Footer ── */}
        <footer className="py-4 px-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 GATE-PREP. All rights reserved.</p>
            <p className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
              Made with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-extrabold text-primary-600 dark:text-primary-400">Ayush Srivastava</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AppLayout
