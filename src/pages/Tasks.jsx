// src/pages/Tasks.jsx
// Premium Tasks & Progress Tracking Page — Full overview of all lectures across the syllabus.
// Filter by All / Completed / Pending, quick subject pill selector, search by topic name,
// instant completion toggling, embedded VideoModal player, and responsive card layouts.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Clock, PlayCircle, Search,
  Check, BookOpen, Filter, Sparkles, X, RotateCcw,
  GraduationCap, Award, ChevronRight, ArrowUpDown
} from 'lucide-react'
import toast                 from 'react-hot-toast'
import useUserProgress       from '@/hooks/useUserProgress'
import { useAuth }           from '@/contexts/AuthContext'
import { CURRICULUM_DATA }   from '@/data/curriculumData'
import VideoModal            from '@/components/lectures/VideoModal'
import EmptyState            from '@/components/common/EmptyState'
import { markLectureCompleted, unmarkLectureCompleted } from '@/firebase/firestore'

// Extract flat lectures list with subject and unit details
const getAllSyllabusLectures = () => {
  const list = []
  Object.values(CURRICULUM_DATA).forEach(subject => {
    (subject.units || []).forEach(unit => {
      (unit.lectures || []).forEach(lec => {
        list.push({
          ...lec,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          subjectColor: subject.color,
          unitId: unit.id,
          unitName: unit.name,
        })
      })
    })
  })
  return list
}

const ALL_LECTURES = getAllSyllabusLectures()

const Tasks = () => {
  const { uid, currentUser, userProfile, refreshProfile } = useAuth()
  const { completedIds, isCompleted }                    = useUserProgress()

  const [filterTab, setFilterTab]             = useState('all')     // 'all' | 'completed' | 'pending'
  const [selectedSubject, setSelectedSubject] = useState('all')     // 'all' or subjectId
  const [search, setSearch]                   = useState('')
  const [selectedLecture, setSelectedLecture] = useState(null)
  const [isVideoOpen, setIsVideoOpen]         = useState(false)
  const [sortBy, setSortBy]                   = useState('default') // 'default' | 'title'

  // Filter & sort lectures
  const filteredLectures = useMemo(() => {
    let list = ALL_LECTURES.filter(lec => {
      const done = isCompleted(lec.id)

      // Tab filter
      if (filterTab === 'completed' && !done) return false
      if (filterTab === 'pending' && done) return false

      // Subject filter
      if (selectedSubject !== 'all' && lec.subjectId !== selectedSubject) return false

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle   = lec.title?.toLowerCase().includes(q)
        const matchSubject = lec.subjectName?.toLowerCase().includes(q)
        const matchUnit    = lec.unitName?.toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchUnit) return false
      }

      return true
    })

    if (sortBy === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    }

    return list
  }, [filterTab, selectedSubject, search, sortBy, completedIds])

  // Stats
  const totalCount     = ALL_LECTURES.length
  const completedCount = useMemo(() => ALL_LECTURES.filter(l => isCompleted(l.id)).length, [completedIds])
  const pendingCount   = totalCount - completedCount
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Handle completion toggle
  const handleToggleComplete = async (lectureId) => {
    const userId = uid || currentUser?.uid || userProfile?.id
    if (!userId) {
      toast.error('Please log in to track progress.')
      return
    }

    const currentlyDone = isCompleted(lectureId)

    try {
      if (currentlyDone) {
        await unmarkLectureCompleted(userId, lectureId, totalCount)
        toast.success('Marked as pending')
      } else {
        const targetLec = ALL_LECTURES.find(l => l.id === lectureId)
        await markLectureCompleted(userId, lectureId, totalCount, {
          subjectName: targetLec?.subjectName || 'GATE Subject',
          subjectIcon: targetLec?.subjectIcon || '📚',
          unitName: targetLec?.unitName || 'Unit',
          lectureTitle: targetLec?.title || 'Lecture',
        })
        toast.success('Lecture completed! 🎉')
      }
      if (refreshProfile) refreshProfile()
    } catch (err) {
      toast.error('Failed to update progress: ' + err.message)
    }
  }

  const handleOpenVideo = (lec) => {
    setSelectedLecture(lec)
    setIsVideoOpen(true)
  }

  const clearFilters = () => {
    setFilterTab('all')
    setSelectedSubject('all')
    setSearch('')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-1 sm:px-0">

      {/* ── 1. Hero Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0   }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-purple-800 p-6 md:p-8 text-white shadow-xl"
      >
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-bold text-white">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              GATE ECE Syllabus Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Study Tasks & Lecture Tracker
            </h1>
            <p className="text-xs sm:text-sm text-primary-200 max-w-lg leading-relaxed">
              Check off lectures as you study, track subject completion, and watch YouTube tutorials directly.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur border border-white/20 p-4 rounded-2xl flex-shrink-0">
            <div className="text-center px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-200">Completed</p>
              <p className="text-2xl font-black text-emerald-300">{completedCount}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-200">Pending</p>
              <p className="text-2xl font-black text-amber-300">{pendingCount}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-200">Progress</p>
              <p className="text-2xl font-black text-white">{progressPct}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Subject Selector Chip Bar (Scrollable) ── */}
      <div className="space-y-2">
        <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Filter by Subject
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedSubject === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-card-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            📚 All Subjects (10)
          </button>
          {Object.values(CURRICULUM_DATA).map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                selectedSubject === s.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-card-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Status Filter Tabs & Search Controls ── */}
      <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-stretch lg:items-center bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm">

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all',       label: 'All Tasks',    count: totalCount,     icon: BookOpen     },
            { id: 'completed', label: 'Completed',    count: completedCount, icon: CheckCircle2 },
            { id: 'pending',   label: 'Pending',      count: pendingCount,   icon: Clock        },
          ].map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilterTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterTab === id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topic or unit..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(search || selectedSubject !== 'all' || filterTab !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 flex-shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Task List ── */}
      {filteredLectures.length === 0 ? (
        <EmptyState
          icon={filterTab === 'completed' ? CheckCircle2 : BookOpen}
          title={
            filterTab === 'completed'
              ? 'No completed lectures yet'
              : filterTab === 'pending'
              ? 'All lectures completed! 🎉'
              : 'No lectures match your filters'
          }
          description={
            filterTab === 'completed'
              ? 'Check off lectures as you complete them to track your GATE progress here.'
              : 'Try clearing your search or subject filter to see more lectures.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredLectures.map((lecture, index) => {
            const done = isCompleted(lecture.id)

            return (
              <motion.div
                key={lecture.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: Math.min(index * 0.015, 0.2) }}
                className={`group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                  done
                    ? 'bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200/80 dark:border-emerald-800/40'
                    : 'bg-white dark:bg-card-dark border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-card-hover'
                }`}
              >
                {/* Checkbox + Topic & Subject */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(lecture.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      done
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-primary-500'
                    }`}
                    title={done ? 'Mark pending' : 'Mark completed'}
                  >
                    {done && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[130px] sm:max-w-[180px]">
                        <span>{lecture.subjectIcon}</span>
                        <span className="truncate">{lecture.subjectName}</span>
                      </span>
                      <span className="font-medium text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">
                        {lecture.unitName}
                      </span>
                    </div>

                    <p className={`text-xs sm:text-sm font-bold leading-snug break-words ${
                      done ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-800 dark:text-white'
                    }`}>
                      {lecture.title}
                    </p>
                  </div>
                </div>

                {/* Right: Watch Video CTA */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenVideo(lecture)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-600 hover:text-white text-primary-600 dark:text-primary-400 transition-all shadow-xs"
                    title="Watch Video"
                  >
                    <PlayCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Watch Video</span>
                  </button>
                </div>
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

export default Tasks
