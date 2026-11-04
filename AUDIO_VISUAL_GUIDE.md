# Audio & Visual Enhancements Quick Guide

## 🎵 Sound Effects

### Sound Design Philosophy
All sounds are **synthesized procedurally** using the Web Audio API - no audio files needed! This keeps the game lightweight while providing rich audio feedback.

### Sound Types & Triggers

| Sound | Frequency | When It Plays | Duration | Feel |
|-------|-----------|-----------------|----------|------|
| 🔘 **click** | 500 Hz | Trump suit selected | 80ms | Sharp, button-like |
| 🎴 **deal** | 400 Hz | Cards dealt after trump | 100ms | Soft, whoosh |
| 🎯 **play** | 600 Hz | Any card played | 150ms | Clear, decisive |
| ✨ **shuffle** | 450 Hz | Round starts | 120ms | Swishy, riffle |
| 🏆 **win** | 800 Hz | Your team wins trick/round | 400ms | Victorious, rising |
| 💔 **lose** | 300 Hz | Rivals win trick/round | 300ms | Sad, falling |
| 💰 **score** | 700 Hz | Round scores | 200ms | Ding!, positive |

### Sound Sequences

When multiple sounds play together:
- **Trump + Deal Cards**: `click` (0ms) → `deal` (100ms)
  - Trump selection feedback, then cards reveal
  
- **Round Scoring** (Your team wins):
  - `score` (0ms) → `win` (150ms)
  - Points counter dings, then victory sound
  
- **Match Win**:
  - `win` (0ms) → `win` (200ms)
  - Double victory fanfare!

## 🎨 Animations

### Animation Categories

#### 1. **Card Animations**

```
Deal Animation (.animate-deal)
├─ Duration: 0.4s
├─ Easing: cubic-bezier(0.34, 1.56, 0.64, 1) [bouncy]
└─ Effect: Fade in + scale up from 80% → 100%

Play Animation (.animate-play)
├─ Duration: 0.5s
├─ Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
└─ Effect: Scale up → move up 80px → fade out
   (Card appears to move to trick zone)

Played Card in Trick (.played-card)
├─ Duration: 0.3s
└─ Effect: Deal animation (bouncy entrance)
```

#### 2. **Game Event Animations**

```
Trick Win (.animate-trick-win)
├─ Duration: 0.6s
└─ Effect: Scale pulse (1.0 → 1.1 → 1.0) + rotation

Score Update (.animate-score)
├─ Duration: 0.5s
└─ Effect: Number bounces (1.0 → 1.2 → 1.0)

Round Transition (.animate-round-transition)
├─ Duration: 0.8s
└─ Effect: Fade out → fade in (opacity pulse)
```

#### 3. **Emphasis Animations**

```
Pulse (.pulse)
├─ Duration: 0.6s
└─ Effect: Glowing box-shadow expands then fades
   (Used for important UI elements)

Shimmer (.shimmer)
├─ Duration: 1.2s
└─ Effect: Light sweep across element
   (Used for hover states and highlights)
```

### Animation Timeline in a Trick

```
00ms: Player clicks card
      └─ .animate-play activates
      └─ soundManager.play('play')

100ms: Card moves to trick zone
       └─ .animate-play completes

300ms: Other players' cards appear
       └─ .animate-deal on each .played-card

700ms: Trick winner determined
       └─ .animate-trick-win on winning card
       └─ soundManager.play('win') or ('lose')

900ms: Cards clear, next trick begins
```

## 🎬 Visual Effects Stack

### Hover States
```css
/* Legal playable card */
.card.legal:hover {
  transform: translateY(-15px);           /* Lift up */
  box-shadow: 0 16px 24px rgba(...);      /* Deep shadow */
  filter: drop-shadow(0 12px 20px ...);   /* Enhanced glow */
}
```

### Score Animation Sequence
1. Opponent plays last card
2. Trick winner calculated
3. **Trick win sound plays** 🔊
4. **Winning card animates** ✨ (.animate-trick-win)
5. **Score updates** 💫 (.animate-score)
6. **Score sound plays** 🔊

## 🎯 Enhanced Game Events

### Start of Game
```
New Match button clicked
  ↓ [click sound]
Round starts
  ↓ [shuffle sound plays]
Deck animation
  ↓ [cards deal with .animate-deal]
Trump selection appears
```

### During Trick
```
Player selects card
  ↓ [play sound]
Card animates out (.animate-play)
  ↓
Other players play
  ↓ [play sound × 3]
Cards appear with .animate-deal
  ↓
Trick resolves
  ↓ [win/lose sound]
Winning card pulses (.animate-trick-win)
```

### End of Round
```
Last card played
  ↓
Round scoring calculated
  ↓ [score sound + win/lose sound]
Score numbers bounce (.animate-score)
  ↓
Round transition fade (.animate-round-transition)
  ↓
New round begins
```

### End of Match
```
Winning team reaches 10 tokens
  ↓ [win sound × 2 or lose sound × 2]
Match over message
  ↓
[pulse effect on action button]
Continue or new game options appear
```

## 🔧 Technical Implementation

### Sound Generation Flow
```
soundManager.play('win')
  ├─ Create AudioContext (if needed)
  ├─ Create OscillatorNode
  ├─ Create GainNode (volume envelope)
  ├─ Apply ADSR envelope:
  │  ├─ Attack: fade in
  │  ├─ Decay: initial level drop
  │  ├─ Sustain: hold level
  │  └─ Release: fade out
  ├─ Apply frequency sweep
  └─ Play through speakers
```

### Animation Application Pattern
```html
<!-- Before animation -->
<div class="card">♥ A</div>

<!-- Add animation class -->
<div class="card animate-deal">♥ A</div>

<!-- CSS applies: @keyframes dealCard -->
/* Result: Card fades in and scales from 80% */

<!-- After animation completes: -->
<!-- Class auto-removed or left for reuse -->
```

## 🎮 User Experience Flow

### Audio Feedback Path
1. **Action** - User clicks card or button
2. **Sound** - Immediate audio response (0-50ms)
3. **Visual** - Animation plays (200-600ms)
4. **Confirmation** - Game state updates

### Visual Feedback Path
1. **Highlight** - Hover effect on interactive elements
2. **Activate** - Animation begins immediately
3. **Transition** - Smooth 200-800ms animation
4. **Settle** - Final state reached with sound confirmation

## 🎨 Color & Sound Harmony

| Event | Sound | Visual | Color Scheme |
|-------|-------|--------|--------------|
| Win | Rising tone (800 Hz) | Green pulse | Success ✅ |
| Lose | Falling tone (300 Hz) | Red pulse | Danger ❌ |
| Score | Positive (700 Hz) | Gold bounce | Reward 💰 |
| Play | Neutral (600 Hz) | Card move | Action 🎯 |

## 📊 Performance Impact

- **Audio**: Procedural (no files) = ~2KB JavaScript
- **Animations**: Pure CSS = GPU accelerated, 60fps
- **Total Bundle**: < 15KB gzipped
- **Load Time**: < 1 second

## 🔄 Disabling Features (if needed)

```typescript
// Disable all sounds
soundManager.toggleSound(false);

// Remove animations by commenting CSS keyframes
// @keyframes dealCard { /* disabled */ }
```

## ✨ Testing the Enhancements

### Manual Testing Checklist
- [ ] Start new game - hear shuffle sound
- [ ] Click trump suit - hear click + deal sounds
- [ ] Play a card - hear play sound
- [ ] Win a trick - hear win sound + see card pulse
- [ ] Lose a trick - hear lose sound
- [ ] End round - hear score sound
- [ ] Cards animate smoothly
- [ ] No visual stuttering
- [ ] Sounds play without lag
- [ ] Works on mobile/tablet

### Browser Console Check
```javascript
// In browser DevTools console:
soundManager.play('win');  // Test sound
soundManager.toggleSound(false);  // Mute
```
