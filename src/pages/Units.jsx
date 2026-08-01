// src/pages/Units.jsx
// Units Page — Displays all units for a selected subject.
// Includes progress tracking, search filter, and real-time Firestore sync.

import { useState, useMemo } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { motion }           from 'framer-motion'
import {
  ArrowLeft, Layers, GraduationCap, Search,
  CheckCircle2, PlayCircle, CloudUpload, ArrowRight,
} from 'lucide-react'
import toast                 from 'react-hot-toast'
import useUnits              from '@/hooks/useUnits'
import useUserProgress       from '@/hooks/useUserProgress'
import { COLORS }            from '@/components/subjects/SubjectCard'
import SkeletonLoader, { SubjectCardSkeleton } from '@/components/common/SkeletonLoader'
import EmptyState            from '@/components/common/EmptyState'
import { seedDefaultSubjects } from '@/firebase/firestore'
import { CURRICULUM_DATA }   from '@/data/curriculumData'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db }                from '@/firebase/config'

// Helper to seed a subject with its units & lectures to Firestore
const seedSubjectToFirestore = async (subjectId) => {
  const data = CURRICULUM_DATA[subjectId]
  if (!data) return

  // 1. Write subject doc
  const subRef = doc(db, 'subjects', subjectId)
  await setDoc(subRef, {
    name: data.name,
    icon: data.icon,
    color: data.color,
    order: 1,
    createdAt: serverTimestamp(),
  }, { merge: true })

  // 2. Write units and lectures
  for (const unit of data.units || []) {
    const unitRef = doc(db, 'subjects', subjectId, 'units', unit.id)
    await setDoc(unitRef, {
      name: unit.name,
      order: unit.order,
      createdAt: serverTimestamp(),
    }, { merge: true })

    for (const lec of unit.lectures || []) {
      const lecRef = doc(db, 'subjects', subjectId, 'units', unit.id, 'lectures', lec.id)
      await setDoc(lecRef, {
        title: lec.title,
        order: lec.order,
        youtubeUrl: lec.youtubeUrl || '',
        createdAt: serverTimestamp(),
      }, { merge: true })
    }
  }
}

const Units = () => {
  const { subjectId }                = useParams()
  const { units, loading, isDefault, subjectMeta } = useUnits(subjectId)
  const { completedIds }             = useUserProgress()
  const [search, setSearch]          = useState('')
  const [syncing, setSyncing]        = useState(false)

  const theme = COLORS[subjectMeta.color] || COLORS.indigo

  // Calculate lecture counts
  const totalLectures = useMemo(() => {
    return units.reduce((sum, u) => sum + (u.lectureCount || 0), 0)
  }, [units])

  // Filtered units
  const filteredUnits = useMemo(() => {
    if (!search.trim()) return units
    const q = search.toLowerCase()
    return units.filter(u => u.name?.toLowerCase().includes(q))
  }, [units, search])

  const handleSyncToFirestore = async () => {
    setSyncing(true)
    const tid = toast.loading(`Syncing ${subjectMeta.name} curriculum to Firestore...`)
    try {
      await seedSubjectToFirestore(subjectId)
      toast.success(`${subjectMeta.name} curriculum synced to Firestore!`, { id: tid })
    } catch (err) {
      toast.error('Sync failed: ' + err.message, { id: tid })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Navigation breadcrumb ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link
          to="/subjects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Subjects
        </Link>
      </motion.div>

      {/* ── Subject Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0   }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} p-6 md:p-8 text-white shadow-lg`}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              {subjectMeta.icon || '📚'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-white/80 bg-white/15 px-2.5 py-0.5 rounded-full">
                  Subject Overview
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {subjectMeta.name}
              </h1>
              <p className="text-sm text-white/80 mt-1 max-w-xl">
                {units.length} Units · {totalLectures} Total Lectures
              </p>
            </div>
          </div>

          {/* Sync Button */}
          {isDefault && (
            <button
              onClick={handleSyncToFirestore}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold transition-all shadow-md self-start md:self-auto"
            >
              <CloudUpload className="w-4 h-4" />
              {syncing ? 'Syncing…' : 'Push Curriculum to Firestore'}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Search bar ── */}
      {!loading && units.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search units..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      )}

      {/* ── Units Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredUnits.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No units found"
          description={search ? `No units match "${search}"` : "No units found for this subject."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUnits.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="group bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-md">
                    Unit {unit.order || index + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {unit.lectureCount || 0} Lectures
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {unit.name}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <PlayCircle className="w-4 h-4 text-primary-500" />
                  <span>Lectures available</span>
                </div>

                <Link
                  to={`/subjects/${subjectId}/${unit.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors group/link"
                >
                  View Lectures
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Units
