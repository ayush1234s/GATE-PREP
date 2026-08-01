// src/utils/helpers.js
// Shared pure utility functions used across the application.

/**
 * Format a Firestore Timestamp or Date to a readable string.
 * @param {import('firebase/firestore').Timestamp | Date | null} ts
 * @returns {string}
 */
export const formatDate = (ts) => {
  if (!ts) return '—'
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString('en-IN', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  })
}

/**
 * Extract a YouTube video ID from various YouTube URL formats.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
 * @param {string} url
 * @returns {string|null}
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null
  const cleanUrl = url.trim()
  if (!cleanUrl) return null

  // 1. If user entered raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl
  }

  // 2. Regex matching watch?v=, youtu.be/, shorts/, embed/, v/, live/
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?/\s]{11}).*/i
  const match = cleanUrl.match(regExp)

  if (match && match[1]) {
    return match[1]
  }

  // 3. Fallback URL parameter search for 'v'
  try {
    const parsed = new URL(cleanUrl)
    const vParam = parsed.searchParams.get('v')
    if (vParam && vParam.length === 11) return vParam
  } catch {
    // Ignore invalid URL parse errors
  }

  return null
}

/**
 * Convert any YouTube URL into an embeddable URL.
 * @param {string} url
 * @returns {string|null}
 */
export const getYouTubeEmbedUrl = (url) => {
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

/**
 * Build a YouTube thumbnail URL from a video ID.
 * @param {string} videoId
 * @param {'hqdefault'|'mqdefault'|'sddefault'|'maxresdefault'} quality
 * @returns {string}
 */
export const getYouTubeThumbnail = (videoId, quality = 'hqdefault') => {
  if (!videoId) return ''
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Calculate progress percentage from completed and total counts.
 * @param {number} completed
 * @param {number} total
 * @returns {number} 0-100
 */
export const calcProgress = (completed, total) => {
  if (!total || total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Clamp a number between min and max.
 */
export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max)

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number}   delay  - ms
 */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Convert seconds to a human-readable duration string.
 * @param {number} seconds
 * @returns {string}  e.g. "12:34"
 */
export const formatDuration = (seconds) => {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Truncate a string with ellipsis if it exceeds maxLen.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (str, maxLen = 60) => {
  if (!str) return ''
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str
}
