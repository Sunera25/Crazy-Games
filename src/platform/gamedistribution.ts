// GameDistribution platform integration — only active in the
// `--mode gamedistribution` build (npm run build:gd). The GD SDK snippet in
// index.html (injected by vite.config.ts) defines GD_OPTIONS with the game
// id and forwards SDK events as window CustomEvents: gd:ready, gd:pause
// (an ad is about to play), gd:start (the ad finished). In the default
// CrazyGames build every function here is a no-op.
import { soundManager } from '../utils/sounds'

type GdSdk = {
  showAd: (type?: string) => Promise<void> | void
}

declare global {
  interface Window {
    gdsdk?: GdSdk
  }
}

const isGdBuild = import.meta.env.MODE === 'gamedistribution'
let sdkReadyFlag = false
let prerollShown = false
let lastMidrollAt = 0
const MIDROLL_GAP_MS = 150_000

export function initializeGameDistribution(): void {
  if (!isGdBuild) return
  window.addEventListener('gd:ready', () => {
    sdkReadyFlag = true
  })
  // Video ads carry their own audio — the game must be silent while one plays.
  window.addEventListener('gd:pause', () => soundManager.setPlatformMuted(true))
  window.addEventListener('gd:start', () => soundManager.setPlatformMuted(false))
}

function canShowAd(): boolean {
  return isGdBuild && sdkReadyFlag && typeof window.gdsdk?.showAd === 'function'
}

// Show an interstitial at a natural break: 'preroll' before the first match,
// 'midroll' between rounds. Resolves when the ad is over — or right away when
// no ad plays — so the game flow never gets stuck waiting on the ad SDK.
export function gdAdBreak(kind: 'preroll' | 'midroll'): Promise<void> {
  if (!canShowAd()) return Promise.resolve()
  if (kind === 'preroll') {
    if (prerollShown) return Promise.resolve()
    prerollShown = true
  } else {
    const now = Date.now()
    if (now - lastMidrollAt < MIDROLL_GAP_MS) return Promise.resolve()
    lastMidrollAt = now
  }
  return new Promise((resolve) => {
    let finished = false
    let sawPause = false
    const finish = () => {
      if (finished) return
      finished = true
      window.removeEventListener('gd:pause', onPause)
      window.removeEventListener('gd:start', onStart)
      resolve()
    }
    const onPause = () => {
      sawPause = true
    }
    const onStart = () => {
      if (sawPause) finish()
    }
    window.addEventListener('gd:pause', onPause)
    window.addEventListener('gd:start', onStart)
    // No ad filled: SDK_GAME_PAUSE never arrives, so carry on quickly.
    window.setTimeout(() => {
      if (!sawPause) finish()
    }, 1600)
    // A stuck ad must never freeze the game.
    window.setTimeout(finish, 40_000)
    try {
      const maybePromise = window.gdsdk?.showAd()
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => finish())
      }
    } catch {
      finish()
    }
  })
}
