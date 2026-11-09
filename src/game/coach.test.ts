import { describe, expect, it } from 'vitest'
import type { Card } from './deck.ts'
import type { PlayedCard } from './rules.ts'
import {
  COACH_STORAGE_KEY,
  completeCoachStorage,
  formatTrickWinSummary,
  getCoachCardCue,
  getCoachStepInfo,
  loadCoachPending,
  suggestTrumpForCoach,
} from './coach.ts'

describe('Coach - Saved Completion & State Persistence', () => {
  it('returns pending (true) when storage is empty or uninitialized', () => {
    const mockStorage = new Map<string, string>()
    const isPending = loadCoachPending((key) => mockStorage.get(key) ?? null)
    expect(isPending).toBe(true)
  })

  it('returns not pending (false) once omi-coach-done is marked as 1', () => {
    const mockStorage = new Map<string, string>([[COACH_STORAGE_KEY, '1']])
    const isPending = loadCoachPending((key) => mockStorage.get(key) ?? null)
    expect(isPending).toBe(false)
  })

  it('saves completion to storage correctly', () => {
    const mockStorage = new Map<string, string>()
    completeCoachStorage((key, val) => mockStorage.set(key, val))
    expect(mockStorage.get(COACH_STORAGE_KEY)).toBe('1')

    const isPending = loadCoachPending((key) => mockStorage.get(key) ?? null)
    expect(isPending).toBe(false)
  })

  it('suppresses coach step markup once coach is completed', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: false,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: null,
      trumpCaller: 0,
      playerHand: [{ suit: 'spades', rank: 'A' }],
      currentPlayer: 0,
      leadSuit: null,
      trickLength: 0,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
    })
    expect(stepInfo).toBeNull()
  })
})

describe('Coach - Trump Selection (Step 1)', () => {
  const initialFourCards: Card[] = [
    { suit: 'spades', rank: 'A' },
    { suit: 'spades', rank: 'K' },
    { suit: 'spades', rank: '10' },
    { suit: 'hearts', rank: '7' },
  ]

  it('suggests the strongest suit from the player initial 4 cards', () => {
    const suggested = suggestTrumpForCoach(initialFourCards)
    expect(suggested).toBe('spades')
  })

  it('provides Step 1 coach instructions with best pick suit when player is caller', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: null,
      trumpCaller: 0,
      playerHand: initialFourCards,
      currentPlayer: 0,
      leadSuit: null,
      trickLength: 0,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
    })

    expect(stepInfo).not.toBeNull()
    expect(stepInfo?.step).toBe(1)
    expect(stepInfo?.title).toBe('Choose Your Trump Suit')
    expect(stepInfo?.suggestedTrumpSuit).toBe('spades')
    expect(stepInfo?.text).toContain('♠ Spades')
    expect(stepInfo?.text).toContain('Trump cards beat every other suit')
  })

  it('provides Step 1 waiting prompt when an opponent is trump caller', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: null,
      trumpCaller: 1,
      playerHand: initialFourCards,
      currentPlayer: 0,
      leadSuit: null,
      trickLength: 0,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
      getPlayerName: (p) => (p === 1 ? 'Kasun' : 'You'),
    })

    expect(stepInfo?.step).toBe(1)
    expect(stepInfo?.title).toBe('Trump Selection')
    expect(stepInfo?.text).toContain('Kasun is choosing the trump suit')
  })
})

describe('Coach - Legal Follow-Suit Cards & Visual Cues (Step 2)', () => {
  const playerHand: Card[] = [
    { suit: 'hearts', rank: 'A' },
    { suit: 'hearts', rank: '9' },
    { suit: 'diamonds', rank: 'K' },
    { suit: 'clubs', rank: '7' },
  ]

  it('applies coach-card-cue to legal cards when following suit', () => {
    const cue = getCoachCardCue({
      coachPending: true,
      isPlayerTurn: true,
      isLegal: true,
      isVoidInLead: false,
      isTrump: false,
      roundFinished: false,
    })
    expect(cue).toBe('coach-card-cue')
  })

  it('does not apply any cue to illegal cards', () => {
    const cue = getCoachCardCue({
      coachPending: true,
      isPlayerTurn: true,
      isLegal: false,
      isVoidInLead: false,
      isTrump: false,
      roundFinished: false,
    })
    expect(cue).toBe('')
  })

  it('does not apply cues when it is not the human player turn', () => {
    const cue = getCoachCardCue({
      coachPending: true,
      isPlayerTurn: false,
      isLegal: true,
      isVoidInLead: false,
      isTrump: false,
      roundFinished: false,
    })
    expect(cue).toBe('')
  })

  it('instructs the player to follow the led suit with gold pulsing border', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: 'spades',
      trumpCaller: 0,
      playerHand,
      currentPlayer: 0,
      leadSuit: 'hearts',
      trickLength: 1,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
    })

    expect(stepInfo?.step).toBe(2)
    expect(stepInfo?.title).toBe('Follow Suit (Hearts)')
    expect(stepInfo?.text).toContain('You must follow the led suit')
    expect(stepInfo?.text).toContain('♥ Hearts')
  })

  it('instructs player when leading a trick', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: 'spades',
      trumpCaller: 0,
      playerHand,
      currentPlayer: 0,
      leadSuit: null,
      trickLength: 0,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
    })

    expect(stepInfo?.step).toBe(2)
    expect(stepInfo?.title).toBe('Lead a Trick')
    expect(stepInfo?.text).toContain('Your turn to lead')
  })
})

describe('Coach - Void-Hand Trump Cues (Step 2)', () => {
  const voidHandWithTrump: Card[] = [
    { suit: 'spades', rank: 'J' }, // Trump
    { suit: 'spades', rank: '8' }, // Trump
    { suit: 'diamonds', rank: 'A' },
  ]

  it('applies coach-trump-cue (electric blue pulse) to trump cards when void in led suit', () => {
    const cue = getCoachCardCue({
      coachPending: true,
      isPlayerTurn: true,
      isLegal: true,
      isVoidInLead: true,
      isTrump: true,
      roundFinished: false,
    })
    expect(cue).toBe('coach-trump-cue')
  })

  it('applies standard coach-card-cue to non-trump discards when void in led suit', () => {
    const cue = getCoachCardCue({
      coachPending: true,
      isPlayerTurn: true,
      isLegal: true,
      isVoidInLead: true,
      isTrump: false,
      roundFinished: false,
    })
    expect(cue).toBe('coach-card-cue')
  })

  it('guides player to cut with trump or discard when void in led suit', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: 'spades',
      trumpCaller: 0,
      playerHand: voidHandWithTrump,
      currentPlayer: 0,
      leadSuit: 'hearts', // void in hearts
      trickLength: 2,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
    })

    expect(stepInfo?.step).toBe(2)
    expect(stepInfo?.title).toContain('Void in Hearts! (Trump Opportunity)')
    expect(stepInfo?.text).toContain('Play a <strong>Trump (♠ Spades)</strong> card to cut and win')
  })

  it('informs player of safe discard when void in led suit and holds no trumps', () => {
    const voidHandNoTrump: Card[] = [
      { suit: 'diamonds', rank: 'A' },
      { suit: 'clubs', rank: 'K' },
    ]

    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: 'spades',
      trumpCaller: 0,
      playerHand: voidHandNoTrump,
      currentPlayer: 0,
      leadSuit: 'hearts',
      trickLength: 1,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: false,
      matchOver: false,
    })

    expect(stepInfo?.step).toBe(2)
    expect(stepInfo?.title).toContain('Void in Hearts!')
    expect(stepInfo?.text).toContain('You can safely discard any card')
  })
})

describe('Coach - Trick Wins & Explanations (Step 3)', () => {
  it('formats trump win explanation over an off-suit lead', () => {
    const winner: PlayedCard = {
      player: 2,
      card: { suit: 'spades', rank: 'J' },
    }
    const ledCard: Card = { suit: 'hearts', rank: 'A' }
    const trumpSuit = 'spades'

    const summary = formatTrickWinSummary(winner, ledCard, trumpSuit, (p) => (p === 2 ? 'Amaya' : 'You'))
    expect(summary).toBe('Amaya took the trick: Trumped with J of Spades (Trump beats led suit!)')
  })

  it('formats highest led suit win explanation when no trump was played', () => {
    const winner: PlayedCard = {
      player: 0,
      card: { suit: 'hearts', rank: 'A' },
    }
    const ledCard: Card = { suit: 'hearts', rank: '9' }
    const trumpSuit = 'spades'

    const summary = formatTrickWinSummary(winner, ledCard, trumpSuit, (p) => (p === 0 ? 'You' : 'Opponent'))
    expect(summary).toBe('You took the trick: Highest Hearts (A of Hearts)')
  })

  it('shows Step 3 Trick Winner Decided banner during trick resolution', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: 'spades',
      trumpCaller: 0,
      playerHand: [],
      currentPlayer: 0,
      leadSuit: 'hearts',
      trickLength: 4,
      trickClosing: true,
      lastTrickSummary: 'You took the trick: Trumped with J of Spades (Trump beats led suit!)',
      roundFinished: false,
      matchOver: false,
    })

    expect(stepInfo?.step).toBe(3)
    expect(stepInfo?.title).toBe('Trick Winner Decided')
    expect(stepInfo?.text).toContain('🏆 You took the trick')
    expect(stepInfo?.text).toContain('The trick winner leads the next trick.')
  })

  it('shows Step 3 Round Complete banner when round finishes', () => {
    const stepInfo = getCoachStepInfo({
      coachPending: true,
      rewardPopup: false,
      rulesOpen: false,
      trumpSuit: 'spades',
      trumpCaller: 0,
      playerHand: [],
      currentPlayer: 0,
      leadSuit: null,
      trickLength: 0,
      trickClosing: false,
      lastTrickSummary: null,
      roundFinished: true,
      matchOver: false,
    })

    expect(stepInfo?.step).toBe(3)
    expect(stepInfo?.title).toBe('Round Complete — Scoring Tokens')
    expect(stepInfo?.text).toContain('First team to 10 tokens wins the match!')
  })
})
