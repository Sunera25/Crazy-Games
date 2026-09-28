type CrazyGamesSdk = {
  init: () => Promise<void>
  game: {
    loadingStart: () => void
    loadingStop: () => void
    gameplayStart: () => void
    gameplayStop: () => void
  }
}

declare global {
  interface Window {
    CrazyGames?: { SDK?: CrazyGamesSdk }
  }
}

let sdk: CrazyGamesSdk | null = null

export async function initializeCrazyGames(): Promise<void> {
  try {
    const candidate = window.CrazyGames?.SDK
    if (!candidate) return
    await candidate.init()
    sdk = candidate
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
  sdk?.game.gameplayStart()
}

export function gameplayStop(): void {
  sdk?.game.gameplayStop()
}
