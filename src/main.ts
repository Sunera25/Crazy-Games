import './style.css'
import { createDeck, rankValue, shuffleDeck, type Card, type Suit } from './game/deck.ts'
import { dealFirstBatch, dealSecondBatch, type PartialDeal } from './game/deal.ts'
import { chooseCard, chooseTrump } from './game/ai.ts'
import { isLegalCard, scoreRound, trickWinner, type PlayedCard, type Team, teamForPlayer } from './game/rules.ts'
import { gameplayStart, gameplayStop, initializeCrazyGames, loadingStart, loadingStop } from './platform/crazygames.ts'
import { gdAdBreak, gdAdsEnabled, gdRewardedAd, initializeGameDistribution } from './platform/gamedistribution.ts'
import { soundManager } from './utils/sounds.ts'
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
    const raw = window.localStorage.getItem('omi-stats')
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<PlayerStats>) }
  } catch { /* fresh stats */ }
  return empty
}

function saveStats(): void {
  try {
    window.localStorage.setItem('omi-stats', JSON.stringify(stats))
  } catch { /* session only */ }
}

function loadCoachPending(): boolean {
  try {
    return window.localStorage.getItem('omi-coach-done') !== '1'
  } catch {
    return true
  }
}

function completeCoach(): void {
  coachPending = false
  try {
    window.localStorage.setItem('omi-coach-done', '1')
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
  const trickScoreMarkup = `<div class="trick-score"><span><b>You + ${playerName(2)}</b><strong class="${scoreBump ? 'bump' : ''}">${tricksWon.northSouth}</strong></span><span><b>${playerName(1)} + ${playerName(3)}</b><strong class="${scoreBump ? 'bump' : ''}">${tricksWon.eastWest}</strong></span></div>`
  app.innerHTML = `<main class="game-shell">
    <header class="topbar"><div class="brand-lockup"><img class="brand-logo" src="${logoUrl}" alt="Omi" width="64" height="64"><div><p class="eyebrow">TRICK-TAKER</p><h1>Omi</h1></div></div><div class="match-meta"><span class="round-label">ROUND ${String(roundNumber).padStart(2, '0')}</span><span class="match-score">You <strong>${tokens.northSouth}</strong> : <strong>${tokens.eastWest}</strong> Rivals</span></div><div class="topbar-actions"><div class="round-label">TRUMP CALLER · ${playerName(trumpCaller).toUpperCase()}</div><button class="new-game-button" type="button" data-action="sound" aria-pressed="${soundManager.muted}">${soundManager.muted ? '🔇 Muted' : '🔊 Sound'}</button><button class="rules-button" type="button" data-action="rules" aria-expanded="${rulesOpen}">Rules</button><button class="new-game-button" type="button" data-action="new-game">New game</button></div></header>
    ${roundFinished || matchOver ? `<div class="result-banner ${matchOver ? 'match' : ''}"><strong>${message}</strong></div>` : ''}${coachMarkup}<section class="table" aria-label="Omi game table">${tableSVG()}<div class="table-glow"></div>${opponentMarkup(2, 'top')}${opponentMarkup(3, 'left')}${opponentMarkup(1, 'right')}<div class="trick-zone">${trickMarkup}</div>${trickScoreMarkup}${roundFinished || matchOver ? `<button class="primary-button table-continue" type="button" data-action="continue">${matchOver ? 'New game' : 'Continue'} <span>↗</span></button>` : ''}<div class="trump-panel"><span class="panel-label">TRUMP</span><strong>${trumpLabel}</strong><span class="carry-dot"></span></div><div class="player-panel"><div class="player-name ${currentPlayer === 0 && trumpSuit && !roundFinished ? 'active' : ''}"><span class="avatar">${createPlayerAvatarSVG('You', getAvatarColor('You'), 38)}</span><strong>You</strong></div><div class="hand">${sortedHand(hands[0] ?? []).map(cardMarkup).join('')}</div></div></section>
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
  if (result.isKapothi && result.winner === 'northSouth') {
    stats.kapothis += 1
    saveStats()
  }
  const winnerLabel = result.winner === 'northSouth' ? 'Your team' : 'The rival team'
  message = result.winner ? `${winnerLabel} won ${result.tokens} token${result.tokens === 1 ? '' : 's'}${result.isKapothi ? ' · Kapothi!' : ''}` : '4–4 tie · one token carries over'
  if (result.winner === 'northSouth' && tokensBefore < 5 && tokens.northSouth >= 5) message += ' · Halfway to the match!'
  if (result.winner === 'northSouth' && tokensBefore < 9 && tokens.northSouth >= 9) message += ' · Match point!'

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
    } else {
      stats.streak = 0
    }
    saveStats()
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

function showSplash(showRules = false): void {
  const suits = (['spades', 'hearts', 'clubs', 'diamonds'] as Suit[]).map((suit, i) => `<span class="splash-suit s${i}">${suitIconSVG(suit, 40)}</span>`).join('')
  app.innerHTML = `<main class="splash">${suits}<button class="new-game-button splash-sound" type="button" data-action="sound" aria-pressed="${soundManager.muted}">${soundManager.muted ? '🔇 Muted' : '🔊 Sound'}</button><div class="splash-inner"><img class="splash-logo" src="${logoUrl}" alt="Omi"><p class="splash-tag">The Sri Lankan trick-taking classic</p>${stats.played > 0 ? `<p class="splash-stats">Matches won ${stats.won} of ${stats.played}${stats.best > 1 ? ` · Best streak ${stats.best}` : ''}${stats.kapothis > 0 ? ` · Kapothis ${stats.kapothis}` : ''}</p>` : ''}<button class="play-button" type="button" data-action="play">Play</button><button class="splash-rules" type="button" data-action="how">How to play</button><p class="splash-foot">4 players · 2 teams · First to 10 tokens</p></div>${showRules ? rulesMarkup() : ''}</main>`
  app.querySelector('[data-action="play"]')?.addEventListener('click', () => {
    soundManager.play('click')
    soundManager.startMusic()
    void gdAdBreak('preroll').then(() => {
      app.querySelector('.splash')?.classList.add('leaving')
      window.setTimeout(newMatch, 450)
    })
  })
  app.querySelector('[data-action="how"]')?.addEventListener('click', () => showSplash(true))
  app.querySelector('[data-action="sound"]')?.addEventListener('click', () => { soundManager.toggleMute(); showSplash(showRules) })
  app.querySelectorAll<HTMLElement>('[data-action="close-rules"]').forEach((element) => element.addEventListener('click', (event) => { if (event.target === element || element.hasAttribute('data-rules-panel')) showSplash(false) }))
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
