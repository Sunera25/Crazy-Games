export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'] as const
export type Suit = (typeof SUITS)[number]

export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const
export type Rank = (typeof RANKS)[number]

export type Card = {
  readonly suit: Suit
  readonly rank: Rank
}

const rankValues: Record<Rank, number> = {
  '7': 0,
  '8': 1,
  '9': 2,
  '10': 3,
  J: 4,
  Q: 5,
  K: 6,
  A: 7,
}

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })))
}

export function rankValue(rank: Rank): number {
  return rankValues[rank]
}

export function cardId(card: Card): string {
  return `${card.rank}-${card.suit}`
}

export function shuffleDeck(deck: readonly Card[], random: () => number = Math.random): Card[] {
  const shuffled = [...deck]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

export function dealHands(deck: readonly Card[], playerCount = 4): Card[][] {
  if (deck.length !== 32 || playerCount !== 4) {
    throw new Error('Omi uses a 32-card deck and four players')
  }

  const hands = Array.from({ length: playerCount }, () => [] as Card[])
  deck.forEach((card, index) => hands[index % playerCount].push(card))
  return hands
}
