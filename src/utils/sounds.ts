// Soft synthesized card sounds (Web Audio API). No audio files are loaded.
// Card actions (deal / play / shuffle / click) are filtered-noise snaps and
// whooshes only — no oscillator beeps. Win / lose / score keep a quiet,
// short sine chime at about half the old volume.
type SoundType = 'deal' | 'play' | 'win' | 'lose' | 'score' | 'click' | 'shuffle'

interface Output {
  context: AudioContext
  master: GainNode
  noise: AudioBuffer
}

interface ToneOptions {
  frequency: number
  endFrequency?: number
  duration: number
  type: OscillatorType
  gain: number
  offset?: number
}

interface BurstOptions {
  frequency: number
  endFrequency?: number
  q: number
  duration: number
  gain: number
  offset?: number
}

function playTone(out: Output, at: number, options: ToneOptions): void {
  const start = at + (options.offset ?? 0)
  const oscillator = out.context.createOscillator()
  const envelope = out.context.createGain()
  oscillator.type = options.type
  oscillator.frequency.setValueAtTime(options.frequency, start)
  if (options.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, start + options.duration)
  }
  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.exponentialRampToValueAtTime(options.gain, start + 0.01)
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + options.duration)
  oscillator.connect(envelope).connect(out.master)
  oscillator.start(start)
  oscillator.stop(start + options.duration + 0.02)
}

function playBurst(out: Output, at: number, options: BurstOptions): void {
  const start = at + (options.offset ?? 0)
  const source = out.context.createBufferSource()
  const filter = out.context.createBiquadFilter()
  const envelope = out.context.createGain()
  source.buffer = out.noise
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(options.frequency, start)
  if (options.endFrequency) {
    filter.frequency.exponentialRampToValueAtTime(options.endFrequency, start + options.duration)
  }
  filter.Q.value = options.q
  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.exponentialRampToValueAtTime(options.gain, start + Math.min(0.012, options.duration * 0.3))
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + options.duration)
  source.connect(filter).connect(envelope).connect(out.master)
  source.start(start, Math.random() * 0.3)
  source.stop(start + options.duration + 0.02)
}

const recipes: Record<SoundType, (out: Output, at: number) => void> = {
  deal: (out, at) => {
    // Soft whoosh down, then a light card landing snap.
    playBurst(out, at, { frequency: 1400, endFrequency: 500, q: 0.7, duration: 0.14, gain: 0.28 })
    playBurst(out, at, { frequency: 2400, q: 1, duration: 0.04, gain: 0.16, offset: 0.09 })
  },
  play: (out, at) => {
    // Card snap: short noise burst plus a soft low thump, no tone.
    playBurst(out, at, { frequency: 1700, q: 1.2, duration: 0.06, gain: 0.42 })
    playBurst(out, at, { frequency: 420, q: 0.8, duration: 0.05, gain: 0.14, offset: 0.01 })
  },
  shuffle: (out, at) => {
    const taps = [0, 0.05, 0.11, 0.19, 0.26]
    taps.forEach((offset, index) => {
      playBurst(out, at, { frequency: 1500 + index * 200, q: 1.2, duration: 0.035, gain: 0.26, offset })
    })
  },
  click: (out, at) => {
    playBurst(out, at, { frequency: 3200, q: 1.5, duration: 0.025, gain: 0.13 })
  },
  score: (out, at) => {
    playTone(out, at, { frequency: 880, duration: 0.15, type: 'sine', gain: 0.07 })
    playTone(out, at, { frequency: 1318, duration: 0.2, type: 'sine', gain: 0.06, offset: 0.08 })
  },
  win: (out, at) => {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      playTone(out, at, { frequency, duration: 0.28, type: 'sine', gain: 0.08, offset: index * 0.09 })
    })
  },
  lose: (out, at) => {
    playTone(out, at, { frequency: 392, duration: 0.22, type: 'sine', gain: 0.06 })
    playTone(out, at, { frequency: 329.63, duration: 0.32, type: 'sine', gain: 0.06, offset: 0.18 })
  }
}

class SoundManager {
  private output: Output | null = null
  muted = false
  platformMuted = false

  // CrazyGames can mute the game from the site UI (SDK settings). That mute
  // applies on top of the player's own toggle and is never persisted.
  setPlatformMuted(value: boolean): void {
    this.platformMuted = value
  }

  constructor() {
    try {
      this.muted = typeof window !== 'undefined' && window.localStorage.getItem('omi-muted') === '1'
    } catch {
      this.muted = false
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    try {
      window.localStorage.setItem('omi-muted', this.muted ? '1' : '0')
    } catch {
      // Storage unavailable (private mode etc.) — mute still applies for the session.
    }
    return this.muted
  }

  private ensureOutput(): Output | null {
    if (this.output) return this.output
    if (typeof window === 'undefined' || !window.AudioContext) return null
    const context = new window.AudioContext()
    const master = context.createGain()
    master.gain.value = 0.55
    const compressor = context.createDynamicsCompressor()
    master.connect(compressor).connect(context.destination)
    const noise = context.createBuffer(1, context.sampleRate * 0.5, context.sampleRate)
    const samples = noise.getChannelData(0)
    for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1
    this.output = { context, master, noise }
    return this.output
  }

  play(soundType: SoundType): void {
    this.schedule(soundType, 0)
  }

  playSequence(soundTypes: SoundType[], delayBetween = 0.1): void {
    soundTypes.forEach((soundType, index) => this.schedule(soundType, index * delayBetween))
  }

  private schedule(soundType: SoundType, delay: number): void {
    if (this.muted || this.platformMuted) return
    const out = this.ensureOutput()
    if (!out) return
    if (out.context.state === 'suspended') void out.context.resume()
    recipes[soundType](out, out.context.currentTime + 0.005 + delay)
  }
}

export const soundManager = new SoundManager()
