import { describe, expect, it } from 'vitest'
import { createDeck, dealHands } from './deck.ts'
import { legalCards, scoreRound, trickWinner } from './rules.ts'

describe('Omi deck', () => {
  it('creates 32 cards and deals eight to each player', () => {
    const deck = createDeck()
    const hands = dealHands(deck)

    expect(deck).toHaveLength(32)
    expect(new Set(deck.map((card) => `${card.rank}-${card.suit}`)).size).toBe(32)
    expect(hands).toHaveLength(4)
    expect(hands.every((hand) => hand.length === 8)).toBe(true)
  })
})

describe('legal card play', () => {
  const hand = [
    { suit: 'hearts' as const, rank: 'A' as const },
    { suit: 'spades' as const, rank: '7' as const },
    { suit: 'clubs' as const, rank: 'K' as const },
  ]

  it('requires following the led suit when available', () => {
    expect(legalCards(hand, 'hearts')).toEqual([hand[0]])
  })

  it('allows any card when the player is void in the led suit', () => {
    expect(legalCards(hand, 'diamonds')).toEqual(hand)
  })
})

describe('trick resolution', () => {
  it('lets a low trump beat an off-suit ace', () => {
    const winner = trickWinner(
      [
        { player: 0, card: { suit: 'hearts', rank: 'A' } },
        { player: 1, card: { suit: 'spades', rank: '7' } },
        { player: 2, card: { suit: 'hearts', rank: 'K' } },
      ],
      'spades',
    )

    expect(winner.player).toBe(1)
  })

  it('uses the led suit when no trump is played', () => {
    const winner = trickWinner(
      [
        { player: 0, card: { suit: 'hearts', rank: '10' } },
        { player: 1, card: { suit: 'clubs', rank: 'A' } },
        { player: 2, card: { suit: 'hearts', rank: 'Q' } },
      ],
      'spades',
    )

    expect(winner.player).toBe(2)
  })
})

describe('round scoring', () => {
  it('awards one token for a majority', () => {
    expect(scoreRound(5, 3, 0, 'northSouth')).toEqual({
      winner: 'northSouth',
      tokens: 1,
      carry: 0,
      isKapothi: false,
    })
  })

  it('awards two tokens for Kapothi', () => {
    expect(scoreRound(8, 0, 0, 'northSouth').tokens).toBe(1)
    expect(scoreRound(0, 8, 0, 'northSouth').tokens).toBe(2)
  })

  it('carries a token from a 4-4 tie to the next winner', () => {
    expect(scoreRound(4, 4, 0, 'northSouth').carry).toBe(1)
    expect(scoreRound(6, 2, 1, 'eastWest').tokens).toBe(2)
  })
})
