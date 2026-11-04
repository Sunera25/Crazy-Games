// Enhanced card designs with decorative borders and suit graphics
import type { Card, Suit } from '../game/deck'

const suitSymbols: Record<Suit, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }

function createFancyBorder(width: number, height: number): string {
  return `
    <!-- Outer border -->
    <rect x="2" y="2" width="${width - 4}" height="${height - 4}"
          fill="none" stroke="#d9c9a6" stroke-width="2" rx="8"/>

    <!-- Inner decorative border -->
    <rect x="5" y="5" width="${width - 10}" height="${height - 10}"
          fill="none" stroke="#c2b599" stroke-width="1" rx="6" opacity="0.6"/>

    <!-- Corner ornaments -->
    <circle cx="8" cy="8" r="2" fill="#d9c9a6" opacity="0.7"/>
    <circle cx="${width - 8}" cy="8" r="2" fill="#d9c9a6" opacity="0.7"/>
    <circle cx="8" cy="${height - 8}" r="2" fill="#d9c9a6" opacity="0.7"/>
    <circle cx="${width - 8}" cy="${height - 8}" r="2" fill="#d9c9a6" opacity="0.7"/>

    <!-- Edge patterns -->
    <line x1="12" y1="2" x2="12" y2="8" stroke="#d9c9a6" stroke-width="1" opacity="0.4"/>
    <line x1="${width - 12}" y1="2" x2="${width - 12}" y2="8" stroke="#d9c9a6" stroke-width="1" opacity="0.4"/>
  `
}

function createHeartSuit(x: number, y: number, size: number, color: string): string {
  const s = size
  return `
    <g transform="translate(${x}, ${y})">
      <path d="M 0,-${s * 0.35} C 0,-${s * 0.55} ${s * 0.25},-${s * 0.7} ${s * 0.35},-${s * 0.7}
               C ${s * 0.45},-${s * 0.7} ${s * 0.5},-${s * 0.55} ${s * 0.5},-${s * 0.35}
               C ${s * 0.5},-${s * 0.55} ${s * 0.55},-${s * 0.7} ${s * 0.65},-${s * 0.7}
               C ${s * 0.75},-${s * 0.7} ${s * 0.85},-${s * 0.55} ${s * 0.85},-${s * 0.35}
               C ${s * 0.85},${s * 0.2} ${s * 0.35},${s * 0.65} 0,${s * 0.8}
               C ${-s * 0.35},${s * 0.65} ${-s * 0.85},${s * 0.2} ${-s * 0.85},-${s * 0.35}
               C ${-s * 0.85},-${s * 0.55} ${-s * 0.75},-${s * 0.7} ${-s * 0.65},-${s * 0.7}
               C ${-s * 0.55},-${s * 0.7} ${-s * 0.45},-${s * 0.55} ${-s * 0.5},-${s * 0.35}
               C ${-s * 0.5},-${s * 0.55} ${-s * 0.45},-${s * 0.7} ${-s * 0.35},-${s * 0.7}
               C ${-s * 0.25},-${s * 0.7} 0,-${s * 0.55} 0,-${s * 0.35} Z"
            fill="${color}" stroke="${color}" stroke-width="0.5"/>
      <ellipse cx="0" cy="${s * 0.3}" rx="${s * 0.15}" ry="${s * 0.25}" fill="${color}" opacity="0.3"/>
    </g>
  `
}

function createDiamondSuit(x: number, y: number, size: number, color: string): string {
  const s = size
  return `
    <g transform="translate(${x}, ${y})">
      <path d="M 0,-${s} L ${s},-${s * 0.3} L 0,${s} L ${-s},-${s * 0.3} Z"
            fill="${color}" stroke="${color}" stroke-width="0.5"/>
      <path d="M 0,-${s * 0.5} L ${s * 0.4},-${s * 0.2} L 0,${s * 0.4} L ${-s * 0.4},-${s * 0.2} Z"
            fill="white" opacity="0.3"/>
    </g>
  `
}

function createClubSuit(x: number, y: number, size: number, color: string): string {
  const s = size
  return `
    <g transform="translate(${x}, ${y})">
      <!-- Three circles -->
      <circle cx="${-s * 0.3}" cy="${-s * 0.25}" r="${s * 0.3}" fill="${color}"/>
      <circle cx="${s * 0.3}" cy="${-s * 0.25}" r="${s * 0.3}" fill="${color}"/>
      <circle cx="0" cy="${s * 0.15}" r="${s * 0.3}" fill="${color}"/>
      <!-- Stem -->
      <rect x="${-s * 0.1}" y="${s * 0.35}" width="${s * 0.2}" height="${s * 0.45}" fill="${color}"/>
      <!-- Highlight -->
      <circle cx="${-s * 0.3}" cy="${-s * 0.4}" r="${s * 0.1}" fill="white" opacity="0.4"/>
    </g>
  `
}

function createSpadeSuit(x: number, y: number, size: number, color: string): string {
  const s = size
  return `
    <g transform="translate(${x}, ${y})">
      <!-- Spade head (inverted heart) -->
      <path d="M 0,${s * 0.35} C 0,${s * 0.55} ${s * 0.25},${s * 0.7} ${s * 0.35},${s * 0.7}
               C ${s * 0.45},${s * 0.7} ${s * 0.5},${s * 0.55} ${s * 0.5},${s * 0.35}
               C ${s * 0.5},${s * 0.55} ${s * 0.55},${s * 0.7} ${s * 0.65},${s * 0.7}
               C ${s * 0.75},${s * 0.7} ${s * 0.85},${s * 0.55} ${s * 0.85},${s * 0.35}
               C ${s * 0.85},-${s * 0.2} ${s * 0.35},-${s * 0.65} 0,-${s * 0.8}
               C ${-s * 0.35},-${s * 0.65} ${-s * 0.85},-${s * 0.2} ${-s * 0.85},${s * 0.35}
               C ${-s * 0.85},${s * 0.55} ${-s * 0.75},${s * 0.7} ${-s * 0.65},${s * 0.7}
               C ${-s * 0.55},${s * 0.7} ${-s * 0.45},${s * 0.55} ${-s * 0.5},${s * 0.35}
               C ${-s * 0.5},${s * 0.55} ${-s * 0.45},${s * 0.7} ${-s * 0.35},${s * 0.7}
               C ${-s * 0.25},${s * 0.7} 0,${s * 0.55} 0,${s * 0.35} Z"
            fill="${color}" stroke="${color}" stroke-width="0.5"/>
      <!-- Stem -->
      <rect x="${-s * 0.1}" y="${-s * 0.55}" width="${s * 0.2}" height="${s * 0.45}" fill="${color}"/>
      <!-- Highlight -->
      <ellipse cx="${-s * 0.25}" cy="${s * 0.45}" rx="${s * 0.15}" ry="${s * 0.1}" fill="white" opacity="0.3"/>
    </g>
  `
}

export function createEnhancedCardSVG(card: Card): string {
  const width = 76
  const height = 112
  const padding = 8
  const color = card.suit === 'hearts' || card.suit === 'diamonds' ? '#c65c52' : '#263c38'

  let suitGraphic = ''
  const suitX = width / 2
  const suitY = height / 2

  if (card.suit === 'hearts') suitGraphic = createHeartSuit(suitX, suitY, 14, color)
  else if (card.suit === 'diamonds') suitGraphic = createDiamondSuit(suitX, suitY, 14, color)
  else if (card.suit === 'clubs') suitGraphic = createClubSuit(suitX, suitY, 12, color)
  else if (card.suit === 'spades') suitGraphic = createSpadeSuit(suitX, suitY, 12, color)

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="card-svg enhanced">
      <defs>
        <filter id="card-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
        <linearGradient id="card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#faf8f3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5eddd;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Card background -->
      <rect width="${width}" height="${height}" fill="url(#card-bg)" filter="url(#card-shadow)" rx="6"/>

      <!-- Fancy borders -->
      ${createFancyBorder(width, height)}

      <!-- Center suit graphic -->
      ${suitGraphic}

      <!-- Rank top-left -->
      <text x="${padding + 3}" y="${padding + 11}" font-family="DM Mono, monospace" font-size="13" font-weight="bold" fill="${color}">${card.rank}</text>
      <text x="${padding + 3}" y="${padding + 23}" font-family="DM Mono, monospace" font-size="15" fill="${color}">${suitSymbols[card.suit]}</text>

      <!-- Rank bottom-right (upside down) -->
      <g transform="translate(${width - padding - 3}, ${height - padding}) rotate(180)">
        <text x="0" y="0" font-family="DM Mono, monospace" font-size="13" font-weight="bold" fill="${color}">${card.rank}</text>
        <text x="0" y="12" font-family="DM Mono, monospace" font-size="15" fill="${color}">${suitSymbols[card.suit]}</text>
      </g>
    </svg>
  `
}

export function createGradientCardBackSVG(): string {
  return `
    <svg viewBox="0 0 76 112" xmlns="http://www.w3.org/2000/svg" class="card-back-svg">
      <defs>
        <radialGradient id="back-pattern" cx="40%" cy="40%">
          <stop offset="0%" style="stop-color:#2a6b61;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a4944;stop-opacity:1" />
        </radialGradient>
        <filter id="back-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Outer border -->
      <rect width="76" height="112" fill="#f5eddd" stroke="#d9c9a6" stroke-width="1.5" rx="6" filter="url(#back-shadow)"/>

      <!-- Inner pattern area -->
      <rect x="6" y="8" width="64" height="96" fill="url(#back-pattern)" stroke="#407267" stroke-width="1.5" rx="4"/>

      <!-- Center mandala pattern -->
      <circle cx="38" cy="56" r="24" fill="none" stroke="#d3a755" stroke-width="1.5" opacity="0.5"/>
      <circle cx="38" cy="56" r="18" fill="none" stroke="#d3a755" stroke-width="1" opacity="0.5"/>
      <circle cx="38" cy="56" r="12" fill="none" stroke="#d3a755" stroke-width="1" opacity="0.6"/>
      <circle cx="38" cy="56" r="6" fill="#d3a755" opacity="0.7"/>

      <!-- Corner diamonds -->
      <path d="M 14 16 L 16 14 L 18 16 L 16 18 Z" fill="#d3a755" opacity="0.6"/>
      <path d="M 60 96 L 62 94 L 64 96 L 62 98 Z" fill="#d3a755" opacity="0.6"/>

      <!-- Side ornaments -->
      <line x1="10" y1="30" x2="10" y2="82" stroke="#d3a755" stroke-width="1" opacity="0.3"/>
      <line x1="66" y1="30" x2="66" y2="82" stroke="#d3a755" stroke-width="1" opacity="0.3"/>

      <!-- Top and bottom ornaments -->
      <line x1="24" y1="12" x2="52" y2="12" stroke="#d3a755" stroke-width="1" opacity="0.3"/>
      <line x1="24" y1="100" x2="52" y2="100" stroke="#d3a755" stroke-width="1" opacity="0.3"/>
    </svg>
  `
}
