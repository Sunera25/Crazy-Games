import type { Card } from './deck.ts'

export type PartialDeal = {
  hands: Card[][]
  remainingDeck: Card[]
}

export function dealFirstBatch(deck: readonly Card[]): PartialDeal {
  if (deck.length !== 32) throw new Error('Omi uses a 32-card deck')

  const hands = Array.from({ length: 4 }, () => [] as Card[])
  deck.slice(0, 16).forEach((card, index) => hands[index % 4].push(card))
  return { hands, remainingDeck: [...deck.slice(16)] }
}

export function dealSecondBatch(partialDeal: PartialDeal): Card[][] {
  const hands = partialDeal.hands.map((hand) => [...hand])
  partialDeal.remainingDeck.slice(0, 16).forEach((card, index) => hands[index % 4].push(card))
  return hands
}
