// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Coach Overlay - Browser-Level DOM & Interaction Tests', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
    document.body.innerHTML = '<div id="app"></div>'
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mounts the coach overlay banner with accessible attributes and trump guidance on first match', async () => {
    await import('../main.ts')

    const playBtn = document.querySelector<HTMLButtonElement>('[data-action="play"]')
    expect(playBtn).not.toBeNull()
    playBtn?.click()

    // Advance match start transition (450ms)
    await vi.advanceTimersByTimeAsync(500)

    // Verify banner existence and accessibility markup
    const banner = document.querySelector('.coach-banner')
    expect(banner).not.toBeNull()
    expect(banner?.getAttribute('role')).toBe('region')
    expect(banner?.getAttribute('aria-label')).toBe('First-match tutorial')

    // Verify Step 1 Trump badge and title
    const badge = banner?.querySelector('.coach-pill-badge')
    expect(badge?.textContent).toBe('STEP 1/3')

    const title = banner?.querySelector('.coach-title')
    expect(title?.textContent).toContain('Choose Your Trump Suit')

    const desc = banner?.querySelector('.coach-desc')
    expect(desc?.textContent).toContain('Trump cards beat every other suit in the game')

    // Verify Skip guide button is present
    const skipBtn = banner?.querySelector<HTMLButtonElement>('[data-action="coach-skip"]')
    expect(skipBtn).not.toBeNull()
    expect(skipBtn?.textContent?.trim()).toBe('Skip guide')

    // Verify Best Pick tag is rendered on the suggested trump suit button
    const suggestedSuitBtn = document.querySelector<HTMLButtonElement>('.suit-button.coach-suggested')
    expect(suggestedSuitBtn).not.toBeNull()
    expect(suggestedSuitBtn?.querySelector('.coach-tag')?.textContent).toBe('Best Pick')
  })

  it('transitions from Step 1 to Step 2 when choosing trump suit and highlights playable cards', async () => {
    await import('../main.ts')

    document.querySelector<HTMLButtonElement>('[data-action="play"]')?.click()
    await vi.advanceTimersByTimeAsync(500)

    // Choose the suggested trump suit
    const suggestedSuitBtn = document.querySelector<HTMLButtonElement>('.suit-button.coach-suggested')
    expect(suggestedSuitBtn).not.toBeNull()
    suggestedSuitBtn?.click()

    // Advance deal animation
    await vi.advanceTimersByTimeAsync(200)

    // Coach banner should now show Step 2 (Lead a Trick)
    const banner = document.querySelector('.coach-banner')
    expect(banner).not.toBeNull()
    expect(banner?.querySelector('.coach-pill-badge')?.textContent).toBe('STEP 2/3')
    expect(banner?.querySelector('.coach-title')?.textContent).toContain('Lead a Trick')

    // Legal cards in player hand should pulse with coach-card-cue
    const cuedCards = document.querySelectorAll('.card.coach-card-cue')
    expect(cuedCards.length).toBeGreaterThan(0)
  })

  it('dismisses the coach overlay and writes completion to localStorage when clicking Skip guide', async () => {
    await import('../main.ts')

    document.querySelector<HTMLButtonElement>('[data-action="play"]')?.click()
    await vi.advanceTimersByTimeAsync(500)

    expect(document.querySelector('.coach-banner')).not.toBeNull()
    expect(window.localStorage.getItem('omi-coach-done')).toBeNull()

    const skipBtn = document.querySelector<HTMLButtonElement>('[data-action="coach-skip"]')
    expect(skipBtn).not.toBeNull()

    // Dispatch DOM click to skip guide
    skipBtn?.click()

    // Banner is immediately dismissed from DOM
    expect(document.querySelector('.coach-banner')).toBeNull()

    // Storage is updated with omi-coach-done = '1'
    expect(window.localStorage.getItem('omi-coach-done')).toBe('1')

    // Trump buttons and card elements no longer retain coach cue classes
    expect(document.querySelector('.coach-suggested')).toBeNull()
    expect(document.querySelector('.coach-tag')).toBeNull()
    expect(document.querySelectorAll('.coach-card-cue').length).toBe(0)
    expect(document.querySelectorAll('.coach-trump-cue').length).toBe(0)
  })

  it('persists coach completion across simulated page reloads', async () => {
    // Stage 1: Player completed / skipped coach in earlier session
    window.localStorage.setItem('omi-coach-done', '1')

    // Reload the application by re-importing main module
    await import('../main.ts')

    document.querySelector<HTMLButtonElement>('[data-action="play"]')?.click()
    await vi.advanceTimersByTimeAsync(500)

    // Gameplay table is active, but coach overlay remains dismissed
    expect(document.querySelector('.table')).not.toBeNull()
    expect(document.querySelector('.coach-banner')).toBeNull()
    expect(document.querySelector('.coach-suggested')).toBeNull()
    expect(document.querySelector('.coach-tag')).toBeNull()
  })

  it('keeps coach overlay active if reload occurs for fresh player with no saved completion', async () => {
    // Player is fresh (no omi-coach-done key)
    window.localStorage.removeItem('omi-coach-done')

    await import('../main.ts')

    document.querySelector<HTMLButtonElement>('[data-action="play"]')?.click()
    await vi.advanceTimersByTimeAsync(500)

    // Coach banner appears for first-time player
    expect(document.querySelector('.coach-banner')).not.toBeNull()
    expect(document.querySelector('.coach-pill-badge')?.textContent).toBe('STEP 1/3')
  })

  it('adopts coach completion dynamically when omi:cloud-hydrated is dispatched', async () => {
    await import('../main.ts')

    document.querySelector<HTMLButtonElement>('[data-action="play"]')?.click()
    await vi.advanceTimersByTimeAsync(500)

    expect(document.querySelector('.coach-banner')).not.toBeNull()

    // Simulate CrazyGames account sync hydrating omi-coach-done = '1'
    window.localStorage.setItem('omi-coach-done', '1')
    window.dispatchEvent(new CustomEvent('omi:cloud-hydrated'))

    // Advance clock and check that coach is dismissed
    await vi.advanceTimersByTimeAsync(50)
    expect(document.querySelector('.coach-banner')).toBeNull()
  })
})
