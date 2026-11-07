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
    playBurst(out, at, { frequency: 1400, endFrequency: 500, q: 0.7, duration: 0.14, gain: 0.36 })
    playBurst(out, at, { frequency: 2400, q: 1, duration: 0.04, gain: 0.22, offset: 0.09 })
  },
  play: (out, at) => {
    // Card snap: short noise burst plus a soft low thump, no tone.
    playBurst(out, at, { frequency: 1700, q: 1.2, duration: 0.06, gain: 0.42 })
    playBurst(out, at, { frequency: 420, q: 0.8, duration: 0.05, gain: 0.2, offset: 0.01 })
  },
  shuffle: (out, at) => {
    const taps = [0, 0.05, 0.11, 0.19, 0.26]
    taps.forEach((offset, index) => {
      playBurst(out, at, { frequency: 1500 + index * 200, q: 1.2, duration: 0.035, gain: 0.32, offset })
    })
  },
  click: (out, at) => {
    playBurst(out, at, { frequency: 3200, q: 1.5, duration: 0.025, gain: 0.22 })
  },
  score: (out, at) => {
    playTone(out, at, { frequency: 880, duration: 0.15, type: 'sine', gain: 0.13 })
    playTone(out, at, { frequency: 1318, duration: 0.2, type: 'sine', gain: 0.11, offset: 0.08 })
  },
  win: (out, at) => {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      playTone(out, at, { frequency, duration: 0.28, type: 'sine', gain: 0.14, offset: index * 0.09 })
    })
  },
  lose: (out, at) => {
    playTone(out, at, { frequency: 392, duration: 0.22, type: 'sine', gain: 0.11 })
    playTone(out, at, { frequency: 329.63, duration: 0.32, type: 'sine', gain: 0.11, offset: 0.18 })
  }
}

// --- Background music -----------------------------------------------------
// A slow lounge pad loop generated with Web Audio: warm chord pads on a
// long eight-chord cycle (two phrases, so it takes ~48 s to come back
// around), a soft root bass and a rare pluck that only ever plays notes
// from the current chord. Kept deliberately quiet and sparse so it sits
// under the game instead of looping in the player's ear. No audio files,
// so the build stays tiny. The music bus gain follows the same mute rules
// as the effects (the player's toggle and the platform mute), fading
// smoothly instead of cutting out.
const MUSIC_CHORDS: number[][] = [
  [48, 52, 55, 59], // Cmaj7
  [45, 48, 52, 55], // Am7
  [41, 45, 48, 52], // Fmaj7
  [43, 47, 50, 57], // Gadd9
  [48, 52, 55, 59], // Cmaj7
  [45, 48, 52, 55], // Am7
  [50, 53, 57, 60], // Dm7
  [43, 48, 50, 53] // Gsus — a softer landing than repeating Gadd9
]
const CHORD_SECONDS = 6

function midiHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function playPadNote(context: AudioContext, bus: GainNode, at: number, midi: number, duration: number): void {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.value = midiHz(midi)
  envelope.gain.setValueAtTime(0.0001, at)
  envelope.gain.exponentialRampToValueAtTime(0.032, at + 1.4)
  envelope.gain.setValueAtTime(0.032, at + duration - 1.4)
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(envelope).connect(bus)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.05)
}

function playBassNote(context: AudioContext, bus: GainNode, at: number, midi: number, duration: number): void {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = midiHz(midi)
  envelope.gain.setValueAtTime(0.0001, at)
  envelope.gain.exponentialRampToValueAtTime(0.05, at + 0.06)
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration * 0.9)
  oscillator.connect(envelope).connect(bus)
  oscillator.start(at)
  oscillator.stop(at + duration)
}

function playPluck(context: AudioContext, bus: GainNode, at: number, midi: number): void {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.value = midiHz(midi)
  envelope.gain.setValueAtTime(0.0001, at)
  envelope.gain.exponentialRampToValueAtTime(0.034, at + 0.015)
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.7)
  oscillator.connect(envelope).connect(bus)
  oscillator.start(at)
  oscillator.stop(at + 0.75)
}

class SoundManager {
  private output: Output | null = null
  private musicBus: GainNode | null = null
  private musicTimer: number | null = null
  private nextChordAt = 0
  private chordIndex = 0
  musicPlaying = false
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
    // iOS suspends the AudioContext on interruptions (calls, app
    // switching); platform guidance is to resume it inside a user gesture.
    if (typeof document !== 'undefined') {
      const resume = () => {
        const context = this.output?.context
        if (context && context.state === 'suspended') void context.resume()
      }
      document.addEventListener('touchend', resume, { passive: true })
      document.addEventListener('click', resume)
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
    master.gain.value = 0.9
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

  // Start the generated background music loop. Safe to call repeatedly and
  // from any user gesture; the loop keeps running across matches and fades
  // out whenever the game is muted (player toggle or platform mute).
  startMusic(): void {
    const out = this.ensureOutput()
    if (!out || this.musicTimer !== null) return
    if (out.context.state === 'suspended') void out.context.resume()
    if (!this.musicBus) {
      const filter = out.context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1100
      this.musicBus = out.context.createGain()
      this.musicBus.gain.value = 0
      this.musicBus.connect(filter).connect(out.master)
    }
    this.musicPlaying = true
    this.nextChordAt = out.context.currentTime + 0.08
    this.musicTick()
    this.musicTimer = window.setInterval(() => this.musicTick(), 400)
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer)
      this.musicTimer = null
    }
    this.musicPlaying = false
    if (this.musicBus && this.output) {
      this.musicBus.gain.setTargetAtTime(0, this.output.context.currentTime, 0.25)
    }
  }

  private musicTick(): void {
    const out = this.output
    if (!out || !this.musicBus) return
    const now = out.context.currentTime
    const target = this.muted || this.platformMuted ? 0 : 0.55
    this.musicBus.gain.setTargetAtTime(target, now, 0.35)
    while (this.nextChordAt < now + 1.4) {
      this.scheduleChord(this.nextChordAt, MUSIC_CHORDS[this.chordIndex])
      this.chordIndex = (this.chordIndex + 1) % MUSIC_CHORDS.length
      this.nextChordAt += CHORD_SECONDS
    }
  }

  private scheduleChord(at: number, chord: number[]): void {
    const out = this.output
    if (!out || !this.musicBus) return
    const context = out.context
    const bus = this.musicBus
    chord.forEach((midi) => playPadNote(context, bus, at, midi, CHORD_SECONDS + 1.2))
    playBassNote(context, bus, at, chord[0] - 12, CHORD_SECONDS)
    // Rare pluck melody: two slots per chord, each usually silent, and the
    // note always comes from the current chord (an octave up) so it can
    // never clash or turn into a tune the ear starts waiting for.
    const slots = [1.6, 4.2]
    slots.forEach((offset) => {
      if (Math.random() < 0.3) {
        const tones = chord.map((midi) => midi + 12)
        const midi = tones[Math.floor(Math.random() * tones.length)]
        playPluck(context, bus, at + offset, midi)
      }
    })
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
