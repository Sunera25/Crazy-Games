import type { Card, Suit } from './deck.ts'
import { rankValue } from './deck.ts'
import { legalCards, trickWinner, type PlayedCard } from './rules.ts'

export function chooseTrump(hand: readonly Card[]): Suit {
  const counts = new Map<Suit, number>()
  hand.forEach((card) => counts.set(card.suit, (counts.get(card.suit) ?? 0) + 1))

  return [...counts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) return right[1] - left[1]
    const leftStrength = hand.filter((card) => card.suit === left[0]).reduce((sum, card) => sum + rankValue(card.rank), 0)
    const rightStrength = hand.filter((card) => card.suit === right[0]).reduce((sum, card) => sum + rankValue(card.rank), 0)
    return rightStrength - leftStrength
  })[0][0]
}

export function chooseCard(
  hand: readonly Card[],
  trick: readonly PlayedCard[],
  trumpSuit: Suit,
  player: number,
): Card {
  const leadSuit = trick[0]?.card.suit ?? null
  const options = legalCards(hand, leadSuit)
  if (options.length === 1 || trick.length === 0) return lowestRiskCard(options, trumpSuit, trick.length === 0)

  const winningOption = options.find((card) => trickWinner([...trick, { player, card }], trumpSuit).player === player)
  return winningOption ?? lowestRiskCard(options, trumpSuit, false)
}

function lowestRiskCard(cards: readonly Card[], trumpSuit: Suit, leading: boolean): Card {
  return [...cards].sort((left, right) => {
    const leftTrumpPenalty = left.suit === trumpSuit ? 1 : 0
    const rightTrumpPenalty = right.suit === trumpSuit ? 1 : 0
    if (leftTrumpPenalty !== rightTrumpPenalty) return leftTrumpPenalty - rightTrumpPenalty
    if (leading && left.suit === trumpSuit) return rankValue(right.rank) - rankValue(left.rank)
    return rankValue(left.rank) - rankValue(right.rank)
  })[0]
}
