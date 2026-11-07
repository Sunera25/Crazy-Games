// GameDistribution platform integration — only active in the
// `--mode gamedistribution` build (npm run build:gd). The GD SDK snippet in
// index.html (injected by vite.config.ts) defines GD_OPTIONS with the game
// id and forwards SDK events as window CustomEvents: gd:ready, gd:pause
// (an ad is about to play), gd:start (the ad finished). In the default
// CrazyGames build every function here is a no-op.
import { soundManager } from '../utils/sounds'

type GdSdk = {
  showAd: (type?: string) => Promise<void> | void
  preloadAd?: (type?: string) => Promise<void> | void
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
    preloadRewarded()
  })
  // Video ads carry their own audio — the game must be silent while one
  // plays. But an ad that fails after pausing (adblock, no fill, network
  // error) may never send its start event; without a failsafe the game
  // would stay muted forever, so a pause that is never matched by a start
  // force-unmutes after a grace period.
  window.addEventListener('gd:pause', () => {
    adPaused = true
    soundManager.setPlatformMuted(true)
    if (pauseFailsafe !== null) window.clearTimeout(pauseFailsafe)
    pauseFailsafe = window.setTimeout(() => {
      if (adPaused) {
        adPaused = false
        soundManager.setPlatformMuted(false)
      }
    }, 45_000)
  })
  window.addEventListener('gd:start', () => {
    adPaused = false
    if (pauseFailsafe !== null) {
      window.clearTimeout(pauseFailsafe)
      pauseFailsafe = null
    }
    soundManager.setPlatformMuted(false)
  })
}

let adPaused = false
let pauseFailsafe: number | null = null

// When an ad break ends, make sure the game is not left muted by a pause
// whose start event never arrived.
function ensureUnmutedAfterBreak(): void {
  if (!adPaused) {
    soundManager.setPlatformMuted(false)
    return
  }
  window.setTimeout(() => {
    if (adPaused) {
      adPaused = false
      soundManager.setPlatformMuted(false)
    }
  }, 3000)
}

function canShowAd(): boolean {
  return isGdBuild && sdkReadyFlag && typeof window.gdsdk?.showAd === 'function'
}

// Rewarded popups are a GameDistribution feature; the CrazyGames build
// never shows them.
export function gdAdsEnabled(): boolean {
  return isGdBuild
}

// Best practice per the GD wiki: keep a rewarded ad preloaded so it can
// play the moment the player asks for a reward.
function preloadRewarded(): void {
  try {
    const maybePromise = window.gdsdk?.preloadAd?.('rewarded')
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => undefined)
    }
  } catch {
    // Preloading is an optimization only.
  }
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
      ensureUnmutedAfterBreak()
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

// Show a rewarded ad after the player opted in through a reward popup.
// Resolves true ONLY when the SDK reports the ad was watched completely
// (SDK_REWARDED_WATCH_COMPLETE, forwarded as 'gd:rewarded') — a skipped,
// failed or unfilled ad resolves false and the game grants nothing.
export function gdRewardedAd(): Promise<boolean> {
  if (!canShowAd()) return Promise.resolve(false)
  return new Promise((resolve) => {
    let finished = false
    let rewarded = false
    let sawPause = false
    const finish = (value: boolean) => {
      if (finished) return
      finished = true
      window.removeEventListener('gd:rewarded', onRewarded)
      window.removeEventListener('gd:pause', onPause)
      window.removeEventListener('gd:start', onStart)
      ensureUnmutedAfterBreak()
      // A completed reward also counts as the latest ad, so the round-end
      // interstitial does not fire straight after it.
      if (value) lastMidrollAt = Date.now()
      preloadRewarded()
      resolve(value)
    }
    const onRewarded = () => {
      rewarded = true
    }
    const onPause = () => {
      sawPause = true
    }
    const onStart = () => {
      if (sawPause) finish(rewarded)
    }
    window.addEventListener('gd:rewarded', onRewarded)
    window.addEventListener('gd:pause', onPause)
    window.addEventListener('gd:start', onStart)
    // No ad filled: SDK_GAME_PAUSE never arrives, so give up quickly.
    window.setTimeout(() => {
      if (!sawPause) finish(false)
    }, 2500)
    // Rewarded videos can run long, but never hang the game.
    window.setTimeout(() => finish(rewarded), 90_000)
    try {
      const maybePromise = window.gdsdk?.showAd('rewarded')
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(
          // The process ended; give the reward event a brief moment to
          // land before deciding.
          () => window.setTimeout(() => finish(rewarded), 350),
          () => finish(false)
        )
      }
    } catch {
      finish(false)
    }
  })
}
