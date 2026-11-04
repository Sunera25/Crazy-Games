import type { Card, Suit } from '../game/deck'

const suitSymbols: Record<Suit, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }
const suitColors: Record<Suit, { fill: string; stroke: string }> = {
  clubs: { fill: '#263c38', stroke: '#263c38' },
  diamonds: { fill: '#c65c52', stroke: '#c65c52' },
  hearts: { fill: '#c65c52', stroke: '#c65c52' },
  spades: { fill: '#263c38', stroke: '#263c38' }
}

function svgPath(d: string, color: string): string {
  return `<path d="${d}" fill="${color}" stroke="none"/>`
}

function svgHeart(x: number, y: number, scale: number): string {
  const s = scale
  const path = `M ${x},${y + s * 0.35} C ${x},${y - s * 0.15} ${x + s * 0.3},${y - s * 0.4} ${x + s * 0.3},${y - s * 0.25}
               C ${x + s * 0.3},${y - s * 0.5} ${x},${y - s * 0.7} ${x},${y - s * 0.7}
               C ${x},${y - s * 0.7} ${x - s * 0.3},${y - s * 0.5} ${x - s * 0.3},${y - s * 0.25}
               C ${x - s * 0.3},${y - s * 0.4} ${x},${y - s * 0.15} ${x},${y + s * 0.35} Z`
  return svgPath(path, '#c65c52')
}

function svgDiamond(x: number, y: number, scale: number): string {
  const s = scale
  const path = `M ${x},${y - s} L ${x + s},${y} L ${x},${y + s} L ${x - s},${y} Z`
  return svgPath(path, '#c65c52')
}

function svgClub(x: number, y: number, scale: number): string {
  const s = scale
  // Three circles for the club head, one line for stem
  return `
    <circle cx="${x - s * 0.33}" cy="${y - s * 0.2}" r="${s * 0.25}" fill="#263c38"/>
    <circle cx="${x + s * 0.33}" cy="${y - s * 0.2}" r="${s * 0.25}" fill="#263c38"/>
    <circle cx="${x}" cy="${y + s * 0.1}" r="${s * 0.25}" fill="#263c38"/>
    <rect x="${x - s * 0.08}" y="${y + s * 0.3}" width="${s * 0.16}" height="${s * 0.4}" fill="#263c38"/>
  `
}

function svgSpade(x: number, y: number, scale: number): string {
  const s = scale
  // Heart upside down + stem
  const path = `M ${x},${y - s * 0.35} C ${x},${y + s * 0.15} ${x + s * 0.3},${y + s * 0.4} ${x + s * 0.3},${y + s * 0.25}
               C ${x + s * 0.3},${y + s * 0.5} ${x},${y + s * 0.7} ${x},${y + s * 0.7}
               C ${x},${y + s * 0.7} ${x - s * 0.3},${y + s * 0.5} ${x - s * 0.3},${y + s * 0.25}
               C ${x - s * 0.3},${y + s * 0.4} ${x},${y + s * 0.15} ${x},${y - s * 0.35} Z`
  return svgPath(path, '#263c38') + `
    <rect x="${x - s * 0.08}" y="${y - s * 0.7}" width="${s * 0.16}" height="${s * 0.35}" fill="#263c38"/>
  `
}

export function createCardSVG(card: Card): string {
  const width = 76
  const height = 112
  const padding = 8

  const color = suitColors[card.suit].fill

  let suitGraphic = ''
  const suitX = width / 2
  const suitY = height / 2

  if (card.suit === 'hearts') suitGraphic = svgHeart(suitX, suitY, 12)
  else if (card.suit === 'diamonds') suitGraphic = svgDiamond(suitX, suitY, 12)
  else if (card.suit === 'clubs') suitGraphic = svgClub(suitX, suitY, 12)
  else if (card.suit === 'spades') suitGraphic = svgSpade(suitX, suitY, 12)

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="card-svg">
      <defs>
        <style>
          .card-svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
        </style>
      </defs>
      <rect width="${width}" height="${height}" fill="#f5eddd" stroke="${color}" stroke-width="1" rx="6"/>

      <!-- Rank top-left -->
      <text x="${padding + 2}" y="${padding + 10}" font-family="DM Mono, monospace" font-size="14" font-weight="bold" fill="${color}">${card.rank}</text>
      <text x="${padding + 2}" y="${padding + 22}" font-family="DM Mono, monospace" font-size="16" fill="${color}">${suitSymbols[card.suit]}</text>

      <!-- Center suit graphic -->
      ${suitGraphic}

      <!-- Rank bottom-right (upside down) -->
      <g transform="translate(${width - padding}, ${height - padding}) rotate(180)">
        <text x="2" y="10" font-family="DM Mono, monospace" font-size="14" font-weight="bold" fill="${color}">${card.rank}</text>
        <text x="2" y="22" font-family="DM Mono, monospace" font-size="16" fill="${color}">${suitSymbols[card.suit]}</text>
      </g>
    </svg>
  `
}

export function createCardBackSVG(): string {
  return `
    <svg viewBox="0 0 76 112" xmlns="http://www.w3.org/2000/svg" class="card-back-svg">
      <rect width="76" height="112" fill="#f5eddd" stroke="#d9c9a6" stroke-width="1" rx="6"/>
      <rect x="6" y="8" width="64" height="96" fill="#193f3a" stroke="#407267" stroke-width="1.5" rx="4"/>

      <!-- Pattern -->
      <circle cx="38" cy="56" r="18" fill="none" stroke="#d3a755" stroke-width="1" opacity="0.6"/>
      <circle cx="38" cy="56" r="12" fill="none" stroke="#d3a755" stroke-width="1" opacity="0.6"/>
      <circle cx="38" cy="56" r="6" fill="#d3a755" opacity="0.6"/>

      <!-- Corner decorations -->
      <rect x="12" y="14" width="2" height="10" fill="#d3a755" opacity="0.5"/>
      <rect x="12" y="14" width="10" height="2" fill="#d3a755" opacity="0.5"/>
      <rect x="62" y="88" width="2" height="10" fill="#d3a755" opacity="0.5"/>
      <rect x="54" y="98" width="10" height="2" fill="#d3a755" opacity="0.5"/>
    </svg>
  `
}

export function createBoardSVG(): string {
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="board-svg" style="position: absolute; opacity: 0.15; z-index: -1;">
      <!-- Decorative circles -->
      <circle cx="200" cy="150" r="140" fill="none" stroke="#4c7d6c" stroke-width="1"/>
      <circle cx="200" cy="150" r="100" fill="none" stroke="#4c7d6c" stroke-width="1" opacity="0.5"/>
      <circle cx="200" cy="150" r="60" fill="none" stroke="#4c7d6c" stroke-width="1" opacity="0.3"/>

      <!-- Compass points -->
      <line x1="200" y1="20" x2="200" y2="280" stroke="#4c7d6c" stroke-width="0.5" opacity="0.3"/>
      <line x1="20" y1="150" x2="380" y2="150" stroke="#4c7d6c" stroke-width="0.5" opacity="0.3"/>
      <line x1="60" y1="60" x2="340" y2="240" stroke="#4c7d6c" stroke-width="0.5" opacity="0.2"/>
      <line x1="340" y1="60" x2="60" y2="240" stroke="#4c7d6c" stroke-width="0.5" opacity="0.2"/>
    </svg>
  `
}
