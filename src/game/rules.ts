import type { Card, Suit } from './deck.ts'
import { rankValue } from './deck.ts'

export type PlayedCard = {
  readonly player: number
  readonly card: Card
}

export type Team = 'northSouth' | 'eastWest'

export type RoundScore = {
  readonly winner: Team | null
  readonly tokens: number
  readonly carry: number
  readonly isKapothi: boolean
}

export function teamForPlayer(player: number): Team {
  return player % 2 === 0 ? 'northSouth' : 'eastWest'
}

export function legalCards(hand: readonly Card[], leadSuit: Suit | null): Card[] {
  if (leadSuit === null) return [...hand]

  const cardsOfLeadSuit = hand.filter((card) => card.suit === leadSuit)
  return cardsOfLeadSuit.length > 0 ? cardsOfLeadSuit : [...hand]
}

export function isLegalCard(hand: readonly Card[], card: Card, leadSuit: Suit | null): boolean {
  return legalCards(hand, leadSuit).some(
    (candidate) => candidate.suit === card.suit && candidate.rank === card.rank,
  )
}

export function trickWinner(trick: readonly PlayedCard[], trumpSuit: Suit): PlayedCard {
  if (trick.length === 0) throw new Error('A trick must contain at least one card')

  const leadSuit = trick[0].card.suit
  return trick.reduce((best, played) => {
    const bestIsTrump = best.card.suit === trumpSuit
    const playedIsTrump = played.card.suit === trumpSuit

    if (playedIsTrump !== bestIsTrump) return playedIsTrump ? played : best
    if (!playedIsTrump && played.card.suit !== leadSuit) return best
    if (!bestIsTrump && best.card.suit !== leadSuit) return played
    return rankValue(played.card.rank) > rankValue(best.card.rank) ? played : best
  }, trick[0])
}

export function scoreRound(
  northSouthTricks: number,
  eastWestTricks: number,
  carry: number,
  trumpCallerTeam: Team,
): RoundScore {
  if (northSouthTricks + eastWestTricks !== 8) {
    throw new Error('A round must contain eight tricks')
  }

  if (northSouthTricks === eastWestTricks) {
    return { winner: null, tokens: 0, carry: 1, isKapothi: false }
  }

  const winner: Team = northSouthTricks > eastWestTricks ? 'northSouth' : 'eastWest'
  const isKapothi = Math.max(northSouthTricks, eastWestTricks) === 8
  const tokens = carry > 0 ? 2 : winner === trumpCallerTeam ? 1 : 2

  return { winner, tokens, carry: 0, isKapothi }
}
