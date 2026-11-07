// Player avatar designs
export interface AvatarStyle {
  name: string
  bgColor: string
  accentColor: string
  pattern: string
}

const avatarStyles: Record<string, AvatarStyle> = {
  saffron: { name: 'Saffron', bgColor: '#e6b55a', accentColor: '#d4a045', pattern: 'stripe' },
  coral: { name: 'Coral', bgColor: '#de806c', accentColor: '#c65c52', pattern: 'dot' },
  sky: { name: 'Sky', bgColor: '#8cc6bd', accentColor: '#6b9487', pattern: 'line' },
  lavender: { name: 'Lavender', bgColor: '#b8a8d8', accentColor: '#9686b8', pattern: 'checker' },
  mint: { name: 'Mint', bgColor: '#a8dcc8', accentColor: '#7fb5a0', pattern: 'wave' },
  rose: { name: 'Rose', bgColor: '#e8b5c9', accentColor: '#d68fa8', pattern: 'grid' }
}

function createAvatarPattern(style: string, size: number): string {
  const pattern = avatarStyles[style]?.pattern || 'stripe'
  const color = avatarStyles[style]?.accentColor || '#999'

  switch (pattern) {
    case 'dot':
      return `
        <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.1}" fill="${color}" opacity="0.3"/>
        <circle cx="${size * 0.7}" cy="${size * 0.7}" r="${size * 0.1}" fill="${color}" opacity="0.3"/>
        <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.08}" fill="${color}" opacity="0.2"/>
      `
    case 'line':
      return `
        <line x1="${size * 0.2}" y1="0" x2="${size * 0.2}" y2="${size}" stroke="${color}" stroke-width="${size * 0.08}" opacity="0.2"/>
        <line x1="${size * 0.5}" y1="0" x2="${size * 0.5}" y2="${size}" stroke="${color}" stroke-width="${size * 0.08}" opacity="0.2"/>
        <line x1="${size * 0.8}" y1="0" x2="${size * 0.8}" y2="${size}" stroke="${color}" stroke-width="${size * 0.08}" opacity="0.2"/>
      `
    case 'checker':
      return `
        <rect x="0" y="0" width="${size * 0.25}" height="${size * 0.25}" fill="${color}" opacity="0.2"/>
        <rect x="${size * 0.5}" y="${size * 0.25}" width="${size * 0.25}" height="${size * 0.25}" fill="${color}" opacity="0.2"/>
        <rect x="${size * 0.25}" y="${size * 0.5}" width="${size * 0.25}" height="${size * 0.25}" fill="${color}" opacity="0.2"/>
        <rect x="${size * 0.75}" y="${size * 0.75}" width="${size * 0.25}" height="${size * 0.25}" fill="${color}" opacity="0.2"/>
      `
    case 'wave':
      return `
        <path d="M 0,${size * 0.5} Q ${size * 0.25},${size * 0.3} ${size * 0.5},${size * 0.5} T ${size},${size * 0.5}"
              fill="none" stroke="${color}" stroke-width="${size * 0.06}" opacity="0.2"/>
        <path d="M 0,${size * 0.2} Q ${size * 0.25},${size * 0.4} ${size * 0.5},${size * 0.2} T ${size},${size * 0.2}"
              fill="none" stroke="${color}" stroke-width="${size * 0.05}" opacity="0.15"/>
      `
    case 'grid':
      return `
        <g opacity="0.15" stroke="${color}" stroke-width="${size * 0.04}">
          <line x1="${size * 0.33}" y1="0" x2="${size * 0.33}" y2="${size}"/>
          <line x1="${size * 0.66}" y1="0" x2="${size * 0.66}" y2="${size}"/>
          <line x1="0" y1="${size * 0.33}" x2="${size}" y2="${size * 0.33}"/>
          <line x1="0" y1="${size * 0.66}" x2="${size}" y2="${size * 0.66}"/>
        </g>
      `
    case 'stripe':
    default:
      return `
        <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${color}" stroke-width="${size * 0.12}" opacity="0.2"/>
        <line x1="0" y1="${size}" x2="${size}" y2="0" stroke="${color}" stroke-width="${size * 0.12}" opacity="0.2"/>
      `
  }
}

// --- Character face avatars -------------------------------------------------
// Deterministic flat-style character faces generated from the player name, so
// every seat (You + the bot pool) gets a stable, distinct character.

const skinTones = ['#8d5524', '#a0662f', '#b07a45', '#c68863', '#96613a', '#7c4a21']
const skinShadows = ['#74431b', '#875226', '#96653a', '#ac7452', '#7d4f2d', '#653b19']
const hairColors = ['#1d1712', '#2b1c11', '#3d2a17', '#17141a', '#4a3220']
const shirtColors = ['#b8542f', '#2f6db8', '#3d9970', '#7d5ba6', '#c94f7c', '#2a9d8f']

type HairStyleName = 'short' | 'curly' | 'bun' | 'long' | 'cap' | 'fade'
const hairByName: Record<string, HairStyleName> = { You: 'cap', Amaya: 'long', Tharushi: 'bun' }

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return hash
}

function hairMarkup(style: HairStyleName, hair: string): string {
  const topHalf = `<path d="M19.5 30 a12.5 12.5 0 0 1 25 0 Z" fill="${hair}"/>`
  switch (style) {
    case 'curly':
      return `${topHalf}
        <circle cx="22.5" cy="21.5" r="3.4" fill="${hair}"/><circle cx="27" cy="18.6" r="3.6" fill="${hair}"/>
        <circle cx="32" cy="17.8" r="3.8" fill="${hair}"/><circle cx="37" cy="18.6" r="3.6" fill="${hair}"/>
        <circle cx="41.5" cy="21.5" r="3.4" fill="${hair}"/>`
    case 'bun':
      return `${topHalf}<circle cx="32" cy="15" r="4.4" fill="${hair}"/>`
    case 'long':
      return `<rect x="17" y="21" width="5.5" height="21" rx="2.75" fill="${hair}"/>
        <rect x="41.5" y="21" width="5.5" height="21" rx="2.75" fill="${hair}"/>${topHalf}`
    case 'cap':
      return `<path d="M19.5 29 a12.5 12.5 0 0 1 25 0 Z" fill="#7f2d3a"/>
        <rect x="17.5" y="28" width="29" height="3.2" rx="1.6" fill="#5f1f2a"/>
        <circle cx="32" cy="16.8" r="1.9" fill="#7f2d3a"/>`
    case 'fade':
      return `<path d="M21.5 27.5 a10.5 10.5 0 0 1 21 0 Z" fill="${hair}"/>`
    case 'short':
    default:
      return `${topHalf}<rect x="19.3" y="27" width="2.6" height="5.5" rx="1.3" fill="${hair}"/><rect x="42.1" y="27" width="2.6" height="5.5" rx="1.3" fill="${hair}"/>`
  }
}

export function createPlayerAvatarSVG(name: string, style: string = 'saffron', size: number = 40): string {
  const avatarStyle = avatarStyles[style] || avatarStyles.saffron
  const hash = hashName(name || 'You')
  const skin = skinTones[hash % skinTones.length]
  const skinShadow = skinShadows[hash % skinShadows.length]
  const hair = hairColors[Math.floor(hash / 7) % hairColors.length]
  const shirt = name === 'You' ? '#2b4c7e' : shirtColors[Math.floor(hash / 13) % shirtColors.length]
  const hairStyle = hairByName[name] || (['short', 'curly', 'fade'] as HairStyleName[])[hash % 3]
  const uid = `${style}-${hash % 997}`

  return `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="avatar-svg avatar-${style}" role="img" aria-label="${name}">
      <defs>
        <radialGradient id="avbg-${uid}" cx="40%" cy="35%" r="70%">
          <stop offset="0%" style="stop-color:${avatarStyle.bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${avatarStyle.accentColor};stop-opacity:1" />
        </radialGradient>
        <clipPath id="avclip-${uid}"><circle cx="32" cy="32" r="30"/></clipPath>
      </defs>

      <circle cx="32" cy="32" r="30" fill="url(#avbg-${uid})"/>
      <g clip-path="url(#avclip-${uid})">
        ${createAvatarPattern(style, 64)}
        <!-- Shoulders / shirt -->
        <path d="M13 64 C13 50 23 45.5 32 45.5 C41 45.5 51 50 51 64 Z" fill="${shirt}"/>
        <path d="M27.5 46.5 L32 51.5 L36.5 46.5 L36.5 44 L27.5 44 Z" fill="${skinShadow}"/>
        <!-- Neck and ears -->
        <rect x="28.4" y="38" width="7.2" height="8" rx="2.5" fill="${skinShadow}"/>
        <circle cx="19.6" cy="30.5" r="2.7" fill="${skin}"/>
        <circle cx="44.4" cy="30.5" r="2.7" fill="${skin}"/>
        <!-- Head -->
        <circle cx="32" cy="30" r="12.5" fill="${skin}"/>
        <!-- Hair -->
        ${hairMarkup(hairStyle, hair)}
        <!-- Face -->
        <circle cx="27.4" cy="31" r="1.7" fill="#241a12"/>
        <circle cx="36.6" cy="31" r="1.7" fill="#241a12"/>
        <path d="M27.8 37.2 Q32 40.4 36.2 37.2" fill="none" stroke="#7a4a28" stroke-width="1.7" stroke-linecap="round"/>
        ${hairStyle === 'long' || hairStyle === 'bun' ? '<circle cx="23.4" cy="35.4" r="2.1" fill="#e8907c" opacity="0.45"/><circle cx="40.6" cy="35.4" r="2.1" fill="#e8907c" opacity="0.45"/>' : ''}
        <!-- Shine -->
        <ellipse cx="22" cy="14" rx="9" ry="5.5" fill="white" opacity="0.14"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="${avatarStyle.accentColor}" stroke-width="2"/>
    </svg>
  `
}

export function createPlayerCardSVG(name: string, initial: string, style: string = 'saffron', role: 'player' | 'partner' | 'opponent' = 'opponent'): string {
  const avatarStyle = avatarStyles[style] || avatarStyles.saffron

  return `
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="player-card-svg">
      <defs>
        <linearGradient id="card-${style}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${avatarStyle.bgColor};stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:${avatarStyle.accentColor};stop-opacity:0.08" />
        </linearGradient>
        <filter id="card-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.2"/>
        </filter>
      </defs>

      <!-- Card background -->
      <rect width="120" height="160" fill="url(#card-${style}-bg)" stroke="#407267" stroke-width="1" rx="6" filter="url(#card-shadow)"/>

      <!-- Avatar circle -->
      <circle cx="60" cy="50" r="35" fill="${avatarStyle.bgColor}" stroke="${avatarStyle.accentColor}" stroke-width="2"/>
      <circle cx="60" cy="50" r="33" fill="none" stroke="${avatarStyle.accentColor}" stroke-width="1" opacity="0.5"/>

      <!-- Initial in avatar -->
      <text x="60" y="60" font-family="DM Mono, monospace" font-size="32" font-weight="bold" fill="#173936" text-anchor="middle">${initial}</text>

      <!-- Shine -->
      <ellipse cx="45" cy="38" rx="10" ry="12" fill="white" opacity="0.2"/>

      <!-- Player name -->
      <text x="60" y="105" font-family="Manrope, sans-serif" font-size="13" font-weight="bold" fill="#f6f1e8" text-anchor="middle">${name}</text>

      <!-- Role indicator -->
      <g transform="translate(60, 125)">
        ${role === 'player' ? `
          <text x="0" y="0" font-family="DM Mono, monospace" font-size="9" fill="#d6aa58" font-weight="bold" text-anchor="middle">YOU</text>
        ` : role === 'partner' ? `
          <text x="0" y="0" font-family="DM Mono, monospace" font-size="9" fill="#8cc6bd" font-weight="bold" text-anchor="middle">PARTNER</text>
        ` : `
          <text x="0" y="0" font-family="DM Mono, monospace" font-size="9" fill="#9bb2a8" font-weight="bold" text-anchor="middle">OPPONENT</text>
        `}
      </g>

      <!-- Status indicator -->
      <circle cx="105" cy="15" r="5" fill="${role === 'player' ? '#d6aa58' : '#9bb2a8'}" opacity="0.8"/>
    </svg>
  `
}

export function createTeamBadgeSVG(teamName: string, color: string = '#d6aa58'): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="team-badge-svg">
      <defs>
        <filter id="badge-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Outer shield -->
      <path d="M 50,10 L 85,30 L 85,60 Q 85,85 50,95 Q 15,85 15,60 L 15,30 Z"
            fill="${color}" stroke="#8b6f47" stroke-width="1.5" opacity="0.9" filter="url(#badge-glow)"/>

      <!-- Inner shield highlight -->
      <path d="M 50,15 L 80,32 L 80,58 Q 80,80 50,88 Q 20,80 20,58 L 20,32 Z"
            fill="none" stroke="white" stroke-width="1" opacity="0.2"/>

      <!-- Team text -->
      <text x="50" y="55" font-family="Manrope, sans-serif" font-size="16" font-weight="bold" fill="#173936" text-anchor="middle">TEAM</text>
      <text x="50" y="70" font-family="DM Mono, monospace" font-size="11" fill="#173936" text-anchor="middle">${teamName.substring(0, 1)}</text>

      <!-- Corner ornaments -->
      <circle cx="25" cy="35" r="2" fill="white" opacity="0.5"/>
      <circle cx="75" cy="35" r="2" fill="white" opacity="0.5"/>
    </svg>
  `
}

export const AVATAR_STYLES = Object.keys(avatarStyles)
export const DEFAULT_AVATAR_COLORS = {
  'You': 'saffron',
  'Nimal': 'coral',
  'Amaya': 'sky',
  'Kasun': 'lavender',
  'Dilshan': 'mint',
  'Sahan': 'rose',
  'Tharushi': 'coral',
  'Isuru': 'sky',
  'Chathura': 'lavender'
}

export function getAvatarColor(playerName: string): string {
  return DEFAULT_AVATAR_COLORS[playerName as keyof typeof DEFAULT_AVATAR_COLORS] || 'saffron'
}
