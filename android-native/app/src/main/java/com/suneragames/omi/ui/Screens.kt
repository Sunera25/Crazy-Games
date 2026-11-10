package com.suneragames.omi.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.suneragames.omi.game.Card
import com.suneragames.omi.game.PlayedCard
import com.suneragames.omi.game.Suit

val FeltDark = Color(0xFF071F1B)
val Felt = Color(0xFF0B2E27)
val TableGreen = Color(0xFF20534B)
val Gold = Color(0xFFD4AF37)
val GoldBright = Color(0xFFF3DC82)
val Paper = Color(0xFFD7E2D9)
val Muted = Color(0xFFA7C0B4)
val CardRed = Color(0xFFC0392B)
val CardBlack = Color(0xFF1B2A24)

// ---------------- Home ----------------

@Composable
fun HomeScreen(vm: GameViewModel) {
    Column(
        modifier = Modifier.fillMaxSize().background(Felt).padding(20.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(Color(0x9903120C))
                    .clickable { vm.showNameEditor = true }
                    .padding(horizontal = 10.dp, vertical = 6.dp),
            ) {
                AvatarCircle(vm.playerName, 30.dp, active = false)
                Spacer(Modifier.width(8.dp))
                Text(vm.playerName, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            TextButton(onClick = { vm.toggleMute() }) {
                Text(if (vm.muted) "🔇" else "🔊", fontSize = 18.sp)
            }
        }

        Column(
            modifier = Modifier.fillMaxWidth().weight(1f),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text("OMI", color = GoldBright, fontSize = 64.sp, fontWeight = FontWeight.Bold)
            Text("Sri Lanka's partnership card game", color = Paper, fontSize = 14.sp)
            Spacer(Modifier.height(18.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                WalletChip("🪙", vm.coins)
                WalletChip("💎", vm.gems)
            }
            Spacer(Modifier.height(22.dp))
            Button(
                onClick = { vm.playPressed() },
                colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = CardBlack),
                shape = RoundedCornerShape(999.dp),
                modifier = Modifier.height(54.dp).padding(horizontal = 12.dp),
            ) {
                Text("▶  Play match", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(8.dp))
            Text("Entry ${GameViewModel.ENTRY_FEE} 🪙 · Win +${GameViewModel.WIN_COINS} 🪙", color = Muted, fontSize = 12.sp)
            Spacer(Modifier.height(10.dp))
            TextButton(onClick = { vm.showRules = true }) {
                Text("How to play", color = GoldBright, fontSize = 15.sp)
            }
            if (vm.played > 0) {
                Spacer(Modifier.height(6.dp))
                Text(
                    "Matches won ${vm.won}/${vm.played} · Kapothis ${vm.kapothis}",
                    color = Muted,
                    fontSize = 12.sp,
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Button(
                onClick = { vm.claimDaily() },
                enabled = !vm.dailyClaimed,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF14532D),
                    contentColor = Color.White,
                    disabledContainerColor = Color(0x33000000),
                    disabledContentColor = Muted,
                ),
                shape = RoundedCornerShape(999.dp),
            ) {
                Text(if (vm.dailyClaimed) "✓ Daily bonus claimed" else "🎁 Daily bonus +100 🪙", fontSize = 13.sp)
            }
            Text("First to 10 tokens wins", color = Muted, fontSize = 11.sp)
        }
    }

    if (vm.showRules) RulesDialog { vm.showRules = false }
    if (vm.showNameEditor) NameDialog(vm)
    if (vm.showBroke) BrokeDialog(vm)
}

@Composable
fun WalletChip(icon: String, amount: Int) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(Color(0x9903120C))
            .border(1.dp, Color(0x55D4AF37), RoundedCornerShape(999.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Text(icon, fontSize = 14.sp)
        Spacer(Modifier.width(6.dp))
        Text(amount.toString(), color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun RulesDialog(onClose: () -> Unit) {
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("How to play Omi") },
        text = {
            Text(
                "You and your AI partner (across the table) face two rivals.\n\n" +
                    "• Everyone gets 4 cards, the trump caller picks a trump suit, then 4 more cards are dealt.\n" +
                    "• Follow the lead suit if you can. The highest card of the lead suit wins the trick — unless a trump is played.\n" +
                    "• Win more tricks than the other team to score tokens. Win all 8 tricks for a Kapothi!\n" +
                    "• First team to 10 tokens wins the match.",
            )
        },
        confirmButton = { TextButton(onClick = onClose) { Text("Got it") } },
    )
}

@Composable
fun NameDialog(vm: GameViewModel) {
    var name by remember { mutableStateOf(vm.playerName) }
    AlertDialog(
        onDismissRequest = { vm.showNameEditor = false },
        title = { Text("Your name") },
        text = {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                singleLine = true,
                label = { Text("Name") },
            )
        },
        confirmButton = { TextButton(onClick = { vm.savePlayerName(name) }) { Text("Save") } },
        dismissButton = { TextButton(onClick = { vm.showNameEditor = false }) { Text("Cancel") } },
    )
}

@Composable
fun BrokeDialog(vm: GameViewModel) {
    AlertDialog(
        onDismissRequest = { vm.showBroke = false },
        title = { Text("You're out of coins!") },
        text = {
            Text(
                if (vm.rescueAvailable) {
                    "A match costs ${GameViewModel.ENTRY_FEE} 🪙. Claim today's rescue to get back in."
                } else {
                    "A match costs ${GameViewModel.ENTRY_FEE} 🪙. Today's rescue is used — the daily bonus refills you tomorrow."
                },
            )
        },
        confirmButton = {
            TextButton(onClick = { vm.claimRescue() }, enabled = vm.rescueAvailable) {
                Text("Claim +100 🪙")
            }
        },
        dismissButton = { TextButton(onClick = { vm.showBroke = false }) { Text("Not now") } },
    )
}

// ---------------- Match ----------------

@Composable
fun MatchScreen(vm: GameViewModel) {
    Column(
        modifier = Modifier.fillMaxSize().background(Felt).padding(12.dp),
    ) {
        // Top bar: score with token pips + actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            TokenScore("You", vm.tokensNS, GoldBright)
            WalletChip("🪙", vm.coins)
            TokenScore("Rivals", vm.tokensEW, Color(0xFFF0A35E))
        }
        Spacer(Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                BarButton("🏠 Home") { vm.goHome() }
                BarButton("↻ New") { vm.startNewMatchFromTable() }
            }
            TextButton(onClick = { vm.toggleMute() }) {
                Text(if (vm.muted) "🔇" else "🔊", fontSize = 16.sp)
            }
        }

        // Table
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(24.dp))
                .background(TableGreen)
                .border(2.dp, Color(0xFF35675D), RoundedCornerShape(24.dp))
                .padding(10.dp),
        ) {
            // Partner (seat 2), top centre
            Box(Modifier.align(Alignment.TopCenter)) {
                SeatView(vm, seat = 2)
            }
            // Rivals: seat 1 left, seat 3 right
            Box(Modifier.align(Alignment.CenterStart)) {
                SeatView(vm, seat = 1)
            }
            Box(Modifier.align(Alignment.CenterEnd)) {
                SeatView(vm, seat = 3)
            }
            // Centre: trump chip + current trick
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                val trump = vm.trumpSuit
                if (trump != null) {
                    Text(
                        "Trump ${trump.symbol}",
                        color = if (trump.isRed) Color(0xFFFF9D8A) else GoldBright,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(999.dp))
                            .background(Color(0x66000000))
                            .padding(horizontal = 10.dp, vertical = 3.dp),
                    )
                    Spacer(Modifier.height(8.dp))
                }
                TrickZone(vm.trick, vm.trickWinnerSeat)
            }
        }

        Spacer(Modifier.height(8.dp))
        // Status / action panel
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                vm.message,
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )
            Text(
                "Round ${vm.roundNumber} · Tricks — We ${vm.tricksNS} · Them ${vm.tricksEW}" +
                    if (vm.trumpSuit != null && vm.currentPlayer == 0 && !vm.roundFinished) " · Your turn" else "",
                color = Muted,
                fontSize = 12.sp,
            )
            Spacer(Modifier.height(6.dp))
            when {
                vm.awaitingHumanTrump -> {
                    Text("Choose your trump", color = GoldBright, fontSize = 13.sp)
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        for (suit in Suit.entries) {
                            Button(
                                onClick = { vm.chooseHumanTrump(suit) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF0F3A2F),
                                    contentColor = if (suit.isRed) Color(0xFFFF9D8A) else Color.White,
                                ),
                                shape = RoundedCornerShape(12.dp),
                            ) {
                                Text("${suit.symbol} ${suit.label}", fontSize = 13.sp)
                            }
                        }
                    }
                }
                vm.roundFinished -> {
                    Button(
                        onClick = { vm.continuePressed() },
                        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = CardBlack),
                        shape = RoundedCornerShape(999.dp),
                        modifier = Modifier.height(46.dp),
                    ) {
                        Text(
                            if (vm.matchOver) "New game" else "Continue",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(6.dp))
        // Human hand
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("You", color = GoldBright, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            val hand = vm.sortedHand(vm.hands.getOrElse(0) { emptyList() })
            val step = if (hand.size > 6) 40 else 48
            Box(
                modifier = Modifier.height(86.dp).fillMaxWidth(),
                contentAlignment = Alignment.Center,
            ) {
                Box(modifier = Modifier.width(((hand.size - 1).coerceAtLeast(0) * step + 58).dp).height(86.dp)) {
                    hand.forEachIndexed { i, card ->
                        val legal = vm.isHumanTurn && vm.isLegal(card)
                        val dimmed = vm.trumpSuit != null && !vm.roundFinished && !legal
                        PlayingCard(
                            card = card,
                            modifier = Modifier
                                .offset(x = (i * step).dp)
                                .zIndex(i.toFloat())
                                .alpha(if (dimmed) 0.55f else 1f),
                            enabled = legal,
                            onClick = { vm.playHumanCard(card) },
                        )
                    }
                }
            }
        }
    }

    if (vm.showBroke) BrokeDialog(vm)
}

@Composable
fun BarButton(label: String, onClick: () -> Unit) {
    TextButton(onClick = onClick) {
        Text(label, color = Paper, fontSize = 13.sp)
    }
}

@Composable
fun TokenScore(label: String, tokens: Int, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("$label $tokens", color = color, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
            repeat(10) { i ->
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(if (i < tokens) Gold else Color(0x33FFFFFF)),
                )
            }
        }
    }
}

@Composable
fun SeatView(vm: GameViewModel, seat: Int) {
    val name = vm.playerName(seat)
    val active = vm.currentPlayer == seat && vm.trumpSuit != null && !vm.roundFinished
    val winner = vm.trickWinnerSeat == seat
    val count = vm.hands.getOrElse(seat) { emptyList() }.size
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(Color(0xB303120C))
            .border(
                1.dp,
                if (active || winner) Gold else Color(0x33D4AF37),
                RoundedCornerShape(999.dp),
            )
            .padding(horizontal = 10.dp, vertical = 5.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AvatarCircle(name, 26.dp, active = active || winner)
            Spacer(Modifier.width(6.dp))
            Column {
                Text(name, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(
                    if (seat == 2) "PARTNER" else "RIVAL",
                    color = Muted,
                    fontSize = 8.sp,
                )
            }
        }
        if (count > 0) {
            Spacer(Modifier.height(2.dp))
            Text("🂠 × $count", color = Muted, fontSize = 10.sp)
        }
    }
}

@Composable
fun AvatarCircle(name: String, size: androidx.compose.ui.unit.Dp, active: Boolean) {
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(if (active) Gold else Color(0xFF7F2D3A))
            .border(1.dp, if (active) GoldBright else Color(0x55FFFFFF), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            name.take(1).uppercase(),
            color = if (active) CardBlack else Color.White,
            fontSize = (size.value * 0.45).sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
fun TrickZone(trick: List<PlayedCard>, winnerSeat: Int?) {
    Box(modifier = Modifier.size(190.dp, 150.dp)) {
        for (played in trick) {
            val (x, y) = when (played.player) {
                0 -> 62 to 78
                2 -> 62 to 0
                1 -> 0 to 38
                else -> 124 to 38
            }
            PlayingCard(
                card = played.card,
                modifier = Modifier.offset(x = x.dp, y = y.dp),
                enabled = false,
                winner = winnerSeat == played.player,
                onClick = {},
            )
        }
    }
}

@Composable
fun PlayingCard(
    card: Card,
    modifier: Modifier = Modifier,
    enabled: Boolean,
    winner: Boolean = false,
    onClick: () -> Unit,
) {
    val suitColor = if (card.suit.isRed) CardRed else CardBlack
    Box(
        modifier = modifier
            .size(56.dp, 78.dp)
            .clip(RoundedCornerShape(7.dp))
            .background(Color.White)
            .border(
                if (winner) 3.dp else 1.dp,
                if (winner) Gold else Color(0xFFCCCCCC),
                RoundedCornerShape(7.dp),
            )
            .clickable(enabled = enabled) { onClick() }
            .padding(4.dp),
    ) {
        Column {
            Text(card.rank.label, color = suitColor, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Text(card.suit.symbol, color = suitColor, fontSize = 12.sp)
        }
        Text(
            card.suit.symbol,
            color = suitColor,
            fontSize = 26.sp,
            modifier = Modifier.align(Alignment.Center),
        )
    }
}

val Suit.isRed: Boolean
    get() = this == Suit.DIAMONDS || this == Suit.HEARTS
