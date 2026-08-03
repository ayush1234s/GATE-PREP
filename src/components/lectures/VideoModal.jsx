// src/components/lectures/VideoModal.jsx
// Embedded YouTube Video Player Modal with full custom player controls:
// Volume (slider + presets: Mute, Low, Max), Playback Speed (0.25x to 2x),
// Quality Selector (1080p, 720p, 480p, 360p, 240p, Auto), Fullscreen,
// Scrubber seeking, Keyboard shortcuts, and Firestore completion sync.

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  PlayCircle,
  Video,
  ExternalLink,
  Play,
  Pause,
  VolumeX,
  Volume1,
  Volume2,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Gauge,
} from 'lucide-react'
import { extractYouTubeId } from '@/utils/helpers'

// Load YouTube Iframe API dynamically
function loadYouTubeIframeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    const existingScript = document.getElementById('youtube-iframe-api')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }

    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkInterval)
        resolve(window.YT)
      }
    }, 100)
  })
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const QUALITY_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p HD', value: 'hd1080' },
  { label: '720p HD', value: 'hd720' },
  { label: '480p', value: 'large' },
  { label: '360p', value: 'medium' },
  { label: '240p', value: 'small' },
  { label: '144p', value: 'tiny' }
]

const VideoModal = ({
  lecture,
  isOpen,
  onClose,
  isCompleted = false,
  onToggleComplete,
}) => {
  const [player, setPlayer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  const modalContainerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const videoId = lecture ? extractYouTubeId(lecture.youtubeUrl) : null

  // Keep refs for initial configuration without triggering player recreation
  const volumeRef = useRef(volume)
  const isMutedRef = useRef(isMuted)
  const playbackRateRef = useRef(playbackRate)
  const qualityRef = useRef(quality)

  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  useEffect(() => { playbackRateRef.current = playbackRate }, [playbackRate])
  useEffect(() => { qualityRef.current = quality }, [quality])

  // Initialize YT Player ONLY when modal opens or videoId changes
  useEffect(() => {
    if (!isOpen || !videoId) return

    let ytPlayer = null
    let isSubscribed = true
    setIsPlayerReady(false)

    loadYouTubeIframeApi().then((YT) => {
      if (!isSubscribed || !playerContainerRef.current) return

      // Create unique container element inside ref
      playerContainerRef.current.innerHTML = '<div id="yt-player-frame"></div>'

      ytPlayer = new YT.Player('yt-player-frame', {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!isSubscribed) return
            const p = event.target
            setPlayer(p)
            setIsPlayerReady(true)
            setIsPlaying(true)
            p.setVolume(volumeRef.current)
            if (isMutedRef.current) p.mute()
            p.setPlaybackRate(playbackRateRef.current)
            if (qualityRef.current !== 'auto') {
              try { p.setPlaybackQuality(qualityRef.current) } catch { /* ignore */ }
            }
          },
          onStateChange: (event) => {
            if (!isSubscribed) return
            // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
            if (window.YT && event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (window.YT && (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED)) {
              setIsPlaying(false)
            }
          }
        }
      })
    })

    return () => {
      isSubscribed = false
      setPlayer(null)
      setIsPlayerReady(false)
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try { ytPlayer.destroy() } catch { /* ignore */ }
      }
    }
  }, [isOpen, videoId])

  // Track progress & duration
  useEffect(() => {
    if (!player || !isPlayerReady) return
    const interval = setInterval(() => {
      try {
        if (typeof player.getCurrentTime === 'function') {
          setCurrentTime(player.getCurrentTime() || 0)
        }
        if (typeof player.getDuration === 'function') {
          setDuration(player.getDuration() || 0)
        }
      } catch { /* ignore */ }
    }, 500)

    return () => clearInterval(interval)
  }, [player, isPlayerReady])

  // Track Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Player controls handlers
  const handleTogglePlay = useCallback(() => {
    if (!player || !isPlayerReady) return
    if (isPlaying) {
      player.pauseVideo()
      setIsPlaying(false)
    } else {
      player.playVideo()
      setIsPlaying(true)
    }
  }, [player, isPlayerReady, isPlaying])

  const handleSeekRelative = useCallback((seconds) => {
    if (!player || !isPlayerReady) return
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    player.seekTo(newTime, true)
    setCurrentTime(newTime)
  }, [player, isPlayerReady, duration, currentTime])

  const handleSeekTo = (e) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (player && isPlayerReady && typeof player.seekTo === 'function') {
      player.seekTo(newTime, true)
    }
  }

  const handleVolumeChange = useCallback((newVol) => {
    const val = Number(newVol)
    setVolume(val)
    if (!player || !isPlayerReady) return

    if (val === 0) {
      setIsMuted(true)
      player.mute()
    } else {
      if (isMuted) {
        setIsMuted(false)
        player.unMute()
      }
      player.setVolume(val)
    }
  }, [player, isPlayerReady, isMuted])

  const handleToggleMute = useCallback(() => {
    if (!player || !isPlayerReady) return
    if (isMuted) {
      player.unMute()
      setIsMuted(false)
      if (volume === 0) {
        setVolume(50)
        player.setVolume(50)
      } else {
        player.setVolume(volume)
      }
    } else {
      player.mute()
      setIsMuted(true)
    }
  }, [player, isPlayerReady, isMuted, volume])

  const handleSpeedSelect = (speed) => {
    setPlaybackRate(speed)
    setShowSpeedMenu(false)
    if (player && isPlayerReady && typeof player.setPlaybackRate === 'function') {
      player.setPlaybackRate(speed)
    }
  }

  const handleQualitySelect = (qVal) => {
    setQuality(qVal)
    setShowQualityMenu(false)
    if (player && isPlayerReady) {
      if (typeof player.setPlaybackQuality === 'function') {
        try { player.setPlaybackQuality(qVal) } catch { /* ignore */ }
      }
      if (typeof player.setSuggestedQuality === 'function') {
        try { player.setSuggestedQuality(qVal) } catch { /* ignore */ }
      }
    }
  }

  const handleToggleFullscreen = useCallback(() => {
    const target = modalContainerRef.current
    if (!target) return

    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        target.requestFullscreen()
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen()
      } else if (target.msRequestFullscreen) {
        target.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }
  }, [])

  // Keyboard controls when modal is open
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        handleTogglePlay()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        handleToggleMute()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        handleToggleFullscreen()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSeekRelative(-5)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleSeekRelative(5)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleVolumeChange(Math.min(100, volume + 10))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleVolumeChange(Math.max(0, volume - 10))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, volume, handleTogglePlay, handleToggleMute, handleToggleFullscreen, handleSeekRelative, handleVolumeChange])

  if (!isOpen || !lecture) return null

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    const formattedS = s < 10 ? `0${s}` : `${s}`
    if (m >= 60) {
      const h = Math.floor(m / 60)
      const remM = m % 60
      const formattedM = remM < 10 ? `0${remM}` : `${remM}`
      return `${h}:${formattedM}:${formattedS}`
    }
    return `${m}:${formattedS}`
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          ref={modalContainerRef}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3 }}
          className={`relative w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-4xl rounded-3xl'} bg-slate-900 border border-slate-800 shadow-2xl z-10 text-white flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold truncate text-slate-100">
                {lecture.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player Box */}
          <div className={`relative ${isFullscreen ? 'flex-1 min-h-0' : 'aspect-video'} bg-black flex flex-col justify-between overflow-hidden group`}>
            {videoId ? (
              <div className="relative w-full h-full flex items-center justify-center min-h-0">
                <div ref={playerContainerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 m-auto max-w-md">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <PlayCircle className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-lg text-slate-200 mb-2">
                  No Video Link Added Yet
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Add a <strong>youtubeUrl</strong> field to this lecture in Firestore to play the video embedded here automatically!
                </p>
                <div className="p-3 bg-slate-800/60 rounded-xl font-mono text-[11px] text-primary-300 border border-slate-700/50">
                  youtubeUrl: "https://youtu.be/..."
                </div>
              </div>
            )}

            {/* Custom Enhanced Controls Bar */}
            {videoId && (
              <div className="p-3 bg-slate-950/90 border-t border-slate-800 backdrop-blur-md flex flex-col gap-2 shrink-0">
                {/* Timeline Scrubber */}
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 px-1">
                  <span className="w-12 text-right">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeekTo}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:h-2 transition-all"
                  />
                  <span className="w-12">{formatTime(duration)}</span>
                </div>

                {/* Controls Bar Row */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  {/* Left Controls: Play/Pause, Seek, Volume Slider & Presets */}
                  <div className="flex items-center gap-2">
                    {/* Play/Pause Button */}
                    <button
                      onClick={handleTogglePlay}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center"
                      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    {/* Seek -10s / +10s */}
                    <button
                      onClick={() => handleSeekRelative(-10)}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Rewind 10s (Left Arrow)"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSeekRelative(10)}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Forward 10s (Right Arrow)"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

                    {/* Volume Controls (Icon + Slider + Low/Max Presets) */}
                    <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
                      <button
                        onClick={handleToggleMute}
                        className="p-1 text-slate-300 hover:text-white transition-colors"
                        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : volume < 50 ? (
                          <Volume1 className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>

                      {/* Volume Slider */}
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(e.target.value)}
                        className="w-16 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        title={`Volume: ${isMuted ? 0 : volume}%`}
                      />

                      <span className="text-[10px] font-mono text-slate-400 w-7 text-center">
                        {isMuted ? '0%' : `${volume}%`}
                      </span>

                      {/* Quick Presets: Low, Mid, Max */}
                      <div className="hidden md:flex items-center gap-1 border-l border-slate-700/50 pl-1.5">
                        <button
                          onClick={() => handleVolumeChange(0)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            isMuted || volume === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          Mute
                        </button>
                        <button
                          onClick={() => handleVolumeChange(30)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            !isMuted && volume > 0 && volume <= 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          Low
                        </button>
                        <button
                          onClick={() => handleVolumeChange(100)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            !isMuted && volume >= 90 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Controls: Speed, Quality, Fullscreen */}
                  <div className="flex items-center gap-2">
                    {/* Playback Speed Menu */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowSpeedMenu(!showSpeedMenu)
                          setShowQualityMenu(false)
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          playbackRate !== 1
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Playback Speed"
                      >
                        <Gauge className="w-3.5 h-3.5" />
                        <span>{playbackRate}x</span>
                      </button>

                      {/* Speed Dropdown */}
                      {showSpeedMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-32 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-1.5 z-30 flex flex-col gap-0.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                            Playback Speed
                          </div>
                          {SPEED_OPTIONS.map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleSpeedSelect(rate)}
                              className={`w-full text-left px-2.5 py-1 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                                playbackRate === rate
                                  ? 'bg-purple-600 text-white font-bold'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span>{rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
                              {playbackRate === rate && <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quality Menu */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowQualityMenu(!showQualityMenu)
                          setShowSpeedMenu(false)
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          quality !== 'auto'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Video Quality"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="capitalize">{QUALITY_OPTIONS.find(q => q.value === quality)?.label || quality}</span>
                      </button>

                      {/* Quality Dropdown */}
                      {showQualityMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-36 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-1.5 z-30 flex flex-col gap-0.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                            Quality Select
                          </div>
                          {QUALITY_OPTIONS.map((q) => (
                            <button
                              key={q.value}
                              onClick={() => handleQualitySelect(q.value)}
                              className={`w-full text-left px-2.5 py-1 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                                quality === q.value
                                  ? 'bg-sky-600 text-white font-bold'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span>{q.label}</span>
                              {quality === q.value && <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      onClick={handleToggleFullscreen}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-slate-900 border-t border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {lecture.youtubeUrl && (
                <a
                  href={lecture.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={() => onToggleComplete(lecture.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-primary-600 hover:bg-primary-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Mark Pending' : 'Mark Completed'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default VideoModal
