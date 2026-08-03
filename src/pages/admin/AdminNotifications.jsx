// src/pages/admin/AdminNotifications.jsx
// Admin Notifications Manager — compose broadcasts and manage all sent notifications.
// Features: collapsible send form, live table with edit/delete/preview actions, and Framer Motion entrance reveals.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Send, Link2, X, ChevronUp,
  Trash2, Pencil, Eye,
  RefreshCw, Plus, Bell
} from 'lucide-react'
import {
  sendAdminBroadcast,
  subscribeToAdminNotifications,
  updateAdminNotification,
  deleteAdminNotification,
} from '@/firebase/firestore'
import toast from 'react-hot-toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatDateTime = (ts) => {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const formatTimeAgo = (ts) => {
  if (!ts) return '—'
  const d   = ts.toDate ? ts.toDate() : new Date(ts)
  const sec = Math.floor((Date.now() - d) / 1000)
  if (sec < 60)    return 'Just now'
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

// ─── Compose Form ─────────────────────────────────────────────────────────────
const ComposeForm = ({ onSent }) => {
  const [open,    setOpen]    = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [link,    setLink]    = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and Message are required.')
      return
    }
    setSending(true)
    const tid = toast.loading('Broadcasting notification…')
    try {
      await sendAdminBroadcast({ subject: subject.trim(), message: message.trim(), link: link.trim() })
      toast.success('Notification broadcast to all users! 📢', { id: tid })
      setSubject(''); setMessage(''); setLink('')
      setOpen(false)
      onSent?.()
    } catch (err) {
      toast.error('Failed: ' + err.message, { id: tid })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2 flex-wrap">
              Compose New Notification
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300">
                Broadcast
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in subject &amp; message — shown instantly in every student's bell.
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-xl border transition-all flex-shrink-0 ml-2 ${
          open
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            : 'border-slate-700 text-slate-400 group-hover:border-amber-500/40 group-hover:text-amber-400'
        }`}>
          {open ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      {/* Form panel */}
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSend}
            className="border-t border-slate-800 p-5 sm:p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Subject Line <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. 🔥 GATE 2026 PYQ Solutions Uploaded!"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Message Content <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your notification message for all student aspirants..."
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-slate-500" /> Optional Target URL
              </label>
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="e.g. /subjects or /tasks or https://..."
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Broadcasting…' : 'Broadcast Now'}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main AdminNotifications Page ─────────────────────────────────────────────
export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editingNotif,  setEditingNotif]  = useState(null)
  const [deletingId,    setDeletingId]    = useState(null)
  const [previewNotif,  setPreviewNotif]  = useState(null)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToAdminNotifications(
      (list) => {
        setNotifications(list)
        setLoading(false)
      },
      (err) => {
        console.error('Admin notifications listener error:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingNotif) return
    const tid = toast.loading('Updating notification…')
    try {
      await updateAdminNotification(editingNotif.id, {
        subject: editingNotif.subject.trim(),
        message: editingNotif.message.trim(),
        link:    editingNotif.link?.trim() || '',
      })
      toast.success('Notification updated!', { id: tid })
      setEditingNotif(null)
    } catch (err) {
      toast.error('Failed to update: ' + err.message, { id: tid })
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const tid = toast.loading('Deleting notification…')
    try {
      await deleteAdminNotification(id)
      toast.success('Notification removed!', { id: tid })
    } catch (err) {
      toast.error('Failed to delete: ' + err.message, { id: tid })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >

      {/* Hero Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            System Broadcasts &amp; Notifications Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast platform-wide updates to all registered GATE ECE students in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {notifications.length} Sent Broadcasts
          </span>
        </div>
      </motion.div>

      {/* Compose Form Widget */}
      <motion.div variants={itemVariants}>
        <ComposeForm />
      </motion.div>

      {/* Sent Notifications List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            All Sent System Broadcasts ({notifications.length})
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
            <p className="text-xs font-semibold">Loading broadcasts from Firestore…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No broadcasts sent yet</p>
            <p className="text-xs text-slate-500">Click "Compose New Notification" above to send your first broadcast!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                whileHover={{ y: -2 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/50">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white leading-snug">{n.subject}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{n.message}</p>

                  {n.link && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 truncate max-w-full">
                        <Link2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{n.link}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewNotif(n)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingNotif(n)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={deletingId === n.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/40 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === n.id ? 'Deleting…' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-amber-900/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
              <button onClick={() => setEditingNotif(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-base text-white">Edit System Broadcast</h3>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingNotif.subject}
                    onChange={e => setEditingNotif(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={editingNotif.message}
                    onChange={e => setEditingNotif(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white leading-relaxed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target URL Link</label>
                  <input
                    type="text"
                    value={editingNotif.link || ''}
                    onChange={e => setEditingNotif(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setEditingNotif(null)} className="px-4 py-2 rounded-xl text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-sm w-full p-5 text-left relative space-y-3"
            >
              <button onClick={() => setPreviewNotif(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-white">Student Bell View Preview</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-white">{previewNotif.subject}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{previewNotif.message}</p>
                <p className="text-[10px] text-slate-500 font-mono">{formatTimeAgo(previewNotif.createdAt)}</p>
              </div>

              <div className="text-right">
                <button onClick={() => setPreviewNotif(null)} className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
