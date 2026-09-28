# Omi

A browser-based single-player version of **Omi**, the Sri Lankan partnership trick-taking card game. The current prototype is designed for CrazyGames and uses one human player, one AI partner, and two AI opponents.

## How To Play

### Players and teams

There are four seats:

- You
- Right-hand opponent
- Partner opposite you
- Left-hand opponent

You and your opposite partner form one team. The two side players form the opposing team. Partners do not communicate directly.

### Cards

Omi uses 32 cards:

- Suits: clubs, diamonds, hearts, spades
- Ranks, highest to lowest: Ace, King, Queen, Jack, 10, 9, 8, 7

### Deal and trump

Each round is dealt in two stages:

1. Four cards are dealt to each player.
2. The trump caller chooses a suit.
3. The remaining four cards are dealt to each player.

The first round starts with you as the trump caller. After each round, the caller moves to the player on the right:

1. You
2. Right-hand opponent
3. Partner opposite you
4. Left-hand opponent
5. Back to you

### Playing tricks

- The caller leads the first trick.
- The player who wins a trick leads the next trick.
- Players must follow the suit led if they have that suit.
- If a player has no card of the led suit, they may play any card.
- Any trump beats every non-trump card.
- If no trump is played, the highest card of the led suit wins.
- Eight tricks are played in each round.

### Scoring

The trump caller's team is identified at the start of each round.

- If the caller's team wins the round, it receives 1 token.
- If the other team wins the round, it receives 2 tokens.
- If the round is tied 4-4, neither team receives tokens immediately.
- After a tie, the winner of the next round receives 2 tokens.
- The first team to reach 10 tokens wins the match.
- Winning all eight tricks is called **Kapothi**.

## Controls

- Choose a suit using the suit buttons when you are the trump caller.
- Click a highlighted card to play it.
- Cards that do not follow the led suit are disabled when you have a card of the led suit.
- Use **Continue** after a round finishes.
- Use **New game** in the top-right to reset the match and token scores.
- Open **Rules** in the top-right to view the in-game rules panel.

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run the tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `src/main.ts` - game state, turn flow, UI rendering, and input handling
- `src/game/deck.ts` - cards, ranks, suits, shuffling, and deck utilities
- `src/game/deal.ts` - the two-stage Omi deal
- `src/game/rules.ts` - legal plays, trick winners, teams, and scoring
- `src/game/ai.ts` - trump selection and AI card choices
- `src/platform/crazygames.ts` - guarded CrazyGames SDK integration
- `src/style.css` - responsive table and card UI
- `src/game/*.test.ts` - unit tests for game rules, AI, and dealing

## CrazyGames

The project loads the CrazyGames SDK v3 and uses guarded loading and gameplay lifecycle calls. The local game still runs if the SDK is unavailable.

Before submission, test the production build through the CrazyGames Developer Portal and verify:

- Desktop and touch controls
- Loading and first playable frame
- Responsive layout on mobile
- Original or properly licensed art and audio
- Rules, scoring, and match completion
- QA behavior when the SDK or ads are unavailable

Multiplayer, matchmaking, cloud saves, ads, and leaderboards are not part of the current single-player prototype.
