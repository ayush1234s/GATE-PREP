// src/pages/Lectures.jsx
// Lectures Page — Displays all lectures inside a selected Unit.
// Features progress checkboxes, embedded video player modal, and real-time Firestore sync.

import { useState, useMemo } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { motion }           from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, PlayCircle, Search,
  Video, CloudUpload, Clock, Award, ShieldCheck,
} from 'lucide-react'
import toast                 from 'react-hot-toast'
import useLectures           from '@/hooks/useLectures'
import useUserProgress       from '@/hooks/useUserProgress'
import VideoModal            from '@/components/lectures/VideoModal'
import EmptyState            from '@/components/common/EmptyState'
import { markLectureCompleted, unmarkLectureCompleted } from '@/firebase/firestore'
import { useAuth }           from '@/contexts/AuthContext'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db }                from '@/firebase/config'

const Lectures = () => {
  const { subjectId, unitId }           = useParams()
  const { uid, currentUser, userProfile, refreshProfile } = useAuth()
  const { lectures, loading, isDefault, staticUnit, subjectMeta } = useLectures(subjectId, unitId)
  const { completedIds, isCompleted }   = useUserProgress()

  const [selectedLecture, setSelectedLecture] = useState(null)
  const [isVideoOpen, setIsVideoOpen]         = useState(false)
  const [search, setSearch]                   = useState('')
  const [syncing, setSyncing]                 = useState(false)

  // Progress metrics for this unit
  const unitCompletedCount = useMemo(() => {
    return lectures.filter(l => isCompleted(l.id)).length
  }, [lectures, completedIds])

  const progressPercent = lectures.length > 0
    ? Math.round((unitCompletedCount / lectures.length) * 100)
    : 0

  // Filtered lectures
  const filteredLectures = useMemo(() => {
    if (!search.trim()) return lectures
    const q = search.toLowerCase()
    return lectures.filter(l => l.title?.toLowerCase().includes(q))
  }, [lectures, search])

  // Toggle lecture completion status
  const handleToggleComplete = async (lectureId) => {
    const userId = uid || currentUser?.uid || userProfile?.id
    if (!userId) {
      toast.error('Please log in to track progress.')
      return
    }

    const currentlyDone = isCompleted(lectureId)
    const totalLectures = userProfile?.totalLectures || 50

    try {
      if (currentlyDone) {
        await unmarkLectureCompleted(userId, lectureId, totalLectures)
        toast.success('Marked as pending')
      } else {
        const targetLec = lectures.find(l => l.id === lectureId)
        await markLectureCompleted(userId, lectureId, totalLectures, {
          subjectName: subjectMeta?.name || 'GATE Subject',
          subjectIcon: subjectMeta?.icon || '📚',
          unitName: staticUnit?.name || 'Unit',
          lectureTitle: targetLec?.title || 'Lecture',
        })
        toast.success('Lecture completed! 🎉')
      }
      if (refreshProfile) refreshProfile()
    } catch (err) {
      toast.error('Failed to update progress: ' + err.message)
    }
  }

  const handleOpenVideo = (lecture) => {
    setSelectedLecture(lecture)
    setIsVideoOpen(true)
  }

  const handleSyncLectures = async () => {
    if (!staticUnit) return
    setSyncing(true)
    const tid = toast.loading(`Syncing ${staticUnit.name} lectures to Firestore...`)
    try {
      for (const lec of staticUnit.lectures || []) {
        const ref = doc(db, 'subjects', subjectId, 'units', unitId, 'lectures', lec.id)
        await setDoc(ref, {
          title: lec.title,
          order: lec.order,
          youtubeUrl: lec.youtubeUrl || '',
          createdAt: serverTimestamp(),
        }, { merge: true })
      }
      toast.success('Lectures synced to Firestore!', { id: tid })
    } catch (err) {
      toast.error('Sync failed: ' + err.message, { id: tid })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Breadcrumbs ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/subjects" className="hover:text-primary-600 transition-colors">
          Subjects
        </Link>
        <span>/</span>
        <Link to={`/subjects/${subjectId}`} className="hover:text-primary-600 transition-colors truncate max-w-[150px]">
          {subjectMeta?.name || subjectId}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
          {staticUnit?.name || unitId}
        </span>
      </motion.div>

      {/* ── Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0   }}
        className="bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
              {subjectMeta?.name || 'Subject'}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
              {staticUnit?.name || 'Unit Lectures'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {unitCompletedCount} of {lectures.length} lectures completed ({progressPercent}%)
            </p>
          </div>

          {isDefault && (
            <button
              onClick={handleSyncLectures}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 hover:bg-primary-100 text-xs font-bold transition-all self-start md:self-auto"
            >
              <CloudUpload className="w-4 h-4" />
              {syncing ? 'Syncing…' : 'Push Lectures to Firestore'}
            </button>
          )}
        </div>

        {/* Unit Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Unit Completion</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Search Bar ── */}
      {!loading && lectures.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lecture topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      )}

      {/* ── Lectures List ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredLectures.length === 0 ? (
        <EmptyState
          icon={PlayCircle}
          title="No lectures found"
          description={search ? `No lectures match "${search}"` : "No lectures available for this unit."}
        />
      ) : (
        <div className="space-y-3">
          {filteredLectures.map((lecture, index) => {
            const completed = isCompleted(lecture.id)

            return (
              <motion.div
                key={lecture.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: index * 0.04 }}
                className={`group flex items-center justify-between gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                  completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                    : 'bg-white dark:bg-card-dark border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-card-hover'
                }`}
              >
                {/* Left: Checkbox + Lecture Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(lecture.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      completed
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-primary-500'
                    }`}
                    title={completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Lecture {lecture.order || index + 1}
                      </span>
                      {completed && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.2 rounded-full">
                          Done
                        </span>
                      )}
                    </div>
                    <p className={`text-sm md:text-base font-semibold truncate ${
                      completed
                        ? 'text-slate-500 line-through dark:text-slate-400'
                        : 'text-slate-800 dark:text-white'
                    }`}>
                      {lecture.title}
                    </p>
                  </div>
                </div>

                {/* Right: Watch Video CTA */}
                <button
                  onClick={() => handleOpenVideo(lecture)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-600 hover:text-white text-primary-600 dark:text-primary-400 transition-all flex-shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Watch Video</span>
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Video Player Modal ── */}
      <VideoModal
        lecture={selectedLecture}
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        isCompleted={selectedLecture ? isCompleted(selectedLecture.id) : false}
        onToggleComplete={handleToggleComplete}
      />

    </div>
  )
}

export default Lectures
