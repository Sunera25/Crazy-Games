import './style.css'
import { createDeck, rankValue, shuffleDeck, type Card, type Suit } from './game/deck.ts'
import { dealFirstBatch, dealSecondBatch, type PartialDeal } from './game/deal.ts'
import { chooseCard, chooseTrump } from './game/ai.ts'
import { isLegalCard, scoreRound, trickWinner, type PlayedCard, type Team, teamForPlayer } from './game/rules.ts'
import { gameplayStart, gameplayStop, initializeCrazyGames, loadingStart, loadingStop, loginWithCrazyGames } from './platform/crazygames.ts'
import { gdAdBreak, gdAdsEnabled, gdRewardedAd, initializeGameDistribution } from './platform/gamedistribution.ts'
import { soundManager } from './utils/sounds.ts'
import { storeGet, storeSet } from './utils/storage.ts'
import { createParticleEffectSVG, createPlayerAvatarSVG, getAvatarColor } from './utils/index.ts'
import { cardBackFanSVG, cardFaceSVG, suitIconSVG, tableSVG } from './utils/art.ts'
import { logoUrl } from './assets/omi-logo.ts'

const suitSymbols: Record<Suit, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }
const suitNames: Record<Suit, string> = { clubs: 'Clubs', diamonds: 'Diamonds', hearts: 'Hearts', spades: 'Spades' }
const suitOrder: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

let hands: Card[][] = []
let partialDeal: PartialDeal | null = null
let trumpSuit: Suit | null = null
let leadSuit: Suit | null = null
let selectedCard: Card | null = null
let trick: PlayedCard[] = []
let currentPlayer = 0
let tricksWon: Record<Team, number> = { northSouth: 0, eastWest: 0 }
let tokens: Record<Team, number> = { northSouth: 0, eastWest: 0 }
let message = 'Choose your trump suit'
let roundNumber = 0
let botTimer: number | null = null
let carry = 0
let matchOver = false
let roundFinished = false
let trumpCaller = 0
let playerNames = ['You', 'Nimal', 'Amaya', 'Kasun']
let rulesOpen = false
let dealAnim = false
let animatedPlays = 0
let trickWinnerSeat: number | null = null
let trickClosing = false
let scoreBump = false
let rewardPopup: 'hint' | 'second-chance' | null = null
let hintCard: Card | null = null
let hintUsedThisRound = false
let secondChanceUsed = false
let secondChanceAmount = 0

interface PlayerStats { played: number; won: number; streak: number; best: number; kapothis: number }
let stats: PlayerStats = loadStats()
let coachPending = loadCoachPending()

function loadStats(): PlayerStats {
  const empty: PlayerStats = { played: 0, won: 0, streak: 0, best: 0, kapothis: 0 }
  try {
    const raw = storeGet('omi-stats')
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<PlayerStats>) }
  } catch { /* fresh stats */ }
  return empty
}

function saveStats(): void {
  try {
    storeSet('omi-stats', JSON.stringify(stats))
  } catch { /* session only */ }
}

function loadCoachPending(): boolean {
  try {
    return storeGet('omi-coach-done') !== '1'
  } catch {
    return true
  }
}

function completeCoach(): void {
  coachPending = false
  try {
    storeSet('omi-coach-done', '1')
  } catch { /* session only */ }
}

function celebrate(): void {
  const layer = document.createElement('div')
  layer.className = 'confetti-layer'
  layer.setAttribute('aria-hidden', 'true')
  layer.innerHTML = createParticleEffectSVG('confetti')
  document.body.appendChild(layer)
  window.setTimeout(() => layer.remove(), 2600)
}

// --- Wallet & profile -------------------------------------------------------
// Coins and gems are earned only by playing (daily bonus, match rewards,
// Kapothi bonus) — CrazyGames in-game purchases are invite-only, so nothing
// here is sold for real money and the game stays fully playable for free:
// a player who cannot afford the entry fee simply plays the match free.
const ENTRY_FEE = 25
const WIN_COINS = 60
const LOSE_COINS = 10
const WIN_GEMS = 2
const DAILY_COINS = 100

const AVATAR_CHOICES = [
  { seed: 'You', style: 'saffron' },
  { seed: 'Amaya', style: 'rose' },
  { seed: 'Kasun', style: 'sky' },
  { seed: 'Tharushi', style: 'lavender' },
  { seed: 'Nimal', style: 'mint' },
  { seed: 'Dilshan', style: 'coral' }
]

interface Wallet { coins: number; gems: number; lastDaily: string }
interface Profile { name: string; avatar: number; nameCustomized: boolean }
let wallet: Wallet = loadWallet()
let profile: Profile = loadProfile()
let nameEditOpen = false

function loadWallet(): Wallet {
  const empty: Wallet = { coins: 100, gems: 0, lastDaily: '' }
  try {
    const raw = storeGet('omi-wallet')
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<Wallet>) }
  } catch { /* fresh wallet */ }
  return empty
}

function saveWallet(): void {
  storeSet('omi-wallet', JSON.stringify(wallet))
}

function loadProfile(): Profile {
  const empty: Profile = { name: 'Player', avatar: 0, nameCustomized: false }
  try {
    const raw = storeGet('omi-profile')
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<Profile>) }
  } catch { /* fresh profile */ }
  return empty
}

function saveProfile(): void {
  storeSet('omi-profile', JSON.stringify(profile))
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dailyAvailable(): boolean {
  return wallet.lastDaily !== todayKey()
}

function myAvatar(): { seed: string; style: string } {
  return AVATAR_CHOICES[profile.avatar] ?? AVATAR_CHOICES[0]
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return value.replace(/[&<>"']/g, (ch) => entities[ch] ?? ch)
}

// --- CrazyGames account -----------------------------------------------------
interface CgAccount { available: boolean; username: string | null; pictureUrl: string | null }
let cgAccount: CgAccount = { available: false, username: null, pictureUrl: null }

// The player's face: their CrazyGames profile picture when signed in,
// otherwise the character avatar they picked.
function playerAvatarMarkup(size: number): string {
  if (cgAccount.pictureUrl) return `<img class="cg-avatar-img" src="${escapeHtml(cgAccount.pictureUrl)}" width="${size}" height="${size}" alt="">`
  const c = myAvatar()
  return createPlayerAvatarSVG(c.seed, c.style, size)
}

function recordLine(): string {
  return stats.played > 0 ? `Won ${stats.won} of ${stats.played} matches${stats.best > 1 ? ` · Best streak ${stats.best}` : ''}${stats.kapothis > 0 ? ` · Kapothis ${stats.kapothis}` : ''}` : 'New player — welcome to the table!'
}

// CrazyGames Data module hydration: when the platform module adopts
// account-backed progress, reload the in-memory state and repaint the home
// screen in place (never a full refresh).
window.addEventListener('omi:cloud-hydrated', () => {
  stats = loadStats()
  wallet = loadWallet()
  profile = loadProfile()
  coachPending = loadCoachPending()
  paintHomeUI()
})

// CrazyGames account state: a signed-in player's username becomes their
// profile name (unless they chose one themselves) and their picture
// becomes the avatar, following the platform's account guidance.
window.addEventListener('omi:cg-account', (event) => {
  const detail = (event as CustomEvent<{ available: boolean; username: string | null; pictureUrl: string | null }>).detail
  cgAccount = { available: !!detail.available, username: detail.username ?? null, pictureUrl: detail.pictureUrl ?? null }
  if (cgAccount.username && !profile.nameCustomized) {
    profile = { ...profile, name: cgAccount.username.slice(0, 20) }
    saveProfile()
  }
  paintHomeUI()
})
const app = document.querySelector<HTMLDivElement>('#app')!

const botNamePool = ['Nimal', 'Amaya', 'Kasun', 'Dilshan', 'Sahan', 'Tharushi', 'Isuru', 'Chathura']

function shuffledBotNames(): string[] {
  const names = [...botNamePool]
  for (let index = names.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[names[index], names[swapIndex]] = [names[swapIndex], names[index]]
  }
  return names
}

function playerName(player: number): string {
  return playerNames[player]
}

function opponentMarkup(seat: number, side: string): string {
  const active = currentPlayer === seat && trumpSuit && !roundFinished ? 'active' : ''
  const count = hands[seat]?.length ?? 0
  return `<div class="opponent opponent-${side} ${active}"><span class="avatar">${createPlayerAvatarSVG(playerName(seat), getAvatarColor(playerName(seat)), 52)}</span><div><strong>${playerName(seat)}</strong><small>${seat === 2 ? 'PARTNER' : 'RIVAL'}</small></div>${cardBackFanSVG(count)}</div>`
}

function cardMarkup(card: Card, index: number): string {
  const legal = isLegalCard(hands[0], card, leadSuit)
  const selected = selectedCard?.suit === card.suit && selectedCard.rank === card.rank
  const hinted = hintCard?.suit === card.suit && hintCard?.rank === card.rank
  const colorClass = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : ''
  return `<button class="card ${colorClass} ${legal ? 'legal' : 'muted'} ${selected ? 'selected' : ''} ${hinted ? 'hint-glow' : ''} ${dealAnim ? 'dealing' : ''}" style="--i:${index}" data-card-index="${index}" ${legal ? '' : 'disabled'} aria-label="${card.rank} of ${suitNames[card.suit]}">${cardFaceSVG(card)}</button>`
}

function sortedHand(hand: readonly Card[]): Card[] {
  return [...hand].sort((left, right) => {
    const suitDifference = suitOrder.indexOf(left.suit) - suitOrder.indexOf(right.suit)
    if (suitDifference !== 0) return suitDifference
    return rankValue(right.rank) - rankValue(left.rank)
  })
}

function render(): void {
  const trumpLabel = trumpSuit ? `${suitSymbols[trumpSuit]} ${suitNames[trumpSuit]}` : 'Choose a trump suit'
  const showHintButton = gdAdsEnabled() && !!trumpSuit && currentPlayer === 0 && !roundFinished && !matchOver && !trickClosing && !hintUsedThisRound && !rewardPopup
  const coachText = !coachPending || rewardPopup || rulesOpen || roundFinished || matchOver ? '' :
    !trumpSuit && trumpCaller === 0
      ? 'First, choose your trump suit — pick the suit where your cards are strongest.'
      : trumpSuit && currentPlayer === 0
        ? trick.length === 0
          ? 'Your lead — tap any card to play it. The highest card of the led suit wins the trick, unless someone trumps in.'
          : 'Follow the led suit if you can — your playable cards are the bright ones.'
        : ''
  const coachMarkup = coachText ? `<div class="coach-tip"><span>💡 ${coachText}</span><button type="button" data-action="coach-skip">Skip tips</button></div>` : ''
  const legalHint = leadSuit ? `Follow ${suitSymbols[leadSuit]} ${suitNames[leadSuit]}` : 'Lead any card to begin'
  const trickMarkup = trick.map((played, i) => {
    const fresh = i >= animatedPlays ? 'fresh' : ''
    const win = trickWinnerSeat === played.player ? 'winner' : ''
    return `<div class="played-card seat-${played.player} ${fresh} ${win}" aria-label="${playerName(played.player)} played ${played.card.rank} of ${suitNames[played.card.suit]}">${cardFaceSVG(played.card)}</div>`
  }).join('')
  animatedPlays = trick.length
  const trickScoreMarkup = `<div class="trick-score"><span><b>We</b><strong class="${scoreBump ? 'bump' : ''}">${tricksWon.northSouth}</strong></span><span><b>Them</b><strong class="${scoreBump ? 'bump' : ''}">${tricksWon.eastWest}</strong></span></div>`
  app.innerHTML = `<main class="game-shell">
    <header class="topbar"><div class="brand-lockup"><img class="brand-logo" src="${logoUrl}" alt="Omi" width="64" height="64"><div><p class="eyebrow">TRICK-TAKER</p><h1>Omi</h1></div></div><div class="match-meta"><span class="round-label">ROUND ${String(roundNumber).padStart(2, '0')}</span><span class="match-score">You <strong>${tokens.northSouth}</strong> : <strong>${tokens.eastWest}</strong> Rivals</span></div><div class="topbar-actions"><span class="wallet-chip inline">🪙 ${wallet.coins} · 💎 ${wallet.gems}</span><button class="new-game-button" type="button" data-action="sound" aria-pressed="${soundManager.muted}">${soundManager.muted ? '🔇 Muted' : '🔊 Sound'}</button><button class="rules-button" type="button" data-action="rules" aria-expanded="${rulesOpen}">Rules</button><button class="new-game-button" type="button" data-action="new-game">New game</button></div></header>
    ${roundFinished || matchOver ? `<div class="result-banner ${matchOver ? 'match' : ''}"><strong>${message}</strong></div>` : ''}${coachMarkup}<section class="table" aria-label="Omi game table">${tableSVG()}<div class="table-glow"></div>${opponentMarkup(2, 'top')}${opponentMarkup(3, 'left')}${opponentMarkup(1, 'right')}<div class="trick-zone">${trickMarkup}</div>${trickScoreMarkup}${roundFinished || matchOver ? `<button class="primary-button table-continue" type="button" data-action="continue">${matchOver ? 'New game' : 'Continue'} <span>↗</span></button>` : ''}<div class="trump-panel"><span class="panel-label">TRUMP</span><strong>${trumpLabel}</strong><span class="carry-dot"></span></div><div class="player-panel"><div class="player-name ${currentPlayer === 0 && trumpSuit && !roundFinished ? 'active' : ''}"><span class="avatar">${playerAvatarMarkup(38)}</span><strong>${escapeHtml(profile.name)}</strong></div><div class="hand">${sortedHand(hands[0] ?? []).map(cardMarkup).join('')}</div></div></section>
    <section class="action-panel"><div class="action-copy"><span class="status-dot"></span><div><strong>${matchOver ? message : roundFinished ? message : trumpSuit ? (currentPlayer === 0 ? 'Your turn' : message) : (trumpCaller === 0 ? 'Choose your trump' : `${playerName(trumpCaller)} chooses trump`)}</strong><span>${matchOver ? 'Start a new match when you are ready.' : roundFinished ? 'The round is complete.' : trumpSuit ? `${trick.length}/4 cards in trick · ${legalHint}` : partialDeal ? 'Only the first four cards are dealt.' : 'Preparing the hand.'}</span></div></div><div class="suit-picker">${(['clubs', 'diamonds', 'hearts', 'spades'] as Suit[]).map((suit) => `<button class="suit-button ${trumpSuit === suit ? 'active' : ''}${suit === 'hearts' || suit === 'diamonds' ? ' suit-red' : ''}" data-suit="${suit}" type="button" ${trumpSuit || trumpCaller !== 0 || matchOver || roundFinished ? 'disabled' : ''}>${suitIconSVG(suit, 20)}${suitNames[suit]}</button>`).join('')}</div>${showHintButton ? '<button class="hint-button" type="button" data-action="hint">💡 Hint</button>' : ''}</section><p class="footer-note">FIRST TO 10 TOKENS WINS <span>•</span> KAPOTHI AWARDS 2${stats.played > 0 ? ` <span>•</span> MATCHES WON ${stats.won}/${stats.played}` : ''}</p>${rulesOpen ? rulesMarkup() : ''}${rewardPopup ? rewardPopupMarkup() : ''}</main>`
  dealAnim = false
  scoreBump = false

  app.querySelectorAll<HTMLButtonElement>('[data-suit]').forEach((button) => button.addEventListener('click', () => chooseHumanTrump(button.dataset.suit as Suit)))
  app.querySelectorAll<HTMLButtonElement>('[data-card-index]').forEach((button) => button.addEventListener('click', () => playHumanCard(Number(button.dataset.cardIndex))))
  app.querySelectorAll<HTMLButtonElement>('[data-action="new-game"]').forEach((button) => button.addEventListener('click', newMatch))
  app.querySelectorAll<HTMLButtonElement>('[data-action="sound"]').forEach((button) => button.addEventListener('click', () => { soundManager.toggleMute(); render() }))
  app.querySelectorAll<HTMLButtonElement>('[data-action="rules"]').forEach((button) => button.addEventListener('click', () => { rulesOpen = true; render() }))
  app.querySelectorAll<HTMLElement>('[data-action="close-rules"]').forEach((element) => element.addEventListener('click', (event) => { if (event.target === element || element.hasAttribute('data-rules-panel')) { rulesOpen = false; render() } }))
  app.querySelectorAll<HTMLButtonElement>('[data-action="continue"]').forEach((button) => button.addEventListener('click', () => {
    const proceed = () => {
      if (matchOver) newMatch()
      else {
        trumpCaller = (trumpCaller + 1) % 4
        startRound()
      }
    }
    void gdAdBreak('midroll').then(proceed)
  }))
  app.querySelectorAll<HTMLButtonElement>('[data-action="hint"]').forEach((button) => button.addEventListener('click', () => { rewardPopup = 'hint'; render() }))
  app.querySelectorAll<HTMLButtonElement>('[data-action="reward-watch"]').forEach((button) => button.addEventListener('click', () => { void watchRewardAd() }))
  app.querySelectorAll<HTMLButtonElement>('[data-action="reward-skip"]').forEach((button) => button.addEventListener('click', () => { rewardPopup = null; soundManager.play('click'); render() }))
  app.querySelectorAll<HTMLButtonElement>('[data-action="coach-skip"]').forEach((button) => button.addEventListener('click', () => { completeCoach(); render() }))
}

async function watchRewardAd(): Promise<void> {
  const kind = rewardPopup
  if (!kind) return
  rewardPopup = null
  render()
  const watched = await gdRewardedAd()
  if (kind === 'hint') {
    if (watched && trumpSuit) {
      hintCard = chooseCard(hands[0], trick, trumpSuit, 0)
      hintUsedThisRound = true
      message = 'The glowing card is the smart play'
      soundManager.play('win')
    } else if (!watched) {
      message = 'No ad available right now — the hint is still yours to claim'
    }
  } else if (watched) {
    tokens.eastWest = Math.max(0, tokens.eastWest - secondChanceAmount)
    message = `Second chance! The rivals' ${secondChanceAmount} token${secondChanceAmount === 1 ? '' : 's'} cancelled`
    soundManager.playSequence(['score', 'win'], 0.15)
  } else {
    message = 'No ad available right now — the score stands'
  }
  render()
}

function chooseHumanTrump(suit: Suit): void {
  if (trumpSuit || trumpCaller !== 0 || matchOver || roundFinished) return
  trumpSuit = suit
  soundManager.play('click')
  if (partialDeal) hands = dealSecondBatch(partialDeal)
  dealAnim = true
  message = 'Your turn to lead'
  currentPlayer = trumpCaller
  render()
  setTimeout(() => {
    soundManager.play('deal')
  }, 100)
  if (currentPlayer !== 0) scheduleBot()
}

function playHumanCard(index: number): void {
  if (matchOver || roundFinished || rewardPopup || !trumpSuit || currentPlayer !== 0 || trickClosing || !hands[0][index]) return
  const displayedCard = sortedHand(hands[0])[index]
  const handIndex = hands[0].findIndex((card) => card.suit === displayedCard.suit && card.rank === displayedCard.rank)
  if (handIndex >= 0) playCard(0, handIndex)
}

function playCard(player: number, handIndex: number): void {
  const card = hands[player].splice(handIndex, 1)[0]
  if (player === 0) {
    hintCard = null
    if (coachPending) completeCoach()
  }
  trick.push({ player, card })
  soundManager.play('play')
  leadSuit = trick[0].card.suit
  selectedCard = player === 0 ? card : selectedCard
  if (trick.length === 4) finishTrick()
  else { currentPlayer = (player + 1) % 4; message = currentPlayer === 0 ? 'Your turn' : `${playerName(currentPlayer)} is thinking`; render(); scheduleBot() }
}

function scheduleBot(): void {
  if (currentPlayer === 0 || !trumpSuit) return
  if (botTimer !== null) window.clearTimeout(botTimer)
  botTimer = window.setTimeout(() => {
    const card = chooseCard(hands[currentPlayer], trick, trumpSuit!, currentPlayer)
    const index = hands[currentPlayer].findIndex((candidate) => candidate.suit === card.suit && candidate.rank === card.rank)
    playCard(currentPlayer, index)
  }, 650)
}

function finishTrick(): void {
  const winner = trickWinner(trick, trumpSuit!)
  tricksWon[teamForPlayer(winner.player)] += 1
  currentPlayer = winner.player
  message = `${playerName(winner.player)} won the trick`
  const winnerTeam = teamForPlayer(winner.player)
  const playerTeam = teamForPlayer(0)
  soundManager.play(winnerTeam === playerTeam ? 'win' : 'lose')
  trickWinnerSeat = winner.player
  scoreBump = true
  trickClosing = true
  render()
  window.setTimeout(() => app.querySelector('.trick-zone')?.classList.add(`collect-${winner.player}`), 520)
  window.setTimeout(() => {
    trickClosing = false
    if (hands[0].length === 0) {
      finishRound()
      return
    }
    trick = []
    animatedPlays = 0
    trickWinnerSeat = null
    leadSuit = null
    selectedCard = null
    message = currentPlayer === 0 ? 'Your turn to lead' : `${playerName(currentPlayer)} leads`
    render()
    scheduleBot()
  }, 900)
}

function finishRound(): void {
  const result = scoreRound(tricksWon.northSouth, tricksWon.eastWest, carry, teamForPlayer(trumpCaller))
  carry = result.carry
  const tokensBefore = tokens.northSouth
  if (result.winner) tokens[result.winner] += result.tokens
  let kapothiGem = false
  if (result.isKapothi && result.winner === 'northSouth') {
    stats.kapothis += 1
    saveStats()
    wallet.gems += 1
    saveWallet()
    kapothiGem = true
  }
  const winnerLabel = result.winner === 'northSouth' ? 'Your team' : 'The rival team'
  message = result.winner ? `${winnerLabel} won ${result.tokens} token${result.tokens === 1 ? '' : 's'}${result.isKapothi ? ' · Kapothi!' : ''}` : '4–4 tie · one token carries over'
  if (result.winner === 'northSouth' && tokensBefore < 5 && tokens.northSouth >= 5) message += ' · Halfway to the match!'
  if (result.winner === 'northSouth' && tokensBefore < 9 && tokens.northSouth >= 9) message += ' · Match point!'
  if (kapothiGem) message += ' · +1 💎 Kapothi bonus'

  if (result.winner === 'northSouth') {
    soundManager.playSequence(['score', 'win'], 0.15)
  } else if (result.winner === 'eastWest') {
    soundManager.playSequence(['score', 'lose'], 0.15)
  } else {
    soundManager.play('score')
  }

  matchOver = tokens.northSouth >= 10 || tokens.eastWest >= 10
  roundFinished = true
  if (matchOver) {
    message = tokens.northSouth >= 10 ? 'You won the match!' : 'The rivals won the match'
    soundManager.playSequence(tokens.northSouth >= 10 ? ['win', 'win'] : ['lose', 'lose'], 0.2)
    gameplayStop()
    stats.played += 1
    if (tokens.northSouth >= 10) {
      stats.won += 1
      stats.streak += 1
      stats.best = Math.max(stats.best, stats.streak)
      wallet.coins += WIN_COINS
      wallet.gems += WIN_GEMS
      message += ` · +${WIN_COINS} 🪙 +${WIN_GEMS} 💎`
    } else {
      stats.streak = 0
      wallet.coins += LOSE_COINS
      message += ` · +${LOSE_COINS} 🪙`
    }
    saveStats()
    saveWallet()
  }
  if ((result.isKapothi && result.winner === 'northSouth') || (matchOver && tokens.northSouth >= 10)) celebrate()
  // GameDistribution rewarded offer: once per match, when the rivals score,
  // the player can watch an ad to cancel the tokens they just gained.
  if (!matchOver && gdAdsEnabled() && result.winner === 'eastWest' && !secondChanceUsed) {
    secondChanceUsed = true
    secondChanceAmount = result.tokens
    rewardPopup = 'second-chance'
  }
  render()
}

function startRound(): void {
  if (botTimer !== null) window.clearTimeout(botTimer)
  soundManager.play('shuffle')
  const deck = shuffleDeck(createDeck())
  partialDeal = dealFirstBatch(deck)
  hands = partialDeal.hands
  dealAnim = true
  trumpSuit = null; leadSuit = null; selectedCard = null; trick = []; animatedPlays = 0; trickWinnerSeat = null; trickClosing = false; currentPlayer = trumpCaller
  hintCard = null; hintUsedThisRound = false; rewardPopup = null
  roundFinished = false
  tricksWon = { northSouth: 0, eastWest: 0 }
  message = trumpCaller === 0 ? 'Choose your trump suit' : `${playerName(trumpCaller)} is choosing trump`
  roundNumber += 1
  render()
  if (trumpCaller !== 0) scheduleBotTrump()
}

function newMatch(): void {
  gameplayStart()
  soundManager.startMusic()
  if (wallet.coins >= ENTRY_FEE) wallet.coins -= ENTRY_FEE
  saveWallet()
  tokens = { northSouth: 0, eastWest: 0 }
  carry = 0
  secondChanceUsed = false
  matchOver = false
  trumpCaller = 0
  playerNames = ['You', ...shuffledBotNames().slice(0, 3)]
  startRound()
}

function scheduleBotTrump(): void {
  window.setTimeout(() => {
    if (trumpSuit || !partialDeal) return
    trumpSuit = chooseTrump(partialDeal.hands[trumpCaller])
    hands = dealSecondBatch(partialDeal)
    dealAnim = true
    currentPlayer = trumpCaller
    message = currentPlayer === 0 ? 'Your turn to lead' : `${playerName(currentPlayer)} leads`
    render()
    if (currentPlayer !== 0) scheduleBot()
  }, 750)
}

loadingStart()
showSplash()
loadingStop()
if (import.meta.env.MODE === 'gamedistribution') {
  void initializeGameDistribution()
} else {
  void initializeCrazyGames()
}

function openRules(): void {
  const splash = app.querySelector('.splash')
  if (!splash || splash.querySelector('.rules-backdrop')) return
  splash.insertAdjacentHTML('beforeend', rulesMarkup())
}

// Repaint the home screen's dynamic pieces (profile, wallet, daily bonus,
// login) in place — clicking around the home screen never rebuilds it, so
// nothing flashes or restarts its animations.
function paintHomeUI(): void {
  const splash = app.querySelector('.splash')
  if (!splash) return
  splash.querySelectorAll<HTMLElement>('.paint-avatar').forEach((el) => { el.innerHTML = playerAvatarMarkup(Number(el.dataset.size ?? 40)) })
  splash.querySelectorAll<HTMLElement>('.paint-name').forEach((el) => { el.textContent = profile.name })
  const walletEl = splash.querySelector('.paint-wallet')
  if (walletEl) walletEl.innerHTML = `<span class="wallet-chip">🪙 ${wallet.coins}</span><span class="wallet-chip gem">💎 ${wallet.gems}</span>`
  const dailyEl = splash.querySelector('.paint-daily')
  if (dailyEl) dailyEl.innerHTML = dailyAvailable() ? `<button class="daily-button" type="button" data-action="daily">🎁 Daily bonus · Claim +${DAILY_COINS} 🪙</button>` : `<p class="daily-done">🎁 Daily bonus claimed — come back tomorrow</p>`
  const entryEl = splash.querySelector('.paint-entry')
  if (entryEl) entryEl.textContent = wallet.coins >= ENTRY_FEE ? `Entry ${ENTRY_FEE} 🪙 · Win the match +${WIN_COINS} 🪙 +${WIN_GEMS} 💎` : `Not enough coins — this match is free · Win +${WIN_COINS} 🪙 +${WIN_GEMS} 💎`
  const loginEl = splash.querySelector('.paint-login')
  if (loginEl) loginEl.innerHTML = cgAccount.available && !cgAccount.username ? `<button class="cg-login-button" type="button" data-action="cg-login">Login with CrazyGames</button>` : ''
  const recordEl = splash.querySelector('.paint-record')
  if (recordEl) recordEl.textContent = recordLine()
  const nameBlock = splash.querySelector('.paint-name-block')
  if (nameBlock) {
    nameBlock.innerHTML = nameEditOpen
      ? `<div class="name-editor"><input id="profile-name-input" type="text" maxlength="16" value="${escapeHtml(profile.name)}" aria-label="Your name"><button type="button" data-action="save-name">Save</button></div>`
      : `<div class="profile-name-row panel-name"><strong>${escapeHtml(profile.name)}</strong>${cgAccount.username ? '' : '<button class="icon-button" type="button" data-action="edit-name" aria-label="Edit your name">✎</button>'}</div>${cgAccount.username ? '<p class="account-note">CrazyGames account</p>' : ''}`
  }
  const accountEl = splash.querySelector('.paint-account')
  if (accountEl) {
    accountEl.innerHTML = cgAccount.username
      ? `<p class="account-status">✓ Logged in as <strong>${escapeHtml(cgAccount.username)}</strong></p><p class="account-note">Your coins, gems and record save to your CrazyGames account.</p>`
      : cgAccount.available
        ? `<button class="cg-login-button wide" type="button" data-action="cg-login">Login with CrazyGames</button><p class="account-note">Login to save your coins, gems and record to your account — on every device.</p>`
        : `<p class="account-note">Playing as guest — progress saves on this device.</p>`
  }
  splash.querySelectorAll<HTMLButtonElement>('[data-avatar]').forEach((button) => button.classList.toggle('selected', Number(button.dataset.avatar ?? -1) === profile.avatar))
}

function showSplash(showRules = false): void {
  const suits = (['spades', 'hearts', 'clubs', 'diamonds'] as Suit[]).map((suit, i) => `<span class="splash-suit s${i}">${suitIconSVG(suit, 40)}</span>`).join('')
  nameEditOpen = false
  app.innerHTML = `<main class="splash">${suits}<div class="splash-top"><button class="profile-chip" type="button" data-action="profile"><span class="paint-avatar" data-size="40"></span><span class="paint-name chip-name"></span></button><div class="splash-top-right"><span class="paint-login"></span><button class="new-game-button" type="button" data-action="sound" aria-pressed="${soundManager.muted}">${soundManager.muted ? '🔇 Muted' : '🔊 Sound'}</button></div></div><div class="splash-inner"><img class="splash-logo" src="${logoUrl}" alt="Omi"><p class="splash-tag">The Sri Lankan trick-taking classic</p><div class="wallet-row paint-wallet"></div><div class="paint-daily"></div><button class="play-button" type="button" data-action="play">Play match</button><p class="entry-note paint-entry"></p><button class="splash-rules" type="button" data-action="how">How to play</button><p class="splash-foot">4 players · 2 teams · First to 10 tokens</p></div><div class="profile-backdrop" data-panel hidden><section class="profile-panel" role="dialog" aria-label="Your profile"><button class="panel-close" type="button" data-action="close-profile" aria-label="Close profile">✕</button><div class="panel-avatar paint-avatar" data-size="76"></div><div class="paint-name-block"></div><p class="profile-record paint-record"></p><p class="picker-label">Choose your avatar — it's free</p><div class="avatar-picker" role="group" aria-label="Choose your avatar">${AVATAR_CHOICES.map((c, i) => `<button type="button" class="avatar-choice" data-avatar="${i}" aria-label="Avatar ${i + 1}">${createPlayerAvatarSVG(c.seed, c.style, 50)}</button>`).join('')}</div><div class="paint-account account-box"></div></section></div></main>`
  const splash = app.querySelector('.splash')
  splash?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (target.hasAttribute('data-panel')) {
      target.hidden = true
      return
    }
    const avatarButton = target.closest<HTMLButtonElement>('[data-avatar]')
    if (avatarButton) {
      profile.avatar = Number(avatarButton.dataset.avatar ?? 0)
      saveProfile()
      soundManager.play('click')
      paintHomeUI()
      return
    }
    const el = target.closest<HTMLElement>('[data-action]')
    if (!el) return
    const action = el.dataset.action
    if (action === 'play') {
      soundManager.play('click')
      soundManager.startMusic()
      void gdAdBreak('preroll').then(() => {
        splash.classList.add('leaving')
        window.setTimeout(newMatch, 450)
      })
    } else if (action === 'profile') {
      const panel = splash.querySelector<HTMLElement>('[data-panel]')
      if (panel) panel.hidden = false
      soundManager.play('click')
    } else if (action === 'close-profile') {
      const panel = splash.querySelector<HTMLElement>('[data-panel]')
      if (panel) panel.hidden = true
    } else if (action === 'daily') {
      if (!dailyAvailable()) return
      wallet.coins += DAILY_COINS
      wallet.lastDaily = todayKey()
      saveWallet()
      soundManager.play('score')
      paintHomeUI()
    } else if (action === 'cg-login') {
      soundManager.play('click')
      void loginWithCrazyGames()
    } else if (action === 'edit-name') {
      nameEditOpen = true
      paintHomeUI()
      splash.querySelector<HTMLInputElement>('#profile-name-input')?.focus()
    } else if (action === 'save-name') {
      const input = splash.querySelector<HTMLInputElement>('#profile-name-input')
      const value = (input?.value ?? '').trim().slice(0, 16)
      profile.name = value || 'Player'
      profile.nameCustomized = true
      saveProfile()
      nameEditOpen = false
      soundManager.play('click')
      paintHomeUI()
    } else if (action === 'sound') {
      soundManager.toggleMute()
      el.setAttribute('aria-pressed', String(soundManager.muted))
      el.textContent = soundManager.muted ? '🔇 Muted' : '🔊 Sound'
    } else if (action === 'how') {
      openRules()
    } else if (action === 'close-rules') {
      if (event.target === el || el.hasAttribute('data-rules-panel')) el.closest('.rules-backdrop')?.remove()
    }
  })
  paintHomeUI()
  if (showRules) openRules()
}

function rewardPopupMarkup(): string {
  if (rewardPopup === 'hint') {
    return `<div class="reward-backdrop"><section class="reward-panel" role="dialog" aria-modal="true" aria-labelledby="reward-title"><p class="reward-kicker">FREE HINT</p><div class="reward-icon" aria-hidden="true">💡</div><h2 id="reward-title">Stuck on a card?</h2><p class="reward-text">Watch a short ad and we will highlight the smartest card to play this turn.</p><button class="primary-button reward-watch" type="button" data-action="reward-watch">▶ Watch Ad</button><button class="reward-skip" type="button" data-action="reward-skip">No thanks</button></section></div>`
  }
  return `<div class="reward-backdrop"><section class="reward-panel" role="dialog" aria-modal="true" aria-labelledby="reward-title"><p class="reward-kicker">SECOND CHANCE</p><div class="reward-icon" aria-hidden="true">⏪</div><h2 id="reward-title">The rivals took that round</h2><p class="reward-text">Watch a short ad to cancel the ${secondChanceAmount} token${secondChanceAmount === 1 ? '' : 's'} they just scored. One second chance per match.</p><button class="primary-button reward-watch" type="button" data-action="reward-watch">▶ Watch Ad</button><button class="reward-skip" type="button" data-action="reward-skip">No thanks</button></section></div>`
}

function rulesMarkup(): string {
  return `<div class="rules-backdrop" data-action="close-rules"><section class="rules-panel" role="dialog" aria-modal="true" aria-labelledby="rules-title" data-rules-panel><button class="rules-close" type="button" data-action="close-rules" aria-label="Close rules">×</button><p class="eyebrow">HOW TO PLAY</p><h2 id="rules-title">Omi rules</h2><div class="rules-grid"><div><h3>Deal and trump</h3><p>Four cards are dealt to each player first. The trump caller chooses a suit, then the remaining four cards are dealt.</p></div><div><h3>Play a trick</h3><p>Follow the led suit whenever possible. If you are void, play any card. The highest trump wins; otherwise, the highest card of the led suit wins.</p></div><div><h3>Ranks</h3><p>Ace is highest, followed by King, Queen, Jack, 10, 9, 8, and 7. Only these 32 cards are used.</p></div><div><h3>Scoring</h3><p>The caller's team earns 1 token for winning. The other team earns 2. A 4–4 tie carries 2 tokens to the next round.</p></div></div><p class="rules-goal">First team to reach 10 tokens wins. An 8-trick sweep is called Kapothi.</p></section></div>`
}
