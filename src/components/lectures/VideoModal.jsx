// src/components/lectures/VideoModal.jsx
// Embedded YouTube Video Player Modal with Framer Motion backdrop blur,
// responsive 16:9 aspect ratio, and lecture completion toggle.

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, PlayCircle, Video, ExternalLink } from 'lucide-react'
import { getYouTubeEmbedUrl } from '@/utils/helpers'

/**
 * @param {object}   props
 * @param {object}   props.lecture       - { id, title, youtubeUrl, ... }
 * @param {boolean}  props.isOpen        - Modal visibility
 * @param {Function} props.onClose       - Close modal handler
 * @param {boolean}  props.isCompleted   - Is lecture completed by user
 * @param {Function} props.onToggleComplete - Toggle completion handler
 */
const VideoModal = ({
  lecture,
  isOpen,
  onClose,
  isCompleted = false,
  onToggleComplete,
}) => {
  if (!isOpen || !lecture) return null

  const embedUrl = getYouTubeEmbedUrl(lecture.youtubeUrl)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold truncate pr-4 text-slate-100">
                {lecture.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player / Placeholder */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={lecture.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center text-center p-8 max-w-md">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <PlayCircle className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-lg text-slate-200 mb-2">
                  No Video Link Added Yet
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Add a <strong>youtubeUrl</strong> field to this lecture in Firestore to play the video embedded here automatically!
                </p>
                <div className="p-3 bg-slate-800/60 rounded-xl font-mono text-[11px] text-primary-300 border border-slate-700/50">
                  youtubeUrl: "https://youtu.be/..."
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-slate-900 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {lecture.youtubeUrl && (
                <a
                  href={lecture.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={() => onToggleComplete(lecture.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-primary-600 hover:bg-primary-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Mark Pending' : 'Mark Completed'}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default VideoModal
