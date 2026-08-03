// src/pages/admin/AdminCurriculum.jsx
// Ultra-Pro Admin Curriculum & YouTube Video Manager — Add/Edit/Delete Subjects, Units, and Lectures.
// Features Grid vs. List View Mode Toggle (Default: Grid View), video link status badges,
// pre-populated GATE ECE curriculum, instant Firestore updates, and live client player sync.
// Animated with Framer Motion staggered reveals and micro-hover cards.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Edit2, Trash2, Video, Layers,
  X, CheckCircle2, PlayCircle, AlertCircle,
  LayoutGrid, List
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  subscribeToSubjects, getUnits, getLectures,
  createSubject, updateSubject,
  createUnit, updateUnit, deleteUnit,
  createLecture, updateLecture, deleteLecture
} from '@/firebase/firestore'
import { CURRICULUM_DATA } from '@/data/curriculumData'

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

export default function AdminCurriculum() {
  const [subjects, setSubjects]           = useState([])
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [unitsMap, setUnitsMap]           = useState({})     // { [subjectId]: unitsList }
  const [lecturesMap, setLecturesMap]     = useState({})  // { [`${subjectId}_${unitId}`]: lecturesList }
  const [viewMode, setViewMode]           = useState('grid') // 'grid' | 'list' (default: grid)

  // Modal States
  const [subjectModal, setSubjectModal]   = useState({ isOpen: false, data: null })
  const [unitModal, setUnitModal]         = useState({ isOpen: false, subjectId: null, data: null })
  const [lectureModal, setLectureModal]   = useState({ isOpen: false, subjectId: null, unitId: null, data: null })

  // Subscribe to Subjects from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToSubjects(
      (list) => {
        let finalSubjects = list
        if (!list || list.length === 0) {
          finalSubjects = Object.values(CURRICULUM_DATA)
        }
        setSubjects(finalSubjects)
        if (finalSubjects.length > 0 && !activeSubjectId) {
          setActiveSubjectId(finalSubjects[0].id)
        }
      },
      (err) => {
        console.warn('Admin subjects subscribe notice:', err)
        const fallback = Object.values(CURRICULUM_DATA)
        setSubjects(fallback)
        if (!activeSubjectId && fallback.length > 0) {
          setActiveSubjectId(fallback[0].id)
        }
      }
    )
    return unsubscribe
  }, [activeSubjectId])

  // Auto-load Units & Lectures when active Subject changes
  useEffect(() => {
    if (!activeSubjectId) return
    loadUnitsForSubject(activeSubjectId)
  }, [activeSubjectId])

  const loadUnitsForSubject = async (subId) => {
    try {
      let uList = await getUnits(subId)
      if (uList.length === 0 && CURRICULUM_DATA[subId]) {
        uList = CURRICULUM_DATA[subId].units || []
      }
      setUnitsMap(prev => ({ ...prev, [subId]: uList }))

      // Automatically load lectures for each unit
      for (const unit of uList) {
        loadLecturesForUnit(subId, unit.id)
      }
    } catch (err) {
      console.warn('Units load notice:', err)
    }
  }

  const loadLecturesForUnit = async (subId, unitId) => {
    const key = `${subId}_${unitId}`
    try {
      let lList = await getLectures(subId, unitId)
      if (lList.length === 0 && CURRICULUM_DATA[subId]) {
        const uObj = (CURRICULUM_DATA[subId].units || []).find(u => u.id === unitId)
        if (uObj) lList = uObj.lectures || []
      }
      setLecturesMap(prev => ({ ...prev, [key]: lList }))
    } catch (err) {
      console.warn('Lectures load notice:', err)
    }
  }

  const refreshUnits = async (subId) => {
    await loadUnitsForSubject(subId)
  }

  const refreshLectures = async (subId, unitId) => {
    await loadLecturesForUnit(subId, unitId)
  }

  // ── Subject Save ──
  const handleSaveSubject = async (e) => {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    const description = form.description.value.trim()
    const icon = form.icon.value.trim() || '📚'
    const color = form.color.value

    const tid = toast.loading('Saving subject to Firestore...')
    try {
      if (subjectModal.data) {
        await updateSubject(subjectModal.data.id, { name, description, icon, color })
      } else {
        await createSubject({ name, description, icon, color })
      }
      toast.success('Subject saved successfully!', { id: tid })
      setSubjectModal({ isOpen: false, data: null })
    } catch (err) {
      toast.error('Failed to save subject: ' + err.message, { id: tid })
    }
  }

  // ── Unit Save / Delete ──
  const handleSaveUnit = async (e) => {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    const order = form.order.value
    const { subjectId, data } = unitModal

    const tid = toast.loading('Saving unit to Firestore...')
    try {
      if (data) {
        await updateUnit(subjectId, data.id, { name, order })
      } else {
        await createUnit(subjectId, { name, order })
      }
      toast.success('Unit saved successfully!', { id: tid })
      await refreshUnits(subjectId)
      setUnitModal({ isOpen: false, subjectId: null, data: null })
    } catch (err) {
      toast.error('Failed to save unit: ' + err.message, { id: tid })
    }
  }

  const handleDeleteUnit = async (subjectId, unitId) => {
    if (!confirm('Delete this unit?')) return
    const tid = toast.loading('Deleting unit...')
    try {
      await deleteUnit(subjectId, unitId)
      toast.success('Unit deleted!', { id: tid })
      await refreshUnits(subjectId)
    } catch (err) {
      toast.error('Failed to delete unit: ' + err.message, { id: tid })
    }
  }

  // ── Lecture Save / Delete ──
  const handleSaveLecture = async (e) => {
    e.preventDefault()
    const form = e.target
    const title = form.title.value.trim()
    const youtubeUrl = form.youtubeUrl.value.trim()
    const order = form.order.value
    const { subjectId, unitId, data } = lectureModal

    const tid = toast.loading('Saving lecture & YouTube video link...')
    try {
      if (data) {
        await updateLecture(subjectId, unitId, data.id, { title, youtubeUrl, order })
      } else {
        await createLecture(subjectId, unitId, { title, youtubeUrl, order })
      }
      toast.success('Lecture & YouTube URL saved! Live on client side 🎉', { id: tid })
      await refreshLectures(subjectId, unitId)
      setLectureModal({ isOpen: false, subjectId: null, unitId: null, data: null })
    } catch (err) {
      toast.error('Failed to save lecture: ' + err.message, { id: tid })
    }
  }

  const handleDeleteLecture = async (subjectId, unitId, lectureId) => {
    if (!confirm('Delete this lecture?')) return
    const tid = toast.loading('Deleting lecture...')
    try {
      await deleteLecture(subjectId, unitId, lectureId)
      toast.success('Lecture deleted!', { id: tid })
      await refreshLectures(subjectId, unitId)
    } catch (err) {
      toast.error('Failed to delete lecture: ' + err.message, { id: tid })
    }
  }

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0]
  const currentUnits = activeSubjectId ? (unitsMap[activeSubjectId] || []) : []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >

      {/* Header Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Curriculum & YouTube Video Link Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a subject to view units & lectures. Add missing lectures, paste YouTube links (`youtubeUrl`), and save to sync live to student client app.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Grid vs List View Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View (Default)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSubjectModal({ isOpen: true, data: null })}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Subject Selector Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubjectId(sub.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border flex-shrink-0 ${
              activeSubjectId === sub.id
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-sm">{sub.icon || '📚'}</span>
            <span>{sub.name}</span>
          </button>
        ))}
      </motion.div>

      {/* Main Active Subject Overview */}
      {activeSubject && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-white text-3xl flex items-center justify-center flex-shrink-0 shadow-inner">
                {activeSubject.icon || '📚'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{activeSubject.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/50">
                    {currentUnits.length} Units
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{activeSubject.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setSubjectModal({ isOpen: true, data: activeSubject })}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Subject</span>
              </button>

              <button
                onClick={() => setUnitModal({ isOpen: true, subjectId: activeSubject.id, data: null })}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Unit</span>
              </button>
            </div>
          </div>

          {/* Units Accordion / Cards (GRID or LIST mode) */}
          {currentUnits.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No units added yet for {activeSubject.name}</p>
              <button
                onClick={() => setUnitModal({ isOpen: true, subjectId: activeSubject.id, data: null })}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Unit</span>
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-5'
                : 'space-y-4'
            }>
              {currentUnits.map((unit) => {
                const key = `${activeSubject.id}_${unit.id}`
                const lectures = lecturesMap[key] || []

                return (
                  <motion.div
                    key={unit.id}
                    whileHover={{ y: -2 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
                  >
                    {/* Unit Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-800">
                          U{unit.order || 1}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-white">{unit.name}</h3>
                          <p className="text-[10px] text-slate-400">{lectures.length} Video Lectures</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setLectureModal({ isOpen: true, subjectId: activeSubject.id, unitId: unit.id, data: null })}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors"
                          title="Add Lecture"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUnitModal({ isOpen: true, subjectId: activeSubject.id, data: unit })}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(activeSubject.id, unit.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-white transition-colors"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lectures List */}
                    <div className="space-y-2.5">
                      {lectures.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center italic">No lectures in this unit yet.</p>
                      ) : (
                        lectures.map((lec) => (
                          <div
                            key={lec.id}
                            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-900/40">
                                <PlayCircle className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate leading-snug">{lec.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {lec.youtubeUrl ? (
                                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> YouTube Linked
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-amber-400" /> Default Video
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setLectureModal({ isOpen: true, subjectId: activeSubject.id, unitId: unit.id, data: lec })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Edit Lecture & Video URL"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLecture(activeSubject.id, unit.id, lec.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                title="Delete Lecture"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Subject Modal ── */}
      <AnimatePresence>
        {subjectModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-purple-900/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-600" />
              <button onClick={() => setSubjectModal({ isOpen: false, data: null })} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-base text-white mb-4">
                {subjectModal.data ? 'Edit Subject' : 'Add New Subject'}
              </h3>

              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject Name</label>
                  <input name="name" defaultValue={subjectModal.data?.name || ''} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={subjectModal.data?.description || ''} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Icon Emoji</label>
                    <input name="icon" defaultValue={subjectModal.data?.icon || '📚'} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Color Theme</label>
                    <select name="color" defaultValue={subjectModal.data?.color || 'indigo'} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white">
                      <option value="indigo">Indigo</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="amber">Amber</option>
                      <option value="purple">Purple</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setSubjectModal({ isOpen: false, data: null })} className="px-4 py-2 rounded-xl text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">Save Subject</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Unit Modal ── */}
      <AnimatePresence>
        {unitModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-blue-900/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
              <button onClick={() => setUnitModal({ isOpen: false, subjectId: null, data: null })} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-base text-white mb-4">
                {unitModal.data ? 'Edit Unit' : 'Add New Unit'}
              </h3>

              <form onSubmit={handleSaveUnit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Title</label>
                  <input name="name" defaultValue={unitModal.data?.name || ''} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Number</label>
                  <input name="order" type="number" defaultValue={unitModal.data?.order || 1} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setUnitModal({ isOpen: false, subjectId: null, data: null })} className="px-4 py-2 rounded-xl text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Save Unit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Lecture Modal (YouTube URL Editor) ── */}
      <AnimatePresence>
        {lectureModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-purple-900/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600" />
              <button onClick={() => setLectureModal({ isOpen: false, subjectId: null, unitId: null, data: null })} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-base text-white mb-4">
                {lectureModal.data ? 'Edit Lecture & YouTube Video Link' : 'Add New Lecture'}
              </h3>

              <form onSubmit={handleSaveLecture} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lecture Title</label>
                  <input name="title" defaultValue={lectureModal.data?.title || ''} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-red-500" /> YouTube Video URL / Video ID
                  </label>
                  <input
                    name="youtubeUrl"
                    defaultValue={lectureModal.data?.youtubeUrl || ''}
                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID or VIDEO_ID"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white font-mono text-purple-300"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    💡 Paste full YouTube video URL or ID. This video will play live when students click "Watch Video".
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Number</label>
                  <input name="order" type="number" defaultValue={lectureModal.data?.order || 1} className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white" />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setLectureModal({ isOpen: false, subjectId: null, unitId: null, data: null })} className="px-4 py-2 rounded-xl text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">Save Lecture</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
