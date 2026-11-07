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
  user?: {
    isUserAccountAvailable: (callback: (available: boolean) => void) => void
    getUser: (callback: (user: { username?: string } | null) => void) => void
  }
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
    // Account integration: a signed-in player's CrazyGames username becomes
    // their in-game name (the game module applies it only if they have not
    // already chosen a name themselves).
    try {
      candidate.user?.isUserAccountAvailable((available) => {
        if (!available) return
        try {
          candidate.user?.getUser((user) => {
            const username = user?.username
            if (username) window.dispatchEvent(new CustomEvent('omi:cg-user', { detail: username }))
          })
        } catch {
          // User module unavailable - the local profile still works.
        }
      })
    } catch {
      // User module unavailable - the local profile still works.
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
