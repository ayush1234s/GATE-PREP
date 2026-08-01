// src/pages/Subjects.jsx
// Dynamic Subjects page — displays all 10 GATE ECE subjects (General Aptitude, Engineering Mathematics,
// Networks, Signals & Systems, Electronic Devices, Analog Circuits, Digital Circuits, Control Systems,
// Communications, Electromagnetics).
// Live syncs with Firestore, with real-time subject progress tracking per card!

import { useState, useMemo }  from 'react'
import { motion }             from 'framer-motion'
import { Search, BookOpen, RefreshCw, LayoutGrid, List, Filter, CloudUpload, CheckCircle2 } from 'lucide-react'
import toast                  from 'react-hot-toast'
import useSubjects            from '@/hooks/useSubjects'
import useUserProgress        from '@/hooks/useUserProgress'
import SubjectCard            from '@/components/subjects/SubjectCard'
import { SubjectCardSkeleton } from '@/components/common/SkeletonLoader'
import EmptyState             from '@/components/common/EmptyState'
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
  const { subjects, loading, error, isDefault, seedAllSubjects } = useSubjects()
  const { completedIds }                                         = useUserProgress()
  const [search, setSearch]                                      = useState('')
  const [view,   setView]                                        = useState('grid')
  const [seeding, setSeeding]                                    = useState(false)

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
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0   }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            GATE ECE Subjects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading
              ? 'Loading subjects…'
              : `${subjects.length} GATE ECE subjects loaded`
            }
          </p>
        </div>

        {/* Live / Sync Status Indicator */}
        {!loading && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <CloudUpload className="w-4 h-4" />
              {seeding ? 'Syncing to Firestore…' : 'Push All Subjects & Lectures to Firestore'}
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Search + view toggle ── */}
      {!loading && subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="subject-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search General Aptitude, Mathematics, Networks..."
              className="
                w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                bg-white dark:bg-card-dark
                border border-slate-200 dark:border-slate-700
                text-slate-800 dark:text-slate-100 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                transition-colors
              "
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
              >
                clear
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <SubjectsSkeleton />
      ) : filtered.length === 0 ? (
        /* Search returned nothing */
        <div className="flex flex-col items-center py-16 text-center">
          <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">
            No subjects match "{search}"
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-sm text-primary-600 hover:underline"
          >
            Clear search
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
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                  {subject.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{subject.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{subject.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{subject.unitCount ?? 0} units</span>
                    <span>·</span>
                    <span>{subject.lectureCount ?? 0} lectures</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-slate-400">Progress</p>
                    <p className="text-sm font-bold text-primary-600">
                      {completedCount} / {subject.lectureCount} ({pct}%)
                    </p>
                  </div>
                  <a
                    href={`/subjects/${subject.id}`}
                    className="px-3.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-xs font-semibold hover:bg-primary-100 transition-colors"
                  >
                    Open →
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
