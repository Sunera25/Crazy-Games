// Synthesized game sounds (Web Audio API). No audio files are loaded.
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
    playBurst(out, at, { frequency: 2400, q: 0.9, duration: 0.09, gain: 0.35 })
    playTone(out, at, { frequency: 260, endFrequency: 180, duration: 0.06, type: 'triangle', gain: 0.05 })
  },
  play: (out, at) => {
    playBurst(out, at, { frequency: 1400, q: 1.1, duration: 0.08, gain: 0.5 })
    playTone(out, at, { frequency: 220, endFrequency: 150, duration: 0.09, type: 'triangle', gain: 0.18 })
  },
  shuffle: (out, at) => {
    const taps = [0, 0.05, 0.11, 0.19, 0.26]
    taps.forEach((offset, index) => {
      playBurst(out, at, { frequency: 1800 + index * 300, q: 1.4, duration: 0.03, gain: 0.4, offset })
    })
  },
  click: (out, at) => {
    playTone(out, at, { frequency: 1100, duration: 0.05, type: 'sine', gain: 0.12 })
    playBurst(out, at, { frequency: 4000, q: 2, duration: 0.02, gain: 0.2 })
  },
  score: (out, at) => {
    playTone(out, at, { frequency: 880, duration: 0.18, type: 'triangle', gain: 0.15 })
    playTone(out, at, { frequency: 1318, duration: 0.25, type: 'triangle', gain: 0.15, offset: 0.08 })
  },
  win: (out, at) => {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      playTone(out, at, { frequency, duration: 0.35, type: 'triangle', gain: 0.16, offset: index * 0.09 })
    })
  },
  lose: (out, at) => {
    playTone(out, at, { frequency: 392, duration: 0.25, type: 'sine', gain: 0.12 })
    playTone(out, at, { frequency: 329.63, duration: 0.4, type: 'sine', gain: 0.12, offset: 0.18 })
  }
}

class SoundManager {
  private output: Output | null = null

  private ensureOutput(): Output | null {
    if (this.output) return this.output
    if (typeof window === 'undefined' || !window.AudioContext) return null
    const context = new window.AudioContext()
    const master = context.createGain()
    master.gain.value = 0.7
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
    const out = this.ensureOutput()
    if (!out) return
    if (out.context.state === 'suspended') void out.context.resume()
    recipes[soundType](out, out.context.currentTime + 0.005 + delay)
  }
}

export const soundManager = new SoundManager()
