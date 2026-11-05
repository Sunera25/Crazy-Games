// Handcrafted SVG art for cards, backs, table and suit icons — ported from the
// Lovable version of Omi (Sunera25/archive-to-app-bridge-91, src/omi/utils/art.ts)
import type { Card, Suit } from '../game/deck'

const RED = '#c2413a'
const INK = '#1d2e2b'
export const isRed = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds'

/** Suit glyph paths drawn in a 100x100 box centred at 50,50. */
const suitPath: Record<Suit, string> = {
  hearts: 'M50 88 C20 66 6 48 6 31 C6 16 18 6 31 6 C40 6 46 11 50 19 C54 11 60 6 69 6 C82 6 94 16 94 31 C94 48 80 66 50 88 Z',
  diamonds: 'M50 4 C60 22 74 38 90 50 C74 62 60 78 50 96 C40 78 26 62 10 50 C26 38 40 22 50 4 Z',
  spades: 'M50 4 C66 26 92 40 92 60 C92 74 81 82 69 82 C61 82 56 78 53 74 C54 84 58 90 66 96 L34 96 C42 90 46 84 47 74 C44 78 39 82 31 82 C19 82 8 74 8 60 C8 40 34 26 50 4 Z',
  clubs: 'M50 6 A19 19 0 0 1 64 38 A19 19 0 1 1 57 70 C58 82 61 89 68 96 L32 96 C39 89 42 82 43 70 A19 19 0 1 1 36 38 A19 19 0 0 1 50 6 Z',
}

export function suitGlyph(suit: Suit, x: number, y: number, size: number, fill?: string): string {
  const s = size / 100
  return `<path d="${suitPath[suit]}" fill="${fill ?? (isRed(suit) ? RED : INK)}" transform="translate(${x - size / 2} ${y - size / 2}) scale(${s})"/>`
}

export function suitIconSVG(suit: Suit, size = 20, fill?: string): string {
  return `<svg class="suit-icon" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${suitGlyph(suit, 50, 50, 100, fill ?? 'currentColor')}</svg>`
}

// Pip layouts in a 100x150 card body (x,y, flipped)
const pipLayouts: Record<string, Array<[number, number, boolean?]>> = {
  '7': [[32, 34], [68, 34], [50, 55], [32, 75], [68, 75], [32, 116, true], [68, 116, true]],
  '8': [[32, 34], [68, 34], [50, 55], [32, 75], [68, 75], [50, 96, true], [32, 116, true], [68, 116, true]],
  '9': [[32, 34], [68, 34], [32, 62], [68, 62], [50, 75], [32, 89, true], [68, 89, true], [32, 116, true], [68, 116, true]],
  '10': [[32, 34], [68, 34], [50, 50], [32, 62], [68, 62], [32, 89, true], [68, 89, true], [50, 101, true], [32, 116, true], [68, 116, true]],
}

const courtTitle: Record<string, string> = { J: 'JACK', Q: 'QUEEN', K: 'KING' }

function courtArt(card: Card, color: string): string {
  const crown = card.rank === 'K'
    ? 'M30 52 L36 34 L44 46 L50 28 L56 46 L64 34 L70 52 Z'
    : card.rank === 'Q'
      ? 'M32 52 C34 40 40 36 42 44 C45 32 55 32 58 44 C60 36 66 40 68 52 Z'
      : 'M34 52 L38 38 L50 44 L62 38 L66 52 Z'
  return `
    <rect x="18" y="22" width="64" height="106" rx="6" fill="${color}" opacity=".07"/>
    <rect x="18" y="22" width="64" height="106" rx="6" fill="none" stroke="${color}" stroke-width="1.2" opacity=".55"/>
    <path d="${crown}" fill="#d9a441" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="50" cy="66" r="13" fill="#f7e9cf" stroke="${color}" stroke-width="1.6"/>
    <path d="M44 64 h2 M54 64 h2 M46 71 q4 3 8 0" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M28 120 C30 92 38 82 50 82 C62 82 70 92 72 120 Z" fill="${color}" opacity=".85"/>
    <path d="M50 84 L50 120 M40 96 L60 96" stroke="#d9a441" stroke-width="2"/>
    ${suitGlyph(card.suit, 50, 106, 14, '#f7e9cf')}
    <text x="50" y="138" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" letter-spacing="2" fill="${color}" opacity=".7">${courtTitle[card.rank]}</text>`
}

export function cardFaceSVG(card: Card): string {
  const color = isRed(card.suit) ? RED : INK
  const id = `cf-${card.suit}-${card.rank}`
  let center: string
  if (card.rank === 'A') {
    center = `<circle cx="50" cy="75" r="30" fill="${color}" opacity=".06"/>${suitGlyph(card.suit, 50, 75, 50)}`
  } else if (courtTitle[card.rank]) {
    center = courtArt(card, color)
  } else {
    center = (pipLayouts[card.rank] ?? []).map(([x, y, flip]) =>
      `<g ${flip ? `transform="rotate(180 ${x} ${y})"` : ''}>${suitGlyph(card.suit, x, y, 17)}</g>`).join('')
  }
  const corner = `<text x="9" y="20" font-family="DM Mono, monospace" font-weight="700" font-size="${card.rank === '10' ? 14 : 16}" fill="${color}">${card.rank}</text>${suitGlyph(card.suit, 15, 31, 11)}`
  return `<svg class="card-art" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f1e5cc"/></linearGradient></defs>
    <rect x="1" y="1" width="98" height="148" rx="8" fill="url(#${id})" stroke="#cdb98f" stroke-width="1.2"/>
    <rect x="5" y="5" width="90" height="140" rx="5" fill="none" stroke="${color}" stroke-width=".5" opacity=".25"/>
    ${center}
    ${corner}
    <g transform="rotate(180 50 75)">${corner}</g>
  </svg>`
}

export function cardBackSVG(): string {
  const petals = Array.from({ length: 8 }, (_, i) => `<ellipse cx="50" cy="58" rx="6" ry="15" transform="rotate(${i * 45} 50 75)" fill="none" stroke="#e7bf6a" stroke-width="1.2"/>`).join('')
  return `<svg class="card-art" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id="cb-lattice" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="10" height="10" fill="#7a2330"/><path d="M0 5 H10 M5 0 V10" stroke="#952d3b" stroke-width="1"/>
      </pattern>
    </defs>
    <rect x="1" y="1" width="98" height="148" rx="8" fill="#f4ead6" stroke="#cdb98f"/>
    <rect x="6" y="6" width="88" height="138" rx="5" fill="url(#cb-lattice)"/>
    <rect x="10" y="10" width="80" height="130" rx="4" fill="none" stroke="#e7bf6a" stroke-width="1"/>
    <circle cx="50" cy="75" r="24" fill="#5e1824" stroke="#e7bf6a" stroke-width="1.2"/>
    ${petals}
    <circle cx="50" cy="75" r="5" fill="#e7bf6a"/>
  </svg>`
}

export function cardBackFanSVG(count: number): string {
  const n = Math.max(0, Math.min(count, 8))
  const cards = Array.from({ length: n }, (_, i) => {
    const angle = (i - (n - 1) / 2) * 7
    return `<g transform="rotate(${angle} 50 140)"><rect x="34" y="40" width="32" height="48" rx="4" fill="#7a2330" stroke="#e7bf6a" stroke-width="1.4"/><rect x="38" y="44" width="24" height="40" rx="2" fill="none" stroke="#e7bf6a" stroke-width=".7" opacity=".7"/></g>`
  }).join('')
  return `<svg class="back-fan" viewBox="0 0 100 100" aria-hidden="true">${cards}</svg>`
}

export function tableSVG(): string {
  return `<svg class="table-art" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id="felt" cx="50%" cy="46%" r="62%">
        <stop offset="0" stop-color="#1c6b52"/><stop offset=".55" stop-color="#0f4a39"/><stop offset="1" stop-color="#062a21"/>
      </radialGradient>
      <linearGradient id="rail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9a6438"/><stop offset=".35" stop-color="#6b3f1f"/><stop offset=".7" stop-color="#4a2a14"/><stop offset="1" stop-color="#2b170a"/>
      </linearGradient>
      <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f3dc82"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#8c6c1d"/>
      </linearGradient>
      <radialGradient id="spot" cx="50%" cy="45%" r="45%"><stop offset="0" stop-color="#fff6d8" stop-opacity=".16"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
      <filter id="feltNoise"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .1 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      <filter id="woodGrain"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      <filter id="inset"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    <rect width="1000" height="620" fill="#051a15"/>
    <rect x="10" y="10" width="980" height="600" rx="300" fill="url(#rail)"/>
    <rect x="10" y="10" width="980" height="600" rx="300" fill="#000" filter="url(#woodGrain)"/>
    <rect x="12" y="12" width="976" height="596" rx="298" fill="none" stroke="#c48a52" stroke-opacity=".5" stroke-width="2"/>
    <rect x="34" y="34" width="932" height="552" rx="276" fill="none" stroke="url(#brass)" stroke-width="4"/>
    <rect x="40" y="40" width="920" height="540" rx="270" fill="url(#felt)"/>
    <rect x="40" y="40" width="920" height="540" rx="270" fill="#000" filter="url(#feltNoise)"/>
    <rect x="40" y="40" width="920" height="540" rx="270" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="22" filter="url(#inset)"/>
    <rect x="40" y="40" width="920" height="540" fill="url(#spot)"/>
    <rect x="64" y="64" width="872" height="492" rx="246" fill="none" stroke="#d4af37" stroke-width="1.4" stroke-dasharray="1 8" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="500" cy="300" rx="180" ry="116" fill="none" stroke="url(#brass)" stroke-width="1.5" opacity=".35"/>
    <ellipse cx="500" cy="300" rx="128" ry="80" fill="#000" fill-opacity=".12" stroke="#d4af37" stroke-width="1" opacity=".5"/>
    ${[0, 90, 180, 270].map((r) => `<path d="M500 176 l6 8 -6 8 -6 -8z" fill="#d4af37" opacity=".6" transform="rotate(${r} 500 300) "/>`).join('')}
    <g opacity=".07">${suitGlyph('spades', 410, 300, 34, '#fff')}${suitGlyph('hearts', 470, 300, 34, '#fff')}${suitGlyph('clubs', 530, 300, 34, '#fff')}${suitGlyph('diamonds', 590, 300, 34, '#fff')}</g>
  </svg>`
}

const avatarPalettes = [
  { bg: '#e6b55a', skin: '#c98b5a', hair: '#2a1a12', shirt: '#2f6f62' },
  { bg: '#de806c', skin: '#a8714a', hair: '#1a1210', shirt: '#33415e' },
  { bg: '#8cc6bd', skin: '#d6a274', hair: '#3a2416', shirt: '#7a2330' },
  { bg: '#b8a8d8', skin: '#b67c52', hair: '#120c0a', shirt: '#2b5a4f' },
]

/** Illustrated avatar; `seed` picks palette and hair style so each bot looks distinct. */
export function avatarSVG(name: string, seat: number): string {
  const seed = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const p = avatarPalettes[seat % avatarPalettes.length] ?? avatarPalettes[0]!
  const style = seed % 3
  const hair = style === 0
    ? `<path d="M30 44 C30 26 70 26 70 44 C66 36 58 34 50 34 C42 34 34 36 30 44 Z" fill="${p.hair}"/>`
    : style === 1
      ? `<path d="M28 50 C26 24 74 24 72 50 L72 66 C68 58 68 46 64 40 C56 44 44 44 36 40 C32 46 32 58 28 66 Z" fill="${p.hair}"/>`
      : `<path d="M30 46 C28 30 40 24 50 24 C60 24 72 30 70 46 C64 40 60 38 50 40 C40 38 36 40 30 46 Z" fill="${p.hair}"/><circle cx="50" cy="24" r="7" fill="${p.hair}"/>`
  return `<svg class="avatar-art" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="${p.bg}"/>
    <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
    <clipPath id="av-clip-${seat}"><circle cx="50" cy="50" r="46"/></clipPath>
    <g clip-path="url(#av-clip-${seat})">
      <path d="M18 100 C20 78 34 70 50 70 C66 70 80 78 82 100 Z" fill="${p.shirt}"/>
      <rect x="44" y="60" width="12" height="12" rx="4" fill="${p.skin}"/>
      <ellipse cx="50" cy="48" rx="19" ry="21" fill="${p.skin}"/>
      ${hair}
      <circle cx="43" cy="50" r="2.2" fill="#1b120d"/><circle cx="57" cy="50" r="2.2" fill="#1b120d"/>
      <path d="M44 59 Q50 63 56 59" stroke="#5a2e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="39" cy="56" r="3" fill="#e0715f" opacity=".25"/><circle cx="61" cy="56" r="3" fill="#e0715f" opacity=".25"/>
    </g>
  </svg>`
}
