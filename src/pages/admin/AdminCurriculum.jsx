// src/pages/admin/AdminCurriculum.jsx
// Ultra-Pro Admin Curriculum & YouTube Video Manager — Add/Edit/Delete Subjects, Units, and Lectures.
// Features Grid vs. List View Mode Toggle (Default: Grid View), video link status badges,
// pre-populated GATE ECE curriculum, instant Firestore updates, and live client player sync.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Edit2, Trash2, Video, Layers,
  ChevronDown, ChevronRight, Save, X, ExternalLink,
  Sparkles, CheckCircle2, PlayCircle, RefreshCw, AlertCircle,
  Link2, Film, Check, LayoutGrid, List
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  subscribeToSubjects, getUnits, getLectures,
  createSubject, updateSubject, deleteSubject,
  createUnit, updateUnit, deleteUnit,
  createLecture, updateLecture, deleteLecture
} from '@/firebase/firestore'
import { CURRICULUM_DATA } from '@/data/curriculumData'

export default function AdminCurriculum() {
  const [subjects, setSubjects]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeSubjectId, setActiveSubjectId] = useState(null)
  const [expandedUnit, setExpandedUnit]   = useState(null)
  const [unitsMap, setUnitsMap]           = useState({})     // { [subjectId]: unitsList }
  const [lecturesMap, setLecturesMap]     = useState({})  // { [`${subjectId}_${unitId}`]: lecturesList }
  const [viewMode, setViewMode]           = useState('grid') // 'grid' | 'list' (default: grid)

  // Modal States
  const [subjectModal, setSubjectModal]   = useState({ isOpen: false, data: null })
  const [unitModal, setUnitModal]         = useState({ isOpen: false, subjectId: null, data: null })
  const [lectureModal, setLectureModal]   = useState({ isOpen: false, subjectId: null, unitId: null, data: null })

  // Subscribe to Subjects from Firestore
  useEffect(() => {
    setLoading(true)
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
        setLoading(false)
      },
      (err) => {
        console.warn('Admin subjects subscribe notice:', err)
        const fallback = Object.values(CURRICULUM_DATA)
        setSubjects(fallback)
        if (!activeSubjectId && fallback.length > 0) {
          setActiveSubjectId(fallback[0].id)
        }
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

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

  const refreshLectures = async (subId, unitId) => {
    await loadLecturesForUnit(subId, unitId)
  }

  const refreshUnits = async (subId) => {
    await loadUnitsForSubject(subId)
  }

  // ── Subject Save / Delete ──
  const handleSaveSubject = async (e) => {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    const icon = form.icon.value.trim()
    const color = form.color.value.trim()
    const order = form.order.value

    const tid = toast.loading('Saving subject to Firestore...')
    try {
      if (subjectModal.data) {
        await updateSubject(subjectModal.data.id, { name, icon, color, order })
      } else {
        const newId = await createSubject({ name, icon, color, order })
        setActiveSubjectId(newId)
      }
      toast.success('Subject saved successfully!', { id: tid })
      setSubjectModal({ isOpen: false, data: null })
    } catch (err) {
      toast.error('Failed to save subject: ' + err.message, { id: tid })
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject?')) return
    const tid = toast.loading('Deleting subject...')
    try {
      await deleteSubject(subjectId)
      toast.success('Subject deleted!', { id: tid })
    } catch (err) {
      toast.error('Failed to delete subject: ' + err.message, { id: tid })
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
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
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

          <button
            onClick={() => setSubjectModal({ isOpen: true, data: null })}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Horizontal Subject Selection Tabs */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
          <p className="text-xs font-semibold">Loading GATE curriculum from Firestore…</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Subject Tab Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subjects.map(sub => {
              const isActive = sub.id === activeSubjectId
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubjectId(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex-shrink-0 border ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{sub.icon || '📚'}</span>
                  <span>{sub.name}</span>
                </button>
              )
            })}
          </div>

          {/* Active Subject Details & Units list */}
          {activeSubject && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">

              {/* Subject Banner Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                    {activeSubject.icon || '📚'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{activeSubject.name}</h2>
                    <p className="text-xs text-slate-400">
                      {currentUnits.length} Units • {viewMode === 'grid' ? 'Grid Display' : 'List Display'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUnitModal({ isOpen: true, subjectId: activeSubject.id, data: null })}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Unit</span>
                  </button>

                  <button
                    onClick={() => setSubjectModal({ isOpen: true, data: activeSubject })}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Subject Name/Icon"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteSubject(activeSubject.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Units Container (Grid vs List Layout) */}
              {currentUnits.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No units found for this subject.</p>
                  <button
                    onClick={() => setUnitModal({ isOpen: true, subjectId: activeSubject.id, data: null })}
                    className="text-xs font-bold text-purple-400 hover:underline"
                  >
                    + Create First Unit
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {currentUnits.map((unit) => {
                    const unitKey = `${activeSubject.id}_${unit.id}`
                    const isUnitExpanded = expandedUnit === unitKey
                    const lecturesList = lecturesMap[unitKey] || []

                    return (
                      <div key={unit.id} className="bg-slate-950/70 border border-slate-800/90 rounded-2xl overflow-hidden shadow-md flex flex-col">

                        {/* Unit Header Row */}
                        <div className="p-4 flex items-center justify-between gap-3 bg-slate-900/60">
                          <button
                            onClick={() => {
                              if (expandedUnit === unitKey) setExpandedUnit(null)
                              else {
                                setExpandedUnit(unitKey)
                                refreshLectures(activeSubject.id, unit.id)
                              }
                            }}
                            className="flex items-center gap-3 flex-1 text-left min-w-0"
                          >
                            <Layers className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm text-white truncate">{unit.name}</h3>
                              <p className="text-[11px] text-slate-400">{lecturesList.length} Lectures</p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setLectureModal({ isOpen: true, subjectId: activeSubject.id, unitId: unit.id, data: null })}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-xs font-bold border border-blue-800/60 flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Add Lecture</span>
                            </button>

                            <button
                              onClick={() => setUnitModal({ isOpen: true, subjectId: activeSubject.id, data: unit })}
                              className="p-1.5 text-slate-400 hover:text-white"
                              title="Edit Unit Title"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUnit(activeSubject.id, unit.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400"
                              title="Delete Unit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (expandedUnit === unitKey) setExpandedUnit(null)
                                else {
                                  setExpandedUnit(unitKey)
                                  refreshLectures(activeSubject.id, unit.id)
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              {isUnitExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Lectures Sub-List */}
                        {isUnitExpanded && (
                          <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-2.5 flex-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              <span>Lectures & YouTube Status</span>
                              <span>{lecturesList.length} Lectures</span>
                            </div>

                            {lecturesList.length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-2">No lectures created in this unit yet.</p>
                            ) : (
                              lecturesList.map((lec) => {
                                const hasUrl = !!lec.youtubeUrl && lec.youtubeUrl.trim() !== ''

                                return (
                                  <div
                                    key={lec.id}
                                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between gap-2.5 text-xs"
                                  >
                                    <div className="flex items-start gap-3 min-w-0">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        hasUrl ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                                      }`}>
                                        {hasUrl ? <PlayCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white text-xs truncate">{lec.title}</p>

                                        {/* Status & YouTube URL display */}
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                          {hasUrl ? (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                                              <Check className="w-2.5 h-2.5" /> Connected
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-950 text-amber-400 border border-amber-800/50 flex items-center gap-1">
                                              <AlertCircle className="w-2.5 h-2.5" /> Missing URL
                                            </span>
                                          )}

                                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                                            {lec.youtubeUrl || 'No Link'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/50">
                                      <button
                                        onClick={() => setLectureModal({ isOpen: true, subjectId: activeSubject.id, unitId: unit.id, data: lec })}
                                        className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-[11px] font-bold border border-purple-800/60 flex items-center gap-1 transition-all"
                                      >
                                        <Video className="w-3 h-3 text-red-500" />
                                        <span>{hasUrl ? 'Edit Video Link' : 'Add Link'}</span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteLecture(activeSubject.id, unit.id, lec.id)}
                                        className="p-1 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                        title="Delete Lecture"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── SUBJECT MODAL ── */}
      <AnimatePresence>
        {subjectModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">{subjectModal.data ? 'Edit Subject' : 'Add New Subject'}</h3>
                <button onClick={() => setSubjectModal({ isOpen: false, data: null })} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Subject Name</label>
                  <input name="name" defaultValue={subjectModal.data?.name || ''} required className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" placeholder="e.g. Engineering Mathematics" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Subject Icon (Emoji)</label>
                  <input name="icon" defaultValue={subjectModal.data?.icon || '📚'} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" placeholder="📐" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gradient / Color Class</label>
                  <input name="color" defaultValue={subjectModal.data?.color || 'from-indigo-500 to-purple-600'} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Display Order</label>
                  <input name="order" type="number" defaultValue={subjectModal.data?.order || 1} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setSubjectModal({ isOpen: false, data: null })} className="px-3 py-1.5 rounded-xl text-slate-400 hover:bg-slate-800">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-md">Save Subject</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── UNIT MODAL ── */}
      <AnimatePresence>
        {unitModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">{unitModal.data ? 'Edit Unit' : 'Add New Unit'}</h3>
                <button onClick={() => setUnitModal({ isOpen: false, subjectId: null, data: null })} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveUnit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Title</label>
                  <input name="name" defaultValue={unitModal.data?.name || ''} required className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" placeholder="e.g. Unit 1: Linear Algebra" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Display Order</label>
                  <input name="order" type="number" defaultValue={unitModal.data?.order || 1} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setUnitModal({ isOpen: false, subjectId: null, data: null })} className="px-3 py-1.5 rounded-xl text-slate-400 hover:bg-slate-800">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md">Save Unit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LECTURE & YOUTUBE LINK MODAL ── */}
      <AnimatePresence>
        {lectureModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-left space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">{lectureModal.data ? 'Edit Lecture & YouTube Video Link' : 'Add New Lecture'}</h3>
                  <p className="text-[11px] text-emerald-400">YouTube URLs sync live to student video player modal</p>
                </div>
                <button onClick={() => setLectureModal({ isOpen: false, subjectId: null, unitId: null, data: null })} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveLecture} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Lecture Title</label>
                  <input name="title" defaultValue={lectureModal.data?.title || ''} required className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" placeholder="e.g. Matrices & Eigenvalues" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">YouTube Video Link (URL)</label>
                  <div className="relative">
                    <input name="youtubeUrl" defaultValue={lectureModal.data?.youtubeUrl || ''} className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-purple-500" placeholder="https://www.youtube.com/watch?v=..." />
                    <Video className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Paste any standard YouTube video or Short link (e.g. https://www.youtube.com/watch?v=...).</p>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Order Index</label>
                  <input name="order" type="number" defaultValue={lectureModal.data?.order || 1} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setLectureModal({ isOpen: false, subjectId: null, unitId: null, data: null })} className="px-3 py-1.5 rounded-xl text-slate-400 hover:bg-slate-800">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-md">Save & Sync Live</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
