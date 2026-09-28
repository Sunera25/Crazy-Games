import { describe, expect, it } from 'vitest'
import { createDeck, shuffleDeck } from './deck.ts'
import { dealFirstBatch, dealSecondBatch } from './deal.ts'

describe('Omi two-stage deal', () => {
  it('deals four cards first, then completes eight-card hands', () => {
    const first = dealFirstBatch(shuffleDeck(createDeck(), () => 0.5))

    expect(first.hands.every((hand) => hand.length === 4)).toBe(true)
    expect(first.remainingDeck).toHaveLength(16)
    expect(dealSecondBatch(first).every((hand) => hand.length === 8)).toBe(true)
  })
})