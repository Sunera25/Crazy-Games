import { soundManager } from '../utils/sounds'

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
