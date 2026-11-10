package com.suneragames.omi.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.suneragames.omi.game.Card
import com.suneragames.omi.game.PartialDeal
import com.suneragames.omi.game.PlayedCard
import com.suneragames.omi.game.Suit
import com.suneragames.omi.game.Team
import com.suneragames.omi.game.chooseCard
import com.suneragames.omi.game.chooseTrump
import com.suneragames.omi.game.createDeck
import com.suneragames.omi.game.dealFirstBatch
import com.suneragames.omi.game.dealSecondBatch
import com.suneragames.omi.game.isLegalCard
import com.suneragames.omi.game.scoreRound
import com.suneragames.omi.game.shuffleDeck
import com.suneragames.omi.game.teamForPlayer
import com.suneragames.omi.game.trickWinner
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class Screen { HOME, MATCH }

/**
 * The match state machine, ported from the web build's src/main.ts flow:
 * two-stage deal, trump caller rotates each round and leads the first
 * trick, bots act after short delays, tokens race to 10.
 */
class GameViewModel(app: Application) : AndroidViewModel(app) {
    val prefs = Prefs(app)
    val sound = SoundEngine()

    var screen by mutableStateOf(Screen.HOME)

    // Wallet / profile (mirrored to Prefs on every change)
    var coins by mutableStateOf(prefs.coins)
    var gems by mutableStateOf(prefs.gems)
    var playerName by mutableStateOf(prefs.playerName)
    var muted by mutableStateOf(prefs.muted)
    var played by mutableStateOf(prefs.played)
    var won by mutableStateOf(prefs.won)
    var kapothis by mutableStateOf(prefs.kapothis)

    var showBroke by mutableStateOf(false)
    var showRules by mutableStateOf(false)
    var showNameEditor by mutableStateOf(false)

    // Match state
    var hands by mutableStateOf<List<List<Card>>>(emptyList())
    var trick by mutableStateOf<List<PlayedCard>>(emptyList())
    var trumpSuit by mutableStateOf<Suit?>(null)
    var trumpCaller by mutableStateOf(0)
    var currentPlayer by mutableStateOf(0)
    var tokensNS by mutableStateOf(0)
    var tokensEW by mutableStateOf(0)
    var tricksNS by mutableStateOf(0)
    var tricksEW by mutableStateOf(0)
    var message by mutableStateOf("")
    var trickWinnerSeat by mutableStateOf<Int?>(null)
    var roundFinished by mutableStateOf(false)
    var matchOver by mutableStateOf(false)
    var roundNumber by mutableStateOf(0)
    var playerNames by mutableStateOf(listOf("You", "Nimal", "Amaya", "Kasun"))

    private var carry = 0
    private var trickClosing = false
    private var partial: PartialDeal? = null
    private var flowToken = 0

    init {
        sound.muted = muted
    }

    companion object {
        const val ENTRY_FEE = 25
        const val WIN_COINS = 60
        const val LOSE_COINS = 10
        private val BOT_POOL = listOf(
            "Nimal", "Amaya", "Kasun", "Dilshan", "Sahan", "Tharushi", "Isuru", "Chathura",
        )
        private val SUIT_ORDER = listOf(Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES)
    }

    fun sortedHand(hand: List<Card>): List<Card> =
        hand.sortedWith(compareBy({ SUIT_ORDER.indexOf(it.suit) }, { -it.rank.value }))

    fun playerName(seat: Int): String = playerNames.getOrElse(seat) { "Player" }

    val isHumanTurn: Boolean
        get() = screen == Screen.MATCH && trumpSuit != null && currentPlayer == 0 &&
            !roundFinished && !matchOver && !trickClosing

    val awaitingHumanTrump: Boolean
        get() = screen == Screen.MATCH && trumpSuit == null && trumpCaller == 0 &&
            !roundFinished && !matchOver

    fun isLegal(card: Card): Boolean {
        if (hands.isEmpty()) return false
        return isLegalCard(hands[0], card, trick.firstOrNull()?.card?.suit)
    }

    // ---------- Home / economy ----------

    fun playPressed() {
        sound.click()
        if (coins < ENTRY_FEE) {
            showBroke = true
            return
        }
        newMatch()
    }

    fun claimDaily(): Boolean {
        if (prefs.lastDaily == prefs.todayKey()) return false
        prefs.lastDaily = prefs.todayKey()
        setCoins(coins + 100)
        sound.score()
        return true
    }

    val dailyClaimed: Boolean get() = prefs.lastDaily == prefs.todayKey()
    val rescueAvailable: Boolean get() = prefs.lastRescue != prefs.todayKey()

    fun claimRescue() {
        if (!rescueAvailable) return
        prefs.lastRescue = prefs.todayKey()
        setCoins(coins + 100)
        sound.score()
        showBroke = false
        if (coins >= ENTRY_FEE) newMatch()
    }

    fun savePlayerName(name: String) {
        val clean = name.trim().take(16)
        if (clean.isNotEmpty()) {
            playerName = clean
            prefs.playerName = clean
        }
        showNameEditor = false
    }

    fun toggleMute() {
        muted = !muted
        prefs.muted = muted
        sound.muted = muted
        sound.applyMusicVolume()
    }

    // ---------- Match flow ----------

    private fun newMatch() {
        screen = Screen.MATCH
        sound.startMusic(getApplication())
        if (coins >= ENTRY_FEE) setCoins(coins - ENTRY_FEE)
        tokensNS = 0
        tokensEW = 0
        carry = 0
        matchOver = false
        trumpCaller = 0
        roundNumber = 0
        playerNames = listOf("You") + BOT_POOL.shuffled().take(3)
        startRound()
    }

    fun startNewMatchFromTable() {
        if (coins < ENTRY_FEE) {
            showBroke = true
            return
        }
        newMatch()
    }

    private fun startRound() {
        flowToken++
        sound.shuffle()
        val deck = shuffleDeck(createDeck())
        val deal = dealFirstBatch(deck)
        partial = deal
        hands = deal.hands
        trumpSuit = null
        trick = emptyList()
        trickWinnerSeat = null
        trickClosing = false
        currentPlayer = trumpCaller
        roundFinished = false
        tricksNS = 0
        tricksEW = 0
        roundNumber += 1
        message = if (trumpCaller == 0) {
            "Choose your trump suit"
        } else {
            "${playerName(trumpCaller)} is choosing trump"
        }
        if (trumpCaller != 0) scheduleBotTrump()
    }

    fun chooseHumanTrump(suit: Suit) {
        if (!awaitingHumanTrump) return
        val deal = partial ?: return
        trumpSuit = suit
        sound.click()
        hands = dealSecondBatch(deal)
        sound.deal()
        currentPlayer = trumpCaller
        message = "Your turn to lead"
    }

    private fun scheduleBotTrump() {
        val token = flowToken
        val caller = trumpCaller
        viewModelScope.launch {
            delay(750)
            if (token != flowToken) return@launch
            val deal = partial ?: return@launch
            if (trumpSuit != null) return@launch
            trumpSuit = chooseTrump(deal.hands[caller])
            hands = dealSecondBatch(deal)
            sound.deal()
            currentPlayer = caller
            message = if (currentPlayer == 0) {
                "Your turn to lead"
            } else {
                "${playerName(currentPlayer)} leads"
            }
            if (currentPlayer != 0) scheduleBot()
        }
    }

    fun playHumanCard(card: Card) {
        if (!isHumanTurn) return
        val index = hands[0].indexOfFirst { it.suit == card.suit && it.rank == card.rank }
        if (index >= 0) playCard(0, index)
    }

    private fun playCard(player: Int, handIndex: Int) {
        val card = hands[player][handIndex]
        hands = hands.mapIndexed { i, hand ->
            if (i == player) hand.toMutableList().apply { removeAt(handIndex) } else hand
        }
        trick = trick + PlayedCard(player, card)
        sound.play()
        if (trick.size == 4) {
            finishTrick()
        } else {
            currentPlayer = (player + 1) % 4
            message = if (currentPlayer == 0) {
                "Your turn"
            } else {
                "${playerName(currentPlayer)} is thinking"
            }
            if (currentPlayer != 0) scheduleBot()
        }
    }

    private fun scheduleBot() {
        if (currentPlayer == 0 || trumpSuit == null) return
        val token = flowToken
        viewModelScope.launch {
            delay(650)
            if (token != flowToken) return@launch
            if (currentPlayer == 0 || trumpSuit == null) return@launch
            val player = currentPlayer
            val card = chooseCard(hands[player], trick, trumpSuit!!, player)
            val index = hands[player].indexOfFirst {
                it.suit == card.suit && it.rank == card.rank
            }
            if (index >= 0) playCard(player, index)
        }
    }

    private fun finishTrick() {
        val winner = trickWinner(trick, trumpSuit!!)
        if (teamForPlayer(winner.player) == Team.NORTH_SOUTH) tricksNS++ else tricksEW++
        currentPlayer = winner.player
        trickWinnerSeat = winner.player
        message = "${playerName(winner.player)} won the trick"
        if (teamForPlayer(winner.player) == Team.NORTH_SOUTH) sound.win() else sound.lose()
        trickClosing = true
        val token = flowToken
        viewModelScope.launch {
            delay(1100)
            if (token != flowToken) return@launch
            trickClosing = false
            if (hands[0].isEmpty()) {
                finishRound()
                return@launch
            }
            trick = emptyList()
            trickWinnerSeat = null
            message = if (currentPlayer == 0) {
                "Your turn to lead"
            } else {
                "${playerName(currentPlayer)} leads"
            }
            if (currentPlayer != 0) scheduleBot()
        }
    }

    private fun finishRound() {
        val result = scoreRound(tricksNS, tricksEW, carry, teamForPlayer(trumpCaller))
        carry = result.carry
        val tokensBefore = tokensNS
        if (result.winner == Team.NORTH_SOUTH) tokensNS += result.tokens
        if (result.winner == Team.EAST_WEST) tokensEW += result.tokens
        if (result.isKapothi && result.winner == Team.NORTH_SOUTH) {
            kapothis += 1
            prefs.kapothis = kapothis
            setGems(gems + 1)
        }
        message = when (result.winner) {
            Team.NORTH_SOUTH ->
                "Your team won ${result.tokens} token${if (result.tokens == 1) "" else "s"}" +
                    if (result.isKapothi) " · Kapothi!" else ""
            Team.EAST_WEST ->
                "The rival team won ${result.tokens} token${if (result.tokens == 1) "" else "s"}" +
                    if (result.isKapothi) " · Kapothi!" else ""
            null -> "4–4 tie · one token carries over"
        }
        if (result.winner == Team.NORTH_SOUTH && tokensBefore < 5 && tokensNS >= 5) {
            message += " · Halfway to the match!"
        }
        if (result.winner == Team.NORTH_SOUTH && tokensBefore < 9 && tokensNS >= 9) {
            message += " · Match point!"
        }
        if (result.isKapothi && result.winner == Team.NORTH_SOUTH) message += " · +1 💎 Kapothi bonus"
        if (result.winner == Team.NORTH_SOUTH) sound.win() else if (result.winner == Team.EAST_WEST) sound.lose() else sound.score()

        matchOver = tokensNS >= 10 || tokensEW >= 10
        roundFinished = true
        trick = trick // keep the last trick visible behind the result
        if (matchOver) {
            val youWon = tokensNS >= 10
            message = if (youWon) "You won the match!" else "The rivals won the match"
            played += 1
            prefs.played = played
            if (youWon) {
                won += 1
                prefs.won = won
                prefs.streak = prefs.streak + 1
                prefs.best = maxOf(prefs.best, prefs.streak)
                setCoins(coins + WIN_COINS)
                message += " · +$WIN_COINS 🪙"
                sound.win()
            } else {
                prefs.streak = 0
                setCoins(coins + LOSE_COINS)
                message += " · +$LOSE_COINS 🪙"
                sound.lose()
            }
        }
    }

    fun continuePressed() {
        sound.click()
        if (matchOver) {
            if (coins < ENTRY_FEE) {
                showBroke = true
                return
            }
            newMatch()
        } else {
            trumpCaller = (trumpCaller + 1) % 4
            startRound()
        }
    }

    fun goHome() {
        flowToken++
        sound.stopMusic()
        sound.click()
        screen = Screen.HOME
    }

    private fun setCoins(value: Int) {
        coins = value
        prefs.coins = value
    }

    private fun setGems(value: Int) {
        gems = value
        prefs.gems = value
    }
}
