// src/pages/admin/AdminUsers.jsx
// Admin Users Control Module — List all Firestore users, toggle disabled access,
// delete accounts permanently, and manually create new student accounts with instant Firestore reflection.
// Animated with Framer Motion staggered reveals and micro-hover cards.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, UserX, UserCheck, Trash2,
  AlertTriangle, X, CheckCircle2, Mail,
  RefreshCw, UserPlus, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { subscribeToAllUsers, toggleUserDisabled, deleteUserPermanently } from '@/firebase/firestore'
import { adminCreateUser } from '@/firebase/auth'
import { formatDate } from '@/utils/helpers'

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >

      {/* Header & Search Bar & Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
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
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setAddUserModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student User</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Users Table / Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-400" />
          <p className="text-xs font-semibold">Loading users from Firestore…</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
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
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Mobile Card List View (< sm) */}
          <div className="block sm:hidden space-y-3">
            {filteredUsers.map((user) => {
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

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleToggleDisable(user)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isDisabled
                          ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-800/50'
                          : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-800/50'
                      }`}
                    >
                      {isDisabled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      <span>{isDisabled ? 'Enable' : 'Disable'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteModalUser(user)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/50 transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-4 px-5">Student User</th>
                  <th className="py-4 px-5">Student ID</th>
                  <th className="py-4 px-5">Joined Date</th>
                  <th className="py-4 px-5">Access Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredUsers.map((user) => {
                  const joined = user.createdAt ? formatDate(user.createdAt) : '—'
                  const isDisabled = !!user.disabled

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-purple-900/50 text-purple-200 font-bold flex items-center justify-center flex-shrink-0">
                              {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{user.name || 'Student'}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-purple-300 font-semibold">
                        {user.studentId || '—'}
                      </td>

                      <td className="py-3.5 px-5 text-slate-400">
                        {joined}
                      </td>

                      <td className="py-3.5 px-5">
                        {isDisabled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-950 text-red-400 border border-red-800/50">
                            <UserX className="w-3 h-3" /> Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleDisable(user)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              isDisabled
                                ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-800/50'
                                : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-800/50'
                            }`}
                          >
                            {isDisabled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            <span>{isDisabled ? 'Enable' : 'Disable'}</span>
                          </button>

                          <button
                            onClick={() => setDeleteModalUser(user)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/50 transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-red-900/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
              <button onClick={() => setDeleteModalUser(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-800">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Permanent Account Deletion</h3>
                  <p className="text-[11px] text-red-400 font-semibold uppercase tracking-wider">Irreversible Action</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-5 leading-relaxed">
                <p>Are you sure you want to delete <strong>{deleteModalUser.name}</strong> ({deleteModalUser.email}) permanently?</p>
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs">
                  ⚠️ This action will immediately remove the user profile from Firestore!
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setDeleteModalUser(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  onClick={handleDeleteForever}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {actionLoading ? 'Deleting…' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Student Modal */}
      <AnimatePresence>
        {addUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 rounded-3xl border border-purple-900/60 shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />
              <button onClick={() => setAddUserModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 flex items-center justify-center flex-shrink-0 border border-purple-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Add New Student Account</h3>
                  <p className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">Manual Student Onboarding</p>
                </div>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setAddUserModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {createLoading ? 'Creating Account…' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
