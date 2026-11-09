import type { Card, Suit } from './deck.ts'
import type { PlayedCard } from './rules.ts'
import { chooseTrump } from './ai.ts'

export const COACH_STORAGE_KEY = 'omi-coach-done'

export const SUIT_NAMES: Record<Suit, string> = {
  clubs: 'Clubs',
  diamonds: 'Diamonds',
  hearts: 'Hearts',
  spades: 'Spades',
}

export const SUIT_SYMBOLS: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

export function loadCoachPending(getter: (key: string) => string | null): boolean {
  try {
    return getter(COACH_STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

export function completeCoachStorage(setter: (key: string, value: string) => void): void {
  try {
    setter(COACH_STORAGE_KEY, '1')
  } catch {
    // Session fallback
  }
}

export function suggestTrumpForCoach(hand: readonly Card[]): Suit | null {
  if (!hand || hand.length === 0) return null
  return chooseTrump(hand)
}

export type CardCueType = 'coach-trump-cue' | 'coach-card-cue' | ''

export function getCoachCardCue(params: {
  coachPending: boolean
  isPlayerTurn: boolean
  isLegal: boolean
  isVoidInLead: boolean
  isTrump: boolean
  roundFinished: boolean
}): CardCueType {
  const { coachPending, isPlayerTurn, isLegal, isVoidInLead, isTrump, roundFinished } = params
  if (!coachPending || !isPlayerTurn || !isLegal || roundFinished) {
    return ''
  }
  if (isVoidInLead && isTrump) {
    return 'coach-trump-cue'
  }
  return 'coach-card-cue'
}

export function formatTrickWinSummary(
  winner: PlayedCard,
  ledCard: Card,
  trumpSuit: Suit,
  getPlayerName: (player: number) => string = (p) => (p === 0 ? 'You' : `Player ${p + 1}`),
): string {
  const winnerName = getPlayerName(winner.player)
  const isTrumpWin = winner.card.suit === trumpSuit && ledCard.suit !== trumpSuit
  const winReason = isTrumpWin
    ? `Trumped with ${winner.card.rank} of ${SUIT_NAMES[winner.card.suit]} (Trump beats led suit!)`
    : `Highest ${SUIT_NAMES[ledCard.suit]} (${winner.card.rank} of ${SUIT_NAMES[winner.card.suit]})`
  return `${winnerName} took the trick: ${winReason}`
}

export type CoachState = {
  coachPending: boolean
  rewardPopup: boolean
  rulesOpen: boolean
  trumpSuit: Suit | null
  trumpCaller: number
  playerHand: readonly Card[]
  currentPlayer: number
  leadSuit: Suit | null
  trickLength: number
  trickClosing: boolean
  lastTrickSummary: string | null
  roundFinished: boolean
  matchOver: boolean
  matchMessage?: string
  getPlayerName?: (player: number) => string
}

export type CoachStepInfo = {
  step: number
  title: string
  text: string
  suggestedTrumpSuit: Suit | null
}

export function getCoachStepInfo(state: CoachState): CoachStepInfo | null {
  const {
    coachPending,
    rewardPopup,
    rulesOpen,
    trumpSuit,
    trumpCaller,
    playerHand,
    currentPlayer,
    leadSuit,
    trickLength,
    trickClosing,
    lastTrickSummary,
    roundFinished,
    matchOver,
    matchMessage = '',
    getPlayerName = (p) => (p === 0 ? 'You' : `Player ${p + 1}`),
  } = state

  if (!coachPending || rewardPopup || rulesOpen) {
    return null
  }

  const suggestedTrump =
    !trumpSuit && trumpCaller === 0 && playerHand.length > 0 ? suggestTrumpForCoach(playerHand) : null

  if (!trumpSuit && trumpCaller === 0) {
    const suggestedText = suggestedTrump ? `${SUIT_SYMBOLS[suggestedTrump]} ${SUIT_NAMES[suggestedTrump]}` : ''
    return {
      step: 1,
      title: 'Choose Your Trump Suit',
      text: `Select your strongest suit from your first 4 cards. Trump cards beat every other suit in the game! We suggest <strong>${suggestedText}</strong>.`,
      suggestedTrumpSuit: suggestedTrump,
    }
  }

  if (!trumpSuit && trumpCaller !== 0) {
    return {
      step: 1,
      title: 'Trump Selection',
      text: `${getPlayerName(trumpCaller)} is choosing the trump suit for this round...`,
      suggestedTrumpSuit: null,
    }
  }

  if (trickClosing && lastTrickSummary) {
    return {
      step: 3,
      title: 'Trick Winner Decided',
      text: `🏆 ${lastTrickSummary}. The trick winner leads the next trick.`,
      suggestedTrumpSuit: null,
    }
  }

  if (roundFinished) {
    return {
      step: 3,
      title: 'Round Complete — Scoring Tokens',
      text: 'Round finished! The team with 5 or more tricks wins match tokens. First team to 10 tokens wins the match!',
      suggestedTrumpSuit: null,
    }
  }

  if (matchOver) {
    return {
      step: 3,
      title: 'Match Finished',
      text: matchMessage,
      suggestedTrumpSuit: null,
    }
  }

  if (currentPlayer === 0) {
    if (trickLength === 0) {
      return {
        step: 2,
        title: 'Lead a Trick',
        text: 'Your turn to lead! Tap any card to start the trick. All other players must follow this suit if they have it.',
        suggestedTrumpSuit: null,
      }
    }

    const hasLead = leadSuit ? playerHand.some((c) => c.suit === leadSuit) : false
    if (hasLead && leadSuit) {
      return {
        step: 2,
        title: `Follow Suit (${SUIT_NAMES[leadSuit]})`,
        text: `You must follow the led suit (<strong>${SUIT_SYMBOLS[leadSuit]} ${SUIT_NAMES[leadSuit]}</strong>)! Playable cards are pulsing with a gold border.`,
        suggestedTrumpSuit: null,
      }
    }

    if (leadSuit) {
      const hasTrump = trumpSuit ? playerHand.some((c) => c.suit === trumpSuit) : false
      const voidText = hasTrump
        ? `You have no ${SUIT_NAMES[leadSuit]} cards! Play a <strong>Trump (${SUIT_SYMBOLS[trumpSuit!]} ${SUIT_NAMES[trumpSuit!]})</strong> card to cut and win, or discard any other card.`
        : `You have no ${SUIT_NAMES[leadSuit]} cards! You can safely discard any card.`

      return {
        step: 2,
        title: `Void in ${SUIT_NAMES[leadSuit]}! (Trump Opportunity)`,
        text: voidText,
        suggestedTrumpSuit: null,
      }
    }
  }

  return {
    step: 2,
    title: 'Trick in Progress',
    text: `${getPlayerName(currentPlayer)} is playing... Watch which card wins the trick.`,
    suggestedTrumpSuit: null,
  }
}
