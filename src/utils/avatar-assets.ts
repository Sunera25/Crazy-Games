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

export function createPlayerAvatarSVG(initial: string, style: string = 'saffron', size: number = 40): string {
  const s = size
  const avatarStyle = avatarStyles[style] || avatarStyles.saffron
  const pattern = createAvatarPattern(style, s)

  return `
    <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" class="avatar-svg avatar-${style}">
      <defs>
        <radialGradient id="avatar-${style}-gradient" cx="40%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:${avatarStyle.bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${avatarStyle.accentColor};stop-opacity:1" />
        </radialGradient>
        <filter id="avatar-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>

      <!-- Background circle -->
      <circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 1}" fill="url(#avatar-${style}-gradient)" filter="url(#avatar-shadow)"/>

      <!-- Pattern overlay -->
      <g clip-path="circle(${s / 2 - 1}px at ${s / 2}px ${s / 2}px)">
        ${pattern}
      </g>

      <!-- Border -->
      <circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 1}" fill="none" stroke="${avatarStyle.accentColor}" stroke-width="1" opacity="0.5"/>

      <!-- Text initial -->
      <text x="${s / 2}" y="${s / 2 + s * 0.15}" font-family="DM Mono, monospace" font-size="${s * 0.45}" font-weight="bold" fill="#173936" text-anchor="middle">${initial}</text>

      <!-- Shine effect -->
      <ellipse cx="${s * 0.35}" cy="${s * 0.35}" rx="${s * 0.15}" ry="${s * 0.2}" fill="white" opacity="0.15"/>
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
