package com.suneragames.omi.game

/** Faithful Kotlin port of src/game/ai.ts — the bot brain. */

fun chooseTrump(hand: List<Card>): Suit {
    val suitsInFirstAppearanceOrder = hand.map { it.suit }.distinct()
    return suitsInFirstAppearanceOrder.maxWithOrNull(
        compareBy(
            { suit: Suit -> hand.count { it.suit == suit } },
            { suit: Suit -> hand.filter { it.suit == suit }.sumOf { it.rank.value } },
        ),
    )!!
}

fun chooseCard(
    hand: List<Card>,
    trick: List<PlayedCard>,
    trumpSuit: Suit,
    player: Int,
): Card {
    val leadSuit = trick.firstOrNull()?.card?.suit
    val options = legalCards(hand, leadSuit)
    if (options.size == 1 || trick.isEmpty()) {
        return lowestRiskCard(options, trumpSuit, leading = trick.isEmpty())
    }
    val winningOption = options.find { card ->
        trickWinner(trick + PlayedCard(player, card), trumpSuit).player == player
    }
    return winningOption ?: lowestRiskCard(options, trumpSuit, leading = false)
}

private fun lowestRiskCard(cards: List<Card>, trumpSuit: Suit, leading: Boolean): Card {
    val comparator = Comparator<Card> { left, right ->
        val leftTrumpPenalty = if (left.suit == trumpSuit) 1 else 0
        val rightTrumpPenalty = if (right.suit == trumpSuit) 1 else 0
        when {
            leftTrumpPenalty != rightTrumpPenalty -> leftTrumpPenalty - rightTrumpPenalty
            leading && left.suit == trumpSuit -> right.rank.value - left.rank.value
            else -> left.rank.value - right.rank.value
        }
    }
    return cards.sortedWith(comparator).first()
}
