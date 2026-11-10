package com.suneragames.omi.game

/** Faithful Kotlin port of src/game/rules.ts. */

data class PlayedCard(val player: Int, val card: Card)

enum class Team { NORTH_SOUTH, EAST_WEST }

data class RoundScore(
    val winner: Team?,
    val tokens: Int,
    val carry: Int,
    val isKapothi: Boolean,
)

fun teamForPlayer(player: Int): Team =
    if (player % 2 == 0) Team.NORTH_SOUTH else Team.EAST_WEST

fun legalCards(hand: List<Card>, leadSuit: Suit?): List<Card> {
    if (leadSuit == null) return hand.toList()
    val ofLeadSuit = hand.filter { it.suit == leadSuit }
    return if (ofLeadSuit.isNotEmpty()) ofLeadSuit else hand.toList()
}

fun isLegalCard(hand: List<Card>, card: Card, leadSuit: Suit?): Boolean =
    legalCards(hand, leadSuit).any { it.suit == card.suit && it.rank == card.rank }

fun trickWinner(trick: List<PlayedCard>, trumpSuit: Suit): PlayedCard {
    require(trick.isNotEmpty()) { "A trick must contain at least one card" }
    val leadSuit = trick[0].card.suit
    return trick.reduce { best, played ->
        val bestIsTrump = best.card.suit == trumpSuit
        val playedIsTrump = played.card.suit == trumpSuit
        when {
            playedIsTrump != bestIsTrump -> if (playedIsTrump) played else best
            !playedIsTrump && played.card.suit != leadSuit -> best
            !bestIsTrump && best.card.suit != leadSuit -> played
            else -> if (played.card.rank.value > best.card.rank.value) played else best
        }
    }
}

fun scoreRound(
    northSouthTricks: Int,
    eastWestTricks: Int,
    carry: Int,
    trumpCallerTeam: Team,
): RoundScore {
    require(northSouthTricks + eastWestTricks == 8) { "A round must contain eight tricks" }
    if (northSouthTricks == eastWestTricks) {
        return RoundScore(winner = null, tokens = 0, carry = 1, isKapothi = false)
    }
    val winner = if (northSouthTricks > eastWestTricks) Team.NORTH_SOUTH else Team.EAST_WEST
    val isKapothi = maxOf(northSouthTricks, eastWestTricks) == 8
    val tokens = if (carry > 0) 2 else if (winner == trumpCallerTeam) 1 else 2
    return RoundScore(winner = winner, tokens = tokens, carry = 0, isKapothi = isKapothi)
}
