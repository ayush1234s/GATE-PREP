// src/pages/NotificationCenter.jsx
// Student Notification Center page — Notice board displaying official announcements,
// study materials, PDF documents, and Image updates pushed by Admin.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Search, Megaphone,
  FileText, Image as ImageIcon, ExternalLink, X,
  Trash2, Download, Eye, Sparkles, Clock, Calendar,
  ArrowUpRight
} from 'lucide-react'
import useNotifications from '@/hooks/useNotifications'
import toast from 'react-hot-toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const formatDateTime = (ts) => {
  if (!ts) return 'Just now'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const formatTimeAgo = (ts) => {
  if (!ts) return 'Just now'
  const d   = ts.toDate ? ts.toDate() : new Date(ts)
  const sec = Math.floor((Date.now() - d) / 1000)
  if (sec < 60)    return 'Just now'
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

export default function NotificationCenter() {
  const { notifications, loading, deleteNotification, clearAllNotifications } = useNotifications()

  // Filter ONLY official admin pushed notices & updates for the Notification Center
  const officialNotices = useMemo(() => {
    return notifications.filter(n => n.type === 'admin_broadcast')
  }, [notifications])
  
  const [filter, setFilter]           = useState('all') // 'all', 'pdfs', 'images'
  const [search, setSearch]           = useState('')
  const [activeNotif, setActiveNotif]   = useState(null) // Selected notification card for popup modal
  const [lightboxImg, setLightboxImg] = useState(null) // Zoomed image for lightbox

  // Filtered official notices list
  const filteredNotifs = useMemo(() => {
    return officialNotices.filter(n => {
      const hasPdfs   = (n.pdfs || []).length > 0
      const hasImages = (n.images || []).length > 0

      if (filter === 'pdfs'   && !hasPdfs)   return false
      if (filter === 'images' && !hasImages) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const title   = (n.subject || '').toLowerCase()
        const message = (n.message || '').toLowerCase()
        return title.includes(q) || message.includes(q)
      }

      return true
    })
  }, [officialNotices, filter, search])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteNotification(id, true)
    if (activeNotif?.id === id) setActiveNotif(null)
    toast.success('Notice removed')
  }

  const handleClearAll = async () => {
    if (window.confirm('Clear all official notices from your Notification Center?')) {
      await clearAllNotifications()
      setActiveNotif(null)
      toast.success('Notice board cleared')
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6 pb-16"
    >
      {/* ── 1. Hero Header ── */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden text-white"
      >
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Megaphone className="w-3.5 h-3.5 animate-bounce text-amber-400" />
              <span>Official Notice Board &amp; Media Center</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Notification Center
              {officialNotices.length > 0 && (
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 shadow-md">
                  {officialNotices.length} Notice{officialNotices.length > 1 ? 's' : ''}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Official GATE ECE notices, formula sheets, PDF study materials, PYQ solution diagrams, and platform updates pushed by Faculty &amp; Admin.
            </p>
          </div>

          {/* Action buttons */}
          {officialNotices.length > 0 && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleClearAll}
                className="px-4 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 2. Filters & Search Bar ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all',    label: 'All Notices', count: officialNotices.length },
            { id: 'pdfs',   label: 'With PDFs 📄', count: officialNotices.filter(n => (n.pdfs || []).length > 0).length },
            { id: 'images', label: 'With Images 🖼️', count: officialNotices.filter(n => (n.images || []).length > 0).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                filter === tab.id
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notices, PDFs, images..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-sm"
          />
        </div>
      </motion.div>

      {/* ── 3. Notice Cards Grid / List ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-800/40">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No official notices found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search ? 'Try adjusting your search query.' : 'New announcements, PDF documents, and image updates pushed by Admin will appear here!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotifs.map((item) => {
              const hasPdfs   = (item.pdfs || []).length > 0
              const hasImages = (item.images || []).length > 0

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.005, y: -2 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setActiveNotif(item)}
                  className="cursor-pointer p-5 sm:p-6 rounded-3xl border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-600 bg-white dark:bg-card-dark shadow-sm transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  {/* Left amber accent bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />

                  {/* Card Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0 pl-2">
                    {/* Megaphone / Notice Icon */}
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                      📢
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Badge & Timestamp */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Official Notice
                        </span>

                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      {/* Subject Title */}
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.subject || 'Platform Announcement'}
                      </h3>

                      {/* Description Excerpt */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      {/* Media Badges (PDF & Image Count) */}
                      {(hasPdfs || hasImages) && (
                        <div className="flex items-center gap-2 pt-1">
                          {hasPdfs && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-300">
                              <FileText className="w-3 h-3 text-red-500" />
                              {item.pdfs.length} PDF Attachment{item.pdfs.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {hasImages && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-300">
                              <ImageIcon className="w-3 h-3 text-emerald-500" />
                              {item.images.length} Image{item.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side CTA & Delete */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      <Eye className="w-4 h-4" /> Read Notice
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Remove notice"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* ── 4. Popup Card Modal (Read Full Notice with PDFs & Images) ── */}
      <AnimatePresence>
        {activeNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-left relative overflow-hidden space-y-6 my-8"
            >
              {/* Header bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center text-2xl shadow-md">
                    📢
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      Official Notice &amp; Announcement
                    </span>
                    <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateTime(activeNotif.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveNotif(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Message */}
              <div className="space-y-3">
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeNotif.subject || 'Notice Detail'}
                </h2>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {activeNotif.message}
                </div>
              </div>

              {/* ── PDF Attachments Viewer ── */}
              {(activeNotif.pdfs || []).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-500" />
                    PDF Documents ({(activeNotif.pdfs).length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNotif.pdfs.map((pdf, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{pdf.name || 'Document.pdf'}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{pdf.size || 'PDF File'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> View PDF
                          </a>
                          <a
                            href={pdf.url}
                            download={pdf.name || 'document.pdf'}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Image Gallery Attachments ── */}
              {(activeNotif.images || []).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    Attached Images ({(activeNotif.images).length})
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeNotif.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImg(imgUrl)}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video cursor-pointer"
                      >
                        <img
                          src={imgUrl}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-6 h-6" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Link / PDF Action Button */}
              {(() => {
                const hasCustomLink = activeNotif.link && activeNotif.link.trim() !== '' && activeNotif.link !== '/notifications'
                const firstPdf = (activeNotif.pdfs || [])[0]
                const targetUrl = hasCustomLink ? activeNotif.link : (firstPdf ? firstPdf.url : (activeNotif.link && activeNotif.link.trim() !== '' ? activeNotif.link : null))
                const actionLabel = hasCustomLink
                  ? 'Open Attached Link / Resource'
                  : (firstPdf ? `View ${firstPdf.name || 'PDF Document'} in New Tab` : 'Open Resource Link')

                if (!targetUrl) return null

                return (
                  <div className="pt-2">
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
                    >
                      <span>{actionLabel}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                )
              })()}

              {/* Close Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <button
                  onClick={() => setActiveNotif(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Close Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 5. Full Screen Image Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxImg && (
          <div
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={lightboxImg}
              alt="Zoomed Attachment"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
