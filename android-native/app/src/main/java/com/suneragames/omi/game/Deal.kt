package com.suneragames.omi.game

/** Faithful Kotlin port of src/game/deal.ts — the two-stage Omi deal. */

class PartialDeal(val hands: List<List<Card>>, val remainingDeck: List<Card>)

fun dealFirstBatch(deck: List<Card>): PartialDeal {
    require(deck.size == 32) { "Omi uses a 32-card deck" }
    val hands = List(4) { mutableListOf<Card>() }
    deck.subList(0, 16).forEachIndexed { index, card -> hands[index % 4].add(card) }
    return PartialDeal(hands, deck.subList(16, deck.size).toList())
}

fun dealSecondBatch(partialDeal: PartialDeal): List<List<Card>> {
    val hands = partialDeal.hands.map { it.toMutableList() }
    partialDeal.remainingDeck.subList(0, 16).forEachIndexed { index, card ->
        hands[index % 4].add(card)
    }
    return hands
}
