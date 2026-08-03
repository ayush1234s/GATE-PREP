// src/pages/Subjects.jsx
// Dynamic Subjects page — displays all 10 GATE ECE subjects (General Aptitude, Engineering Mathematics,
// Networks, Signals & Systems, Electronic Devices, Analog Circuits, Digital Circuits, Control Systems,
// Communications, Electromagnetics).
// Live syncs with Firestore, with real-time subject progress tracking per card!

import { useState, useMemo }  from 'react'
import { motion }             from 'framer-motion'
import { Search, BookOpen, LayoutGrid, List, Filter, CloudUpload, Sparkles, Layers, GraduationCap } from 'lucide-react'
import toast                  from 'react-hot-toast'
import useSubjects            from '@/hooks/useSubjects'
import useUserProgress        from '@/hooks/useUserProgress'
import SubjectCard            from '@/components/subjects/SubjectCard'
import { SubjectCardSkeleton } from '@/components/common/SkeletonLoader'
import { CURRICULUM_DATA }   from '@/data/curriculumData'

// ─── Skeleton grid ─────────────────────────────────────────────────────────────
const SubjectsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ delay: i * 0.05 }}
      >
        <SubjectCardSkeleton />
      </motion.div>
    ))}
  </div>
)

// ─── Main page ─────────────────────────────────────────────────────────────────
const Subjects = () => {
  const { subjects, loading }  = useSubjects()
  const { completedIds }       = useUserProgress()
  const [search, setSearch]   = useState('')
  const [view,   setView]     = useState('grid')
  const [seeding, setSeeding] = useState(false)

  // Calculate completed lectures for a given subject ID
  const getCompletedForSubject = (subjectId) => {
    const subjectData = CURRICULUM_DATA[subjectId]
    if (!subjectData || !subjectData.units) return 0
    let count = 0
    subjectData.units.forEach(unit => {
      unit.lectures?.forEach(lec => {
        if (completedIds.has(lec.id)) {
          count++
        }
      })
    })
    return count
  }

  // Calculate totals
  let totalUnits = 0
  let totalLectures = 0
  Object.values(CURRICULUM_DATA).forEach(s => {
    totalUnits += (s.units || []).length
    s.units?.forEach(u => totalLectures += (u.lectures || []).length)
  })

  // Filter subjects by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return subjects
    const q = search.toLowerCase()
    return subjects.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    )
  }, [subjects, search])

  const handleSeed = async () => {
    setSeeding(true)
    const tid = toast.loading('Syncing all 10 subjects, 49 units & 150+ lectures to Firestore...')
    try {
      const { seedFullCurriculum } = await import('@/firebase/firestore')
      await seedFullCurriculum(CURRICULUM_DATA)
      toast.success('All 10 Subjects, Units & Lectures synced to Firestore!', { id: tid })
    } catch (err) {
      toast.error('Failed to sync: ' + err.message, { id: tid })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ── 1. Glassmorphic Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Glow ambient shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"
          />
        </div>

        <div className="relative space-y-2 z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Complete GATE ECE Curriculum</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            GATE ECE Core Subjects
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Master 10 core subjects covering General Aptitude, Engineering Mathematics, Networks, Signals, Analog, Digital & Electromagnetics.
          </p>

          {/* Quick Header Stats */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl backdrop-blur border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> {subjects.length} Subjects
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl backdrop-blur border border-white/10">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> {totalUnits} Units
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl backdrop-blur border border-white/10">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> {totalLectures} Lectures
            </span>
          </div>
        </div>

        {/* Sync Button */}
        {!loading && (
          <div className="relative z-10 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/40 disabled:opacity-60"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{seeding ? 'Syncing to Firestore…' : 'Sync Full Curriculum'}</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* ── 2. Search & View Toggle ── */}
      {!loading && subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="subject-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search General Aptitude, Mathematics, Networks..."
              className="
                w-full pl-10 pr-10 py-3 rounded-2xl text-sm
                bg-white dark:bg-card-dark
                border border-slate-200 dark:border-slate-800
                text-slate-800 dark:text-slate-100 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                transition-colors shadow-xs
              "
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-xs">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 rounded-xl transition-all ${view === 'grid' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── 3. Content Grid / List ── */}
      {loading ? (
        <SubjectsSkeleton />
      ) : filtered.length === 0 ? (
        /* Search returned nothing */
        <div className="flex flex-col items-center py-16 text-center bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No subjects match "{search}"
          </p>
          <p className="text-xs text-slate-400 mt-1">Try searching for another topic like Signals, Analog, or Aptitude.</p>
          <button
            onClick={() => setSearch('')}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold shadow-md"
          >
            Reset Search
          </button>
        </div>
      ) : (
        /* Subject grid / list */
        <motion.div
          layout
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'flex flex-col gap-4'
          }
        >
          {filtered.map((subject, i) => {
            const completedCount = getCompletedForSubject(subject.id)
            const pct = subject.lectureCount > 0 ? Math.round((completedCount / subject.lectureCount) * 100) : 0

            return view === 'grid' ? (
              <SubjectCard
                key={subject.id}
                {...subject}
                completed={completedCount}
                index={i}
              />
            ) : (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-4 p-4 bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                  {subject.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-800 dark:text-white text-base">{subject.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{subject.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span>{subject.unitCount ?? 0} units</span>
                    <span>·</span>
                    <span>{subject.lectureCount ?? 0} lectures</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-slate-400 font-semibold">Syllabus Progress</p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 font-mono">
                      {completedCount} / {subject.lectureCount} ({pct}%)
                    </p>
                  </div>
                  <a
                    href={`/subjects/${subject.id}`}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-extrabold hover:bg-primary-700 transition-colors shadow-md"
                  >
                    Open Subject →
                  </a>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export default Subjects
