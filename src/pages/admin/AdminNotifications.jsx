// src/pages/admin/AdminNotifications.jsx
// Admin Notifications Manager — compose broadcasts and manage all sent notifications.
// Features: collapsible send form, live table with edit/delete/preview actions.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Send, Link2, X, ChevronDown, ChevronUp,
  Trash2, Pencil, Check, Eye, EyeOff, ArrowLeft,
  Clock, Users, RefreshCw, Plus, AlertCircle, ExternalLink,
  ShieldCheck, Bell
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  sendAdminBroadcast,
  subscribeToAdminNotifications,
  updateAdminNotification,
  deleteAdminNotification,
} from '@/firebase/firestore'
import toast from 'react-hot-toast'

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

      {/* Expandable compose body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSend} className="px-5 sm:px-6 pb-6 space-y-4 border-t border-slate-800">
              <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Subject */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. New Lecture Added, Important Update…"
                    maxLength={100}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Write your announcement here…"
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 text-right">{message.length}/500</p>
                </div>

                {/* Link (optional) */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3 text-slate-400" />
                    Link <span className="text-slate-500 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="https://example.com/resource"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
                  />
                </div>
              </div>

              {/* Live preview */}
              {(subject || message) && (
                <div className="rounded-2xl bg-amber-950/30 border border-amber-800/40 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3 h-3" /> Preview
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">📢</span>
                    <div>
                      <p className="text-sm font-bold text-white">{subject || '—'}</p>
                      <p className="text-xs text-slate-300 leading-snug mt-0.5">{message || '—'}</p>
                      {link && (
                        <p className="text-[11px] text-amber-400 font-semibold mt-1 truncate">🔗 {link}</p>
                      )}
                      <p className="text-[10px] text-amber-500 font-semibold mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Admin Broadcast
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setSubject(''); setMessage(''); setLink('') }}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
                <button
                  type="submit"
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Sending…' : 'Broadcast to All Users'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ notif, onClose, onSaved }) => {
  const [subject, setSubject] = useState(notif.subject || '')
  const [message, setMessage] = useState(notif.message || '')
  const [link,    setLink]    = useState(notif.link    || '')
  const [saving,  setSaving]  = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.target === overlayRef.current) onClose() }
    const keyHandler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [onClose])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) { toast.error('Subject and Message required.'); return }
    setSaving(true)
    const tid = toast.loading('Saving changes…')
    try {
      await updateAdminNotification(notif.id, {
        subject: subject.trim(),
        message: message.trim(),
        link: link.trim(),
      })
      toast.success('Notification updated! ✅', { id: tid })
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error('Failed: ' + err.message, { id: tid })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Edit Notification</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Subject */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition resize-none"
            />
            <p className="text-[10px] text-slate-500 mt-1 text-right">{message.length}/500</p>
          </div>

          {/* Link */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3 h-3 text-slate-400" />
              Link <span className="text-slate-500 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !subject.trim() || !message.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Notifications Table ──────────────────────────────────────────────────────
const NotificationsTable = ({ notifications, loading, onEdit }) => {
  const [expandedId, setExpandedId] = useState(null)
  const [deleting,   setDeleting]   = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this broadcast? Users who haven\'t seen it will lose access.')) return
    setDeleting(id)
    const tid = toast.loading('Deleting…')
    try {
      await deleteAdminNotification(id)
      toast.success('Notification deleted.', { id: tid })
    } catch (err) {
      toast.error('Delete failed: ' + err.message, { id: tid })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading notifications…</span>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-sm font-bold text-slate-400">No broadcasts yet</p>
        <p className="text-xs text-slate-600 mt-1">Compose a notification above to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider w-6">#</th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider min-w-[160px]">Subject</th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider min-w-[200px] hidden md:table-cell">Message</th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Link</th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Sent</th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {notifications.map((n, idx) => (
            <>
              <tr
                key={n.id}
                className="group hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-4 py-3.5 text-[11px] text-slate-500 font-mono">{idx + 1}</td>

                {/* Subject */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📢</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{n.subject}</p>
                      <p className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin Broadcast
                      </p>
                    </div>
                  </div>
                </td>

                {/* Message (truncated) */}
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <p className="text-[11px] text-slate-400 line-clamp-2 max-w-xs leading-snug">{n.message}</p>
                </td>

                {/* Link */}
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  {n.link ? (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline max-w-[120px] truncate"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Link</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-600">—</span>
                  )}
                </td>

                {/* Sent time */}
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-300">{formatTimeAgo(n.createdAt)}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{formatDateTime(n.createdAt)}</p>
                    {n.updatedAt && (
                      <p className="text-[10px] text-amber-600 mt-0.5">Edited</p>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 justify-end">
                    {/* Expand/collapse full message */}
                    <button
                      onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                      title="Preview"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
                    >
                      {expandedId === n.id
                        ? <EyeOff className="w-3.5 h-3.5" />
                        : <Eye  className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(n)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-900/20 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={deleting === n.id}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-50"
                    >
                      {deleting === n.id
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Expanded preview row */}
              <AnimatePresence>
                {expandedId === n.id && (
                  <motion.tr
                    key={`${n.id}-expanded`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="px-4 pb-4 pt-0">
                      <div className="rounded-2xl bg-amber-950/20 border border-amber-800/30 p-4 space-y-2">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Full Message</p>
                        <p className="text-sm font-bold text-white">{n.subject}</p>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                        {n.link && (
                          <a
                            href={n.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> {n.link}
                          </a>
                        )}
                        <p className="text-[10px] text-slate-600">Sent: {formatDateTime(n.createdAt)}{n.updatedAt ? ` • Edited: ${formatDateTime(n.updatedAt)}` : ''}</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminNotifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editingNotif,  setEditingNotif]  = useState(null)

  useEffect(() => {
    const unsub = subscribeToAdminNotifications(
      (data) => { setNotifications(data); setLoading(false) },
      (err)  => { console.warn('[AdminNotifications]', err); setLoading(false) }
    )
    return unsub
  }, [])

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-orange-950 to-slate-950 p-6 md:p-8 text-white shadow-2xl border border-amber-800/40">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </button>
              <span className="text-amber-700">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-extrabold text-amber-300">
                <Megaphone className="w-3.5 h-3.5" /> Notification Manager
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Broadcast Notifications
            </h1>
            <p className="text-xs sm:text-sm text-orange-200/70 max-w-xl leading-relaxed">
              Send and manage announcements that appear in real-time in every student's notification bell.
            </p>
          </div>

          {/* Stats pill */}
          <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-2xl font-black text-amber-300">{notifications.length}</p>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Total Sent</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
              <p className="text-2xl font-black text-blue-300">
                {notifications.filter(n => n.link).length}
              </p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">With Links</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compose Form ── */}
      <ComposeForm onSent={() => {}} />

      {/* ── Sent Notifications Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Sent Notifications</h2>
              <p className="text-[10px] text-slate-500">{notifications.length} total broadcast{notifications.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/40 text-[10px] font-bold text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          )}
        </div>

        <NotificationsTable
          notifications={notifications}
          loading={loading}
          onEdit={(n) => setEditingNotif(n)}
        />
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editingNotif && (
          <EditModal
            notif={editingNotif}
            onClose={() => setEditingNotif(null)}
            onSaved={() => setEditingNotif(null)}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

export default AdminNotifications
