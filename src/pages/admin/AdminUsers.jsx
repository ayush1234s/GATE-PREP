// src/pages/admin/AdminUsers.jsx
// Admin Users Control Module — List all Firestore users, toggle disabled access,
// delete accounts permanently, and manually create new student accounts with instant Firestore reflection.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, UserX, UserCheck, Trash2,
  AlertTriangle, X, CheckCircle2, Mail, Fingerprint,
  RefreshCw, ShieldAlert, Calendar, UserPlus, Lock, Key
} from 'lucide-react'
import toast from 'react-hot-toast'
import { subscribeToAllUsers, toggleUserDisabled, deleteUserPermanently } from '@/firebase/firestore'
import { adminCreateUser } from '@/firebase/auth'
import { formatDate } from '@/utils/helpers'

export default function AdminUsers() {
  const [users, setUsers]               = useState([])
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [deleteModalUser, setDeleteModalUser] = useState(null)
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [actionLoading, setActionLoading]     = useState(false)
  const [createLoading, setCreateLoading]     = useState(false)

  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToAllUsers(
      (list) => {
        setUsers(list)
        setLoading(false)
      },
      (err) => {
        console.error('Admin users listener error:', err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q)
    )
  })

  // Handle Toggle Disable
  const handleToggleDisable = async (user) => {
    const actionLabel = user.disabled ? 'Enabling' : 'Disabling'
    const tid = toast.loading(`${actionLabel} user account...`)
    try {
      await toggleUserDisabled(user.id, !!user.disabled)
      toast.success(`User account ${user.disabled ? 'enabled' : 'disabled'} successfully!`, { id: tid })
    } catch (err) {
      toast.error('Failed to update user status: ' + err.message, { id: tid })
    }
  }

  // Handle Delete Forever
  const handleDeleteForever = async () => {
    if (!deleteModalUser) return
    setActionLoading(true)
    const tid = toast.loading(`Deleting account for ${deleteModalUser.name} forever...`)
    try {
      await deleteUserPermanently(deleteModalUser.id)
      toast.success('User account permanently deleted from Firestore! 🗑️', { id: tid })
      setDeleteModalUser(null)
    } catch (err) {
      toast.error('Failed to delete user: ' + err.message, { id: tid })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Manual Student Account Creation
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault()
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast.error('Please fill in all fields (Name, Email, Password).')
      return
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    setCreateLoading(true)
    const tid = toast.loading(`Creating student account for ${newUser.name}...`)
    try {
      await adminCreateUser(newUser.name.trim(), newUser.email.trim(), newUser.password)
      toast.success(`Student account created! ${newUser.email} can now log in 🎉`, { id: tid, duration: 5000 })
      setNewUser({ name: '', email: '', password: '' })
      setAddUserModalOpen(false)
    } catch (err) {
      toast.error('Failed to create account: ' + (err.message || 'Unknown error'), { id: tid })
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header & Search Bar & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Users Management Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {users.length} total registered student accounts in Firestore database
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Add User Manual Button */}
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student User</span>
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-400" />
          <p className="text-xs font-semibold">Loading users from Firestore…</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No users found</p>
          <p className="text-xs text-slate-500">Try clearing your search query or add a new student account manually.</p>
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add First Student</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List View (< sm) */}
          <div className="block sm:hidden space-y-3">
            {filteredUsers.map((user) => {
              const joined = user.createdAt ? formatDate(user.createdAt) : '—'
              const isDisabled = !!user.disabled

              return (
                <div key={user.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-purple-200 font-bold flex items-center justify-center flex-shrink-0">
                          {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">{user.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {isDisabled ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-950 text-red-400 border border-red-800/50 flex-shrink-0">
                        Disabled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
                    <span className="font-mono text-purple-300 font-bold">{user.studentId || '—'}</span>
                    <span className="text-slate-400">{joined}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] font-bold text-emerald-400">
                      {user.totalCompleted || 0} Lectures ({user.progressPercent || 0}%)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleDisable(user)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                          isDisabled
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                        }`}
                      >
                        {isDisabled ? 'Enable' : 'Disable'}
                      </button>

                      <button
                        onClick={() => setDeleteModalUser(user)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-red-950/60 text-red-300 border border-red-800/60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4">Progress</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredUsers.map((user) => {
                    const joined = user.createdAt ? formatDate(user.createdAt) : '—'
                    const isDisabled = !!user.disabled

                    return (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Avatar & Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-purple-900/50 text-purple-200 font-bold flex items-center justify-center">
                                {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white text-xs">{user.name || 'Student'}</p>
                              <p className="text-[11px] text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-3.5 px-4 font-mono text-purple-300 font-bold">
                          {user.studentId || '—'}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-slate-400">
                          {joined}
                        </td>

                        {/* Progress */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            {user.totalCompleted || 0} Lectures ({user.progressPercent || 0}%)
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isDisabled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-950 text-red-400 border border-red-800/50 flex items-center gap-1 w-fit">
                              Disabled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1 w-fit">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleDisable(user)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isDisabled
                                ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800/60'
                                : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-800/60'
                            }`}
                            title={isDisabled ? 'Enable user account' : 'Disable user access'}
                          >
                            {isDisabled ? 'Enable Access' : 'Disable Access'}
                          </button>

                          <button
                            onClick={() => setDeleteModalUser(user)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 transition-all"
                            title="Delete user forever"
                          >
                            Delete Forever
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STUDENT USER MODAL ── */}
      <AnimatePresence>
        {addUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-purple-800/60 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">Add New Student Account</h3>
                </div>
                <button
                  onClick={() => setAddUserModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Manually register a student account. This creates their login credential in Firebase Auth and initializes their profile in Firestore.
              </p>

              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Student Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Ankit Sharma"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Student Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                      placeholder="student@example.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Student ID (e.g. GATE-ECE-XXXXXX) will be generated automatically.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{createLoading ? 'Creating…' : 'Create Student Account'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1   }}
              exit={  { opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-red-800/60 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950 text-red-500 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Delete User Permanently</h3>
                  <p className="text-xs text-red-400">Irreversible Action</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{deleteModalUser.name}</strong> ({deleteModalUser.email}) forever? This account will be immediately and permanently purged from Firestore with <span className="text-red-400 font-bold">NO 7-day grace period</span>.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setDeleteModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteForever}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {actionLoading ? 'Deleting…' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
