// Progress storage for Omi.
//
// localStorage is the synchronous working store on every platform. On
// CrazyGames, once the SDK is ready, progress keys are also mirrored to the
// CrazyGames Data module: signed-in players get their progress backed up and
// synced across devices, and guests keep playing on local storage (the SDK
// migrates guest data to the account on sign-in). This follows the
// CrazyGames guidelines: retrieve existing data before writing new data, and
// keep the data module as the account-backed copy of the player's progress.
type CloudData = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

const PROGRESS_KEYS = ['omi-stats', 'omi-wallet', 'omi-profile', 'omi-coach-done']
let cloud: CloudData | null = null

export function storeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage unavailable (private mode etc.) — the session still plays.
  }
  if (cloud && PROGRESS_KEYS.includes(key)) {
    try {
      cloud.setItem(key, value)
    } catch {
      // Cloud save is best-effort; the local copy remains.
    }
  }
}

// Called once by the CrazyGames platform module after SDK init. Adopts any
// account-backed values the local store doesn't have yet, pushes local
// values up when they differ, and notifies the game when state was adopted.
export function registerCloudData(candidate: unknown, onHydrated: () => void): void {
  const data = candidate as CloudData | null
  if (!data || typeof data.getItem !== 'function' || typeof data.setItem !== 'function') return
  cloud = data
  let adopted = false
  for (const key of PROGRESS_KEYS) {
    try {
      const localValue = storeGet(key)
      const cloudValue = data.getItem(key)
      if (localValue === null && typeof cloudValue === 'string') {
        try {
          window.localStorage.setItem(key, cloudValue)
        } catch {
          // Local write failed; the in-memory state simply stays default.
        }
        adopted = true
      } else if (localValue !== null && cloudValue !== localValue) {
        data.setItem(key, localValue)
      }
    } catch {
      // Skip this key; local storage still works.
    }
  }
  if (adopted) onHydrated()
}
