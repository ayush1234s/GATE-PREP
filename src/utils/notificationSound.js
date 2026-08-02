// src/utils/notificationSound.js
// Accurate WhatsApp-style notification sound using the Web Audio API.
// No external files — pure programmatic synthesis with harmonics & bell envelope.

/**
 * Build and connect an oscillator + gain node.
 */
const makeTone = (ctx, type, freq, startTime, peak, attackMs, decayMs) => {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)

  const attackS = attackMs / 1000
  const decayS  = decayMs  / 1000

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(peak, startTime + attackS)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attackS + decayS)

  osc.start(startTime)
  osc.stop(startTime + attackS + decayS + 0.05)
}

/**
 * WhatsApp "default" notification chime — faithful recreation.
 *
 * The real WhatsApp sound is two ascending bell-like tones:
 *   Tone 1 → A5  (880 Hz)  — short, punchy
 *   Tone 2 → C#6 (1108 Hz) — longer, resonant tail
 *
 * Each tone is layered with a sine (fundamental) + triangle (soft 2nd harmonic)
 * for that characteristic warm-digital bell quality.
 * Volume: 0.82 peak gain — loud and clear.
 */
export const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // ── Tone 1: A5 880 Hz ──────────────────────────────────────
    // Fundamental (sine) — attack 6ms, decay 160ms
    makeTone(ctx, 'sine',     880,   now,        0.82, 6,  160)
    // 2nd harmonic (triangle @ 2x = 1760Hz, quiet) for bell colour
    makeTone(ctx, 'triangle', 1760,  now,        0.18, 6,  100)

    // ── Gap: 45ms ──────────────────────────────────────────────

    // ── Tone 2: C#6 1108.7 Hz ──────────────────────────────────
    // Fundamental (sine) — attack 6ms, decay 260ms (longer resonant tail)
    makeTone(ctx, 'sine',     1108.7, now + 0.045, 0.88, 6,  260)
    // Soft harmonic overlay
    makeTone(ctx, 'triangle', 2217.5, now + 0.045, 0.16, 6,  140)

    setTimeout(() => ctx.close().catch(() => {}), 900)

  } catch (err) {
    console.warn('[NotificationSound]', err.message)
  }
}

// Keep the old name as an alias so existing imports don't break
export const playWhatsAppSound = playNotificationSound
