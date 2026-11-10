package com.suneragames.omi.game

import kotlin.random.Random

/** Faithful Kotlin port of src/game/deck.ts — same deck, order and shuffle. */

enum class Suit(val label: String, val symbol: String) {
    CLUBS("Clubs", "♣"),
    DIAMONDS("Diamonds", "♦"),
    HEARTS("Hearts", "♥"),
    SPADES("Spades", "♠"),
}

enum class Rank(val label: String, val value: Int) {
    SEVEN("7", 0),
    EIGHT("8", 1),
    NINE("9", 2),
    TEN("10", 3),
    JACK("J", 4),
    QUEEN("Q", 5),
    KING("K", 6),
    ACE("A", 7),
}

data class Card(val suit: Suit, val rank: Rank) {
    val id: String get() = "${rank.name}-${suit.name}"
    val isRed: Boolean get() = suit == Suit.DIAMONDS || suit == Suit.HEARTS
}

fun createDeck(): List<Card> =
    Suit.entries.flatMap { suit -> Rank.entries.map { rank -> Card(suit, rank) } }

fun shuffleDeck(deck: List<Card>, random: Random = Random.Default): List<Card> {
    val shuffled = deck.toMutableList()
    for (index in shuffled.size - 1 downTo 1) {
        val swapIndex = (random.nextDouble() * (index + 1)).toInt()
        val tmp = shuffled[index]
        shuffled[index] = shuffled[swapIndex]
        shuffled[swapIndex] = tmp
    }
    return shuffled
}

fun dealHands(deck: List<Card>, playerCount: Int = 4): List<List<Card>> {
    require(deck.size == 32 && playerCount == 4) { "Omi uses a 32-card deck and four players" }
    val hands = List(playerCount) { mutableListOf<Card>() }
    deck.forEachIndexed { index, card -> hands[index % playerCount].add(card) }
    return hands
}
