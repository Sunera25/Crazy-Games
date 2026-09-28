import { describe, expect, it } from 'vitest'
import { chooseCard, chooseTrump } from './ai.ts'
import type { Card } from './deck.ts'
import { isLegalCard } from './rules.ts'

describe('Omi AI', () => {
  const hand: Card[] = [
    { suit: 'hearts', rank: 'A' },
    { suit: 'spades', rank: '7' },
    { suit: 'clubs', rank: 'K' },
  ]

  it('chooses the suit with the most cards as trump', () => {
    expect(chooseTrump([...hand, { suit: 'hearts', rank: '7' }])).toBe('hearts')
  })

  it('always returns a legal card', () => {
    const choice = chooseCard(hand, [{ player: 0, card: { suit: 'hearts', rank: '10' } }], 'spades', 1)
    expect(isLegalCard(hand, choice, 'hearts')).toBe(true)
  })
})
