import { soundManager } from '../utils/sounds'
import { registerCloudData } from '../utils/storage'

type CrazyGamesSettings = {
  muteAudio?: boolean
}

type CrazyGamesSdk = {
  init: () => Promise<void>
  game: {
    loadingStart: () => void
    loadingStop: () => void
    gameplayStart: () => void
    gameplayStop: () => void
    settings?: CrazyGamesSettings
    addSettingsChangeListener?: (listener: () => void) => void
  }
  data?: {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem?: (key: string) => void
  }
  ad?: {
    requestAd: (
      adType: 'midgame' | 'rewarded',
      callbacks: {
        adStarted?: () => void
        adFinished?: () => void
        adError?: (error: unknown) => void
      }
    ) => void
  }
  user?: {
    isUserAccountAvailable: (callback: (error: unknown, available: boolean) => void) => unknown
    getUser: (callback: (error: unknown, user: CgUser | null) => void) => unknown
    showAuthPrompt?: (callback: (error: unknown, user: CgUser | null) => void) => unknown
    addAuthListener?: (listener: () => void) => void
  }
}

type CgUser = {
  username?: string
  profilePictureUrl?: string | null
}

// The SDK user methods accept either a node-style callback or return a
// promise depending on the build; this helper normalises both.
function sdkCall<T>(invoke: (callback: (error: unknown, value: T | undefined) => void) => unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false
    const done = (value: T) => { if (!settled) { settled = true; resolve(value) } }
    const fail = (error: unknown) => { if (!settled) { settled = true; reject(error instanceof Error ? error : new Error(String(error))) } }
    try {
      const returned = invoke((error, value) => {
        if (value !== undefined) return done(value)
        if (error && typeof error === 'object' && 'username' in (error as Record<string, unknown>)) return done(error as T)
        if (error) return fail(error)
        done(undefined as T)
      })
      if (returned && typeof (returned as { then?: unknown }).then === 'function') {
        (returned as Promise<T>).then(done, fail)
      }
    } catch (error) {
      fail(error)
    }
  })
}

let accountAvailable = false
let currentUser: CgUser | null = null

function dispatchAccount(): void {
  window.dispatchEvent(new CustomEvent('omi:cg-account', {
    detail: {
      available: accountAvailable,
      username: currentUser?.username ?? null,
      pictureUrl: currentUser?.profilePictureUrl ?? null
    }
  }))
}

async function refreshAccount(candidate: CrazyGamesSdk): Promise<void> {
  if (!candidate.user) return
  try {
    accountAvailable = !!(await sdkCall<boolean>((cb) => candidate.user!.isUserAccountAvailable(cb)))
  } catch {
    accountAvailable = false
  }
  currentUser = null
  if (accountAvailable) {
    try {
      currentUser = await sdkCall<CgUser | null>((cb) => candidate.user!.getUser(cb))
    } catch {
      currentUser = null
    }
  }
  dispatchAccount()
}

// Opens the CrazyGames login/register popup (only ever from the player's
// own tap on a login button — the auth prompt is never triggered
// automatically). On success the account state is refreshed, progress is
// re-mirrored to the Data module under the account, and the game is told.
export async function loginWithCrazyGames(): Promise<void> {
  const candidate = sdk
  if (!candidate?.user?.showAuthPrompt) return
  try {
    const user = await sdkCall<CgUser | null>((cb) => candidate.user!.showAuthPrompt!(cb))
    if (user) {
      currentUser = user
      accountAvailable = true
      if (candidate.data) {
        registerCloudData(candidate.data, () => window.dispatchEvent(new CustomEvent('omi:cloud-hydrated')))
      }
      dispatchAccount()
    }
  } catch {
    // userCancelled / prompt already open — the player stays a guest.
  }
}

// Video ads, mirroring the GameDistribution breaks. CrazyGames has no
// 'preroll' request type — the platform serves its own preroll around the
// first gameplay start — so a preroll break is a no-op here, and a midroll
// break is a 'midgame' request at a natural pause (the SDK itself caps
// frequency). The game is muted while an ad plays, per the ad guidelines,
// and every callback path un-mutes and lets the game continue: an unfilled
// or failed ad must never stall play.
export function crazyGamesAdBreak(kind: 'preroll' | 'midroll'): Promise<void> {
  if (kind === 'preroll') return Promise.resolve()
  const candidate = sdk
  if (!candidate?.ad?.requestAd) return Promise.resolve()
  const ad = candidate.ad
  return new Promise((resolve) => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      soundManager.setPlatformMuted(false)
      resolve()
    }
    window.setTimeout(finish, 35_000)
    try {
      ad.requestAd('midgame', {
        adStarted: () => soundManager.setPlatformMuted(true),
        adFinished: finish,
        adError: finish
      })
    } catch {
      finish()
    }
  })
}

export type CgRewardedResult = 'watched' | 'failed' | 'unavailable'

// Rewarded ad for the CrazyGames build. Per the platform's ad rules the
// reward is granted only on adFinished — an adError (unfilled, blocked,
// dismissed) grants nothing. 'unavailable' means there is no ad module at
// all (the game is not running on CrazyGames), where no ad exists to watch.
export function crazyGamesRewardedAd(): Promise<CgRewardedResult> {
  const candidate = sdk
  if (!candidate?.ad?.requestAd) return Promise.resolve('unavailable')
  const ad = candidate.ad
  return new Promise((resolve) => {
    let finished = false
    const finish = (result: CgRewardedResult) => {
      if (finished) return
      finished = true
      soundManager.setPlatformMuted(false)
      resolve(result)
    }
    window.setTimeout(() => finish('failed'), 90_000)
    try {
      ad.requestAd('rewarded', {
        adStarted: () => soundManager.setPlatformMuted(true),
        adFinished: () => finish('watched'),
        adError: () => finish('failed')
      })
    } catch {
      finish('failed')
    }
  })
}

declare global {
  interface Window {
    CrazyGames?: { SDK?: CrazyGamesSdk }
  }
}

let sdk: CrazyGamesSdk | null = null
let gameplayActive = false

export async function initializeCrazyGames(): Promise<void> {
  try {
    const candidate = window.CrazyGames?.SDK
    if (!candidate) return
    await candidate.init()
    sdk = candidate
    // Honour the site's mute control: apply the current SDK setting, then
    // follow any changes while the game runs.
    const syncSettings = () => {
      const settings = candidate.game.settings
      if (settings && typeof settings.muteAudio === 'boolean') {
        soundManager.setPlatformMuted(settings.muteAudio)
      }
    }
    syncSettings()
    try {
      candidate.game.addSettingsChangeListener?.(syncSettings)
    } catch {
      // Older SDK without settings listeners - the initial sync still applies.
    }
    // Progress save: mirror the player's progress to the CrazyGames Data
    // module so it is backed up to their account and synced across devices.
    if (candidate.data) {
      registerCloudData(candidate.data, () => window.dispatchEvent(new CustomEvent('omi:cloud-hydrated')))
    }
    // Account integration: detect the player's CrazyGames account (if any)
    // so the game can show their username and profile picture, and keep
    // listening — a guest who logs in mid-session is picked up live.
    if (candidate.user) {
      void refreshAccount(candidate)
      try {
        candidate.user.addAuthListener?.(() => { void refreshAccount(candidate) })
      } catch {
        // Auth listener unavailable — the initial check still applies.
      }
    }
    // If the player pressed Play before init finished, deliver the
    // gameplay start that was requested earlier.
    if (gameplayActive) candidate.game.gameplayStart()
  } catch {
    sdk = null
  }
}

export function loadingStart(): void {
  sdk?.game.loadingStart()
}

export function loadingStop(): void {
  sdk?.game.loadingStop()
}

export function gameplayStart(): void {
  gameplayActive = true
  sdk?.game.gameplayStart()
}

export function gameplayStop(): void {
  gameplayActive = false
  sdk?.game.gameplayStop()
}
