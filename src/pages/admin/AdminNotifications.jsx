// src/pages/admin/AdminNotifications.jsx
// Admin Notification Center — compose rich notifications with images, PDFs, auto-push to student bell.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Send, Link2, X, ChevronUp,
  Trash2, Pencil, Eye,
  RefreshCw, Plus, Bell, Image as ImageIcon, FileText,
  Upload, Paperclip, ExternalLink, Sparkles
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes)) return 'PDF Document'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

// ─── Compose Form ─────────────────────────────────────────────────────────────
const ComposeForm = ({ onSent }) => {
  const [open,       setOpen]       = useState(false)
  const [subject,    setSubject]    = useState('')
  const [message,    setMessage]    = useState('')
  const [link,       setLink]       = useState('')
  const [images,     setImages]     = useState([])
  const [pdfs,       setPdfs]       = useState([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [pdfUrlInput,   setPdfUrlInput]   = useState('')
  const [pdfNameInput,  setPdfNameInput]  = useState('')
  const [sending,    setSending]    = useState(false)

  const imageFileInputRef = useRef(null)
  const pdfFileInputRef   = useRef(null)

  // Handle local image file upload
  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const readPromises = files.map(file => readFileAsDataUrl(file))
    try {
      const base64List = await Promise.all(readPromises)
      setImages(prev => [...prev, ...base64List])
      toast.success(`${files.length} image(s) attached!`)
    } catch {
      toast.error('Failed to read image file(s).')
    }
    if (imageFileInputRef.current) imageFileInputRef.current.value = ''
  }

  // Handle local PDF file upload
  const handlePdfFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    for (const file of files) {
      try {
        const dataUrl = await readFileAsDataUrl(file)
        setPdfs(prev => [
          ...prev,
          {
            name: file.name || 'Document.pdf',
            url: dataUrl,
            size: formatBytes(file.size),
          }
        ])
      } catch {
        toast.error(`Failed to load ${file.name}`)
      }
    }
    toast.success(`${files.length} PDF(s) attached!`)
    if (pdfFileInputRef.current) pdfFileInputRef.current.value = ''
  }

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return
    setImages(prev => [...prev, imageUrlInput.trim()])
    setImageUrlInput('')
    toast.success('Image URL added!')
  }

  // Add PDF via URL
  const handleAddPdfUrl = () => {
    if (!pdfUrlInput.trim()) return
    const name = pdfNameInput.trim() || 'GATE_ECE_Material.pdf'
    setPdfs(prev => [...prev, { name, url: pdfUrlInput.trim(), size: 'Web Link' }])
    setPdfUrlInput('')
    setPdfNameInput('')
    toast.success('PDF URL attached!')
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const removePdf = (idx) => {
    setPdfs(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and Message content are required.')
      return
    }
    setSending(true)
    const tid = toast.loading('Broadcasting notification & pushing to student bell…')
    try {
      await sendAdminBroadcast({
        subject: subject.trim(),
        message: message.trim(),
        link:    link.trim() || '/notifications',
        images:  images,
        pdfs:    pdfs,
        sentBy:  'Admin Center',
      })
      toast.success('Push Notification Broadcasted Successfully! 📢', { id: tid })
      setSubject('')
      setMessage('')
      setLink('/notifications')
      setImages([])
      setPdfs([])
      setOpen(false)
      onSent?.()
    } catch (err) {
      toast.error('Failed to push notification: ' + err.message, { id: tid })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header toggle button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left group hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2 flex-wrap">
              Compose &amp; Push Notification
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300">
                Live Broadcast
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add title, description, PDFs, images &amp; link — automatically pushes to student Notification Center &amp; bell badge!
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
            className="border-t border-slate-800 p-5 sm:p-6 space-y-5"
          >
            {/* Title / Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Notification Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. 🚀 GATE 2026 ECE Formula Sheet & Notes Uploaded!"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-semibold"
                required
              />
            </div>

            {/* Description / Content */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Notification Description / Message <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type full notification detail for GATE aspirants. Explain update, formulas, schedules, etc..."
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed font-medium"
                required
              />
            </div>

            {/* ── PDF Attachments Section ── */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-400" /> PDF Attachments ({pdfs.length})
                </label>
                <button
                  type="button"
                  onClick={() => pdfFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload PDF File
                </button>
                <input
                  ref={pdfFileInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfFileUpload}
                  className="hidden"
                />
              </div>

              {/* URL fallback input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Or paste PDF Name (e.g. Signals_Notes.pdf)"
                  value={pdfNameInput}
                  onChange={e => setPdfNameInput(e.target.value)}
                  className="w-1/3 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="https://... PDF URL"
                  value={pdfUrlInput}
                  onChange={e => setPdfUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddPdfUrl}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  Add PDF Link
                </button>
              </div>

              {/* PDF Preview list */}
              {pdfs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {pdfs.map((pdf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 truncate">{pdf.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{pdf.size || 'PDF File'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePdf(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Image Attachments Section ── */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Image Attachments ({images.length})
                </label>
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Image File
                </button>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </div>

              {/* Image URL fallback */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://... Image URL"
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  Add Image Link
                </button>
              </div>

              {/* Image Thumbnails Grid */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 rounded-full text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-slate-500" /> Target Link (Redirect URL)
                </span>
                <button
                  type="button"
                  onClick={() => setLink('/notifications')}
                  className="text-[10px] text-amber-400 font-mono hover:underline"
                >
                  Use /notifications
                </button>
              </label>
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="/notifications or /subjects or https://..."
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Pushing Notification…' : 'Push Notification Now 🚀'}</span>
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
    const tid = toast.loading('Updating broadcast notification…')
    try {
      await updateAdminNotification(editingNotif.id, {
        subject: editingNotif.subject.trim(),
        message: editingNotif.message.trim(),
        link:    editingNotif.link?.trim() || '/notifications',
        images:  editingNotif.images || [],
        pdfs:    editingNotif.pdfs || [],
      })
      toast.success('Broadcast notification updated!', { id: tid })
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
            Notification Center (Admin Management)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, attach media (PDFs &amp; Images), and push real-time broadcasts to student Notification Center and bell badge.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {notifications.length} Sent Notifications
          </span>
        </div>
      </motion.div>

      {/* Compose Form Widget */}
      <motion.div variants={itemVariants}>
        <ComposeForm />
      </motion.div>

      {/* Sent Notifications Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Pushed Broadcast History ({notifications.length})
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
            <p className="text-xs font-semibold">Loading pushed notifications from Firestore…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No pushed notifications yet</p>
            <p className="text-xs text-slate-500">Click "Compose & Push Notification" above to send your first broadcast!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((n) => {
              const hasImages = (n.images || []).length > 0
              const hasPdfs   = (n.pdfs || []).length > 0
              return (
                <motion.div
                  key={n.id}
                  whileHover={{ y: -2 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
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

                    {/* Media Attachments Indicator Badges */}
                    {(hasImages || hasPdfs) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {hasPdfs && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/15 border border-red-500/30 text-red-300">
                            <FileText className="w-3 h-3 text-red-400" />
                            {n.pdfs.length} PDF Attachment{n.pdfs.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {hasImages && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            {n.images.length} Image{n.images.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}

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
                      <Eye className="w-3.5 h-3.5" /> Preview Card
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
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-amber-900/60 shadow-2xl max-w-lg w-full p-6 text-left relative overflow-hidden space-y-4 my-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
              <button onClick={() => setEditingNotif(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-base text-white">Edit Broadcast Notification</h3>

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
                    rows={4}
                    value={editingNotif.message}
                    onChange={e => setEditingNotif(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white leading-relaxed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Link</label>
                  <input
                    type="text"
                    value={editingNotif.link || ''}
                    onChange={e => setEditingNotif(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setEditingNotif(null)} className="px-4 py-2 rounded-xl text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Card Modal */}
      <AnimatePresence>
        {previewNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6 text-left relative space-y-4"
            >
              <button onClick={() => setPreviewNotif(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-white">Student Card Preview</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white">{previewNotif.subject}</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{previewNotif.message}</p>

                {/* PDFs Preview */}
                {(previewNotif.pdfs || []).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PDF Attachments:</p>
                    {previewNotif.pdfs.map((pdf, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="flex items-center gap-2 text-red-400 truncate">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{pdf.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{pdf.size || 'PDF'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Images Preview */}
                {(previewNotif.images || []).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image Attachments:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {previewNotif.images.map((img, i) => (
                        <img key={i} src={img} alt={`Attached ${i}`} className="w-full h-24 object-cover rounded-xl border border-slate-800" />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 font-mono">{formatTimeAgo(previewNotif.createdAt)}</p>
              </div>

              <div className="text-right">
                <button onClick={() => setPreviewNotif(null)} className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white">Close Preview</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
