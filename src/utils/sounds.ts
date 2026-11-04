// Sound effect manager with Web Audio API fallback support
type SoundType = 'deal' | 'play' | 'win' | 'lose' | 'score' | 'click' | 'shuffle'

interface SoundConfig {
  frequency: number
  duration: number
  type: OscillatorType
  attack: number
  decay: number
  sustain: number
  release: number
}

const soundConfigs: Record<SoundType, SoundConfig> = {
  deal: { frequency: 400, duration: 0.1, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0, release: 0.01 },
  play: { frequency: 600, duration: 0.15, type: 'sine', attack: 0.02, decay: 0.1, sustain: 0, release: 0.03 },
  win: { frequency: 800, duration: 0.4, type: 'sine', attack: 0.05, decay: 0.15, sustain: 0.1, release: 0.1 },
  lose: { frequency: 300, duration: 0.3, type: 'sine', attack: 0.05, decay: 0.1, sustain: 0.05, release: 0.1 },
  score: { frequency: 700, duration: 0.2, type: 'sine', attack: 0.03, decay: 0.12, sustain: 0, release: 0.05 },
  click: { frequency: 500, duration: 0.08, type: 'sine', attack: 0.01, decay: 0.06, sustain: 0, release: 0.01 },
  shuffle: { frequency: 450, duration: 0.12, type: 'sine', attack: 0.01, decay: 0.1, sustain: 0, release: 0.01 }
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private soundEnabled = true

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new window.AudioContext()
    }
  }

  toggleSound(enabled: boolean): void {
    this.soundEnabled = enabled
  }

  play(soundType: SoundType): void {
    if (!this.soundEnabled || !this.audioContext) return

    const config = soundConfigs[soundType]
    const now = this.audioContext.currentTime
    const duration = config.duration

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = config.type
    oscillator.frequency.setValueAtTime(config.frequency, now)

    oscillator.frequency.setValueAtTime(config.frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.8, now + duration * 0.3)
    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.9, now + duration)

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(1, now + config.attack)
    gainNode.gain.linearRampToValueAtTime(config.sustain, now + config.attack + config.decay)
    gainNode.gain.linearRampToValueAtTime(0, now + duration - config.release)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  playSequence(soundTypes: SoundType[], delayBetween = 0.1): void {
    soundTypes.forEach((soundType, index) => {
      setTimeout(() => this.play(soundType), index * delayBetween * 1000)
    })
  }
}

export const soundManager = new SoundManager()
