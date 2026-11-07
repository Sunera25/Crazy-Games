// Player avatar designs and SVG generation
export interface AvatarStyle {
  name: string
  bgColor: string
  accentColor: string
  pattern: string
  glowColor?: string
}

const avatarStyles: Record<string, AvatarStyle> = {
  saffron: { name: 'Saffron', bgColor: '#e6b55a', accentColor: '#d4a045', pattern: 'stripe' },
  coral: { name: 'Coral', bgColor: '#de806c', accentColor: '#c65c52', pattern: 'dot' },
  sky: { name: 'Sky', bgColor: '#8cc6bd', accentColor: '#6b9487', pattern: 'line' },
  lavender: { name: 'Lavender', bgColor: '#b8a8d8', accentColor: '#9686b8', pattern: 'checker' },
  mint: { name: 'Mint', bgColor: '#a8dcc8', accentColor: '#7fb5a0', pattern: 'wave' },
  rose: { name: 'Rose', bgColor: '#e8b5c9', accentColor: '#d68fa8', pattern: 'grid' },
  gold: { name: 'Royal Gold', bgColor: '#f6d365', accentColor: '#fda085', pattern: 'royal', glowColor: '#ffd700' },
  emerald: { name: 'High Roller', bgColor: '#10b981', accentColor: '#047857', pattern: 'velvet', glowColor: '#34d399' },
  ruby: { name: 'Crimson Ace', bgColor: '#f43f5e', accentColor: '#9f1239', pattern: 'diamond', glowColor: '#fb7185' },
  cyber: { name: 'Cyberpunk', bgColor: '#00f0ff', accentColor: '#7928ca', pattern: 'cyber', glowColor: '#00f0ff' },
  midnight: { name: 'Cosmic Ace', bgColor: '#818cf8', accentColor: '#312e81', pattern: 'stars', glowColor: '#c084fc' },
  obsidian: { name: 'Shadow Monarch', bgColor: '#374151', accentColor: '#d4af37', pattern: 'goldlines', glowColor: '#f59e0b' }
}

function createAvatarPattern(style: string, size: number): string {
  const pattern = avatarStyles[style]?.pattern || 'stripe'
  const color = avatarStyles[style]?.accentColor || '#999'

  switch (pattern) {
    case 'royal':
      return `
        <polygon points="${size * 0.5},${size * 0.15} ${size * 0.58},${size * 0.3} ${size * 0.42},${size * 0.3}" fill="${color}" opacity="0.35"/>
        <circle cx="${size * 0.5}" cy="${size * 0.12}" r="${size * 0.04}" fill="#fde047" opacity="0.5"/>
        <line x1="${size * 0.1}" y1="${size * 0.4}" x2="${size * 0.9}" y2="${size * 0.4}" stroke="${color}" stroke-width="${size * 0.03}" stroke-dasharray="2 3" opacity="0.25"/>
      `
    case 'velvet':
      return `
        <rect x="0" y="0" width="${size}" height="${size}" fill="${color}" opacity="0.12"/>
        <path d="M 0,${size * 0.4} Q ${size * 0.5},${size * 0.25} ${size},${size * 0.4}" fill="none" stroke="${color}" stroke-width="${size * 0.05}" opacity="0.3"/>
        <circle cx="${size * 0.5}" cy="${size * 0.3}" r="${size * 0.06}" fill="#fde047" opacity="0.4"/>
      `
    case 'diamond':
      return `
        <polygon points="${size * 0.5},${size * 0.1} ${size * 0.65},${size * 0.28} ${size * 0.5},${size * 0.46} ${size * 0.35},${size * 0.28}" fill="${color}" opacity="0.3"/>
        <polygon points="${size * 0.2},${size * 0.5} ${size * 0.3},${size * 0.6} ${size * 0.2},${size * 0.7} ${size * 0.1},${size * 0.6}" fill="${color}" opacity="0.25"/>
        <polygon points="${size * 0.8},${size * 0.5} ${size * 0.9},${size * 0.6} ${size * 0.8},${size * 0.7} ${size * 0.7},${size * 0.6}" fill="${color}" opacity="0.25"/>
      `
    case 'cyber':
      return `
        <path d="M 0,${size * 0.25} L ${size * 0.4},${size * 0.25} L ${size * 0.55},${size * 0.4} L ${size},${size * 0.4}" fill="none" stroke="#00f0ff" stroke-width="${size * 0.04}" opacity="0.4"/>
        <circle cx="${size * 0.4}" cy="${size * 0.25}" r="${size * 0.04}" fill="#f43f5e" opacity="0.8"/>
        <circle cx="${size * 0.55}" cy="${size * 0.4}" r="${size * 0.04}" fill="#f43f5e" opacity="0.8"/>
      `
    case 'stars':
      return `
        <polygon points="${size * 0.2},${size * 0.15} ${size * 0.23},${size * 0.22} ${size * 0.3},${size * 0.22} ${size * 0.25},${size * 0.27} ${size * 0.27},${size * 0.34} ${size * 0.2},${size * 0.29} ${size * 0.13},${size * 0.34} ${size * 0.15},${size * 0.27} ${size * 0.1},${size * 0.22} ${size * 0.17},${size * 0.22}" fill="#e0e7ff" opacity="0.45"/>
        <circle cx="${size * 0.75}" cy="${size * 0.2}" r="${size * 0.03}" fill="#fde047" opacity="0.6"/>
        <circle cx="${size * 0.85}" cy="${size * 0.35}" r="${size * 0.02}" fill="#ffffff" opacity="0.7"/>
      `
    case 'goldlines':
      return `
        <line x1="${size * 0.15}" y1="0" x2="${size * 0.85}" y2="${size}" stroke="#fbbf24" stroke-width="${size * 0.03}" opacity="0.3"/>
        <line x1="${size * 0.85}" y1="0" x2="${size * 0.15}" y2="${size}" stroke="#fbbf24" stroke-width="${size * 0.03}" opacity="0.3"/>
        <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.15}" fill="none" stroke="#fbbf24" stroke-width="${size * 0.03}" opacity="0.25"/>
      `
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

// Character face parameters
const skinTones = ['#8d5524', '#a0662f', '#b07a45', '#c68863', '#96613a', '#7c4a21']
const skinShadows = ['#74431b', '#875226', '#96653a', '#ac7452', '#7d4f2d', '#653b19']
const hairColors = ['#1d1712', '#2b1c11', '#3d2a17', '#17141a', '#4a3220', '#b45309']
const shirtColors = ['#b8542f', '#2f6db8', '#3d9970', '#7d5ba6', '#c94f7c', '#2a9d8f', '#1f2937', '#b91c1c', '#047857']

type HairStyleName = 'short' | 'curly' | 'bun' | 'long' | 'cap' | 'fade' | 'slick'
const hairByName: Record<string, HairStyleName> = {
  You: 'cap',
  Amaya: 'long',
  Tharushi: 'bun',
  Sovereign: 'slick',
  Empress: 'bun',
  Victor: 'short',
  Zephyr: 'fade'
}

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return hash
}

function hairMarkup(style: HairStyleName, hair: string, accent: string): string {
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
      return `<path d="M19.5 29 a12.5 12.5 0 0 1 25 0 Z" fill="${accent}"/>
        <rect x="17.5" y="28" width="29" height="3.2" rx="1.6" fill="${accent}"/>
        <circle cx="32" cy="16.8" r="1.9" fill="${accent}"/>`
    case 'fade':
      return `<path d="M21.5 27.5 a10.5 10.5 0 0 1 21 0 Z" fill="${hair}"/>`
    case 'slick':
      return `<path d="M19.5 28 C19.5 18 26 16 32 16 C38 16 44.5 18 44.5 28 Z" fill="${hair}"/>`
    case 'short':
    default:
      return `${topHalf}<rect x="19.3" y="27" width="2.6" height="5.5" rx="1.3" fill="${hair}"/><rect x="42.1" y="27" width="2.6" height="5.5" rx="1.3" fill="${hair}"/>`
  }
}

function accessoryMarkup(accessory?: string): string {
  if (!accessory) return ''
  switch (accessory) {
    case 'crown':
      return `
        <g class="acc-crown">
          <path d="M18 19 L21.5 10 L27 15.5 L32 8 L37 15.5 L42.5 10 L46 19 Z" fill="#ffd700" stroke="#b45309" stroke-width="1.1"/>
          <rect x="18" y="18" width="28" height="3.5" rx="1" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
          <circle cx="32" cy="14" r="2.2" fill="#ef4444"/>
          <circle cx="24" cy="16" r="1.5" fill="#10b981"/>
          <circle cx="40" cy="16" r="1.5" fill="#3b82f6"/>
          <circle cx="32" cy="8" r="1.8" fill="#fef08a"/>
          <circle cx="21.5" cy="10" r="1.4" fill="#fef08a"/>
          <circle cx="42.5" cy="10" r="1.4" fill="#fef08a"/>
        </g>
      `
    case 'tiara':
      return `
        <g class="acc-tiara">
          <path d="M21 21 Q32 13 43 21 Q32 16.5 21 21 Z" fill="#fde047" stroke="#ca8a04" stroke-width="0.9"/>
          <circle cx="32" cy="15.5" r="2.2" fill="#38bdf8"/>
          <circle cx="26.5" cy="17.5" r="1.5" fill="#ec4899"/>
          <circle cx="37.5" cy="17.5" r="1.5" fill="#ec4899"/>
        </g>
      `
    case 'crown-jewel':
      return `
        <g class="acc-crown-jewel">
          <path d="M20 18 Q32 10 44 18 Z" fill="#991b1b"/>
          <path d="M19 18 L23 11 L28 15 L32 9 L36 15 L41 11 L45 18 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
          <rect x="19" y="17.5" width="26" height="3" fill="#ca8a04"/>
          <circle cx="32" cy="14" r="2" fill="#3b82f6"/>
        </g>
      `
    case 'cyber-crown':
      return `
        <g class="acc-cyber-crown">
          <polygon points="19,18 24,9 28,14 32,7 36,14 40,9 45,18" fill="none" stroke="#00f0ff" stroke-width="1.8"/>
          <circle cx="32" cy="7" r="1.8" fill="#f43f5e"/>
          <circle cx="24" cy="9" r="1.4" fill="#00f0ff"/>
          <circle cx="40" cy="9" r="1.4" fill="#00f0ff"/>
          <line x1="19" y1="18" x2="45" y2="18" stroke="#00f0ff" stroke-width="1.8"/>
        </g>
      `
    case 'cosmic-halo':
      return `
        <g class="acc-cosmic">
          <ellipse cx="32" cy="13" rx="18" ry="4" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="3 2"/>
          <circle cx="20" cy="13" r="1.4" fill="#e9d5ff"/>
          <circle cx="44" cy="13" r="1.4" fill="#e9d5ff"/>
          <circle cx="32" cy="9" r="1.6" fill="#fbcfe8"/>
        </g>
      `
    case 'cyber-visor':
      return `
        <g class="acc-cyber">
          <path d="M18.5 28 L45.5 28 L44 34.5 L20 34.5 Z" fill="#00f0ff" opacity="0.9"/>
          <rect x="18" y="27.5" width="28" height="6.5" rx="2" fill="none" stroke="#f43f5e" stroke-width="1.3"/>
          <line x1="20" y1="31" x2="44" y2="31" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <circle cx="18.5" cy="31" r="1.5" fill="#f43f5e"/>
          <circle cx="45.5" cy="31" r="1.5" fill="#f43f5e"/>
        </g>
      `
    case 'shades':
      return `
        <g class="acc-shades">
          <rect x="21" y="27.5" width="10.5" height="7.5" rx="2.5" fill="#111827" stroke="#fbbf24" stroke-width="1"/>
          <rect x="32.5" y="27.5" width="10.5" height="7.5" rx="2.5" fill="#111827" stroke="#fbbf24" stroke-width="1"/>
          <line x1="31" y1="29.5" x2="33" y2="29.5" stroke="#fbbf24" stroke-width="1.2"/>
          <path d="M22.5 29 L29 29" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <path d="M34 29 L40.5 29" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
        </g>
      `
    case 'gold-shades':
      return `
        <g class="acc-gold-shades">
          <rect x="21" y="27" width="10.5" height="8" rx="2.5" fill="#d97706" stroke="#fef08a" stroke-width="1.2"/>
          <rect x="32.5" y="27" width="10.5" height="8" rx="2.5" fill="#d97706" stroke="#fef08a" stroke-width="1.2"/>
          <line x1="31" y1="29.5" x2="33" y2="29.5" stroke="#fef08a" stroke-width="1.4"/>
          <path d="M22.5 29.5 L28 32.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
          <path d="M34 29.5 L39.5 32.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
        </g>
      `
    case 'headphones':
      return `
        <g class="acc-headphones">
          <path d="M17.5 31 A14.5 14.5 0 0 1 46.5 31" fill="none" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round"/>
          <rect x="15" y="26" width="4.5" height="10" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
          <rect x="44.5" y="26" width="4.5" height="10" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
        </g>
      `
    case 'top-hat':
      return `
        <g class="acc-tophat">
          <rect x="16" y="20" width="32" height="3" rx="1.5" fill="#18181b" stroke="#27272a" stroke-width="0.8"/>
          <path d="M21 20 L22 8 L42 8 L43 20 Z" fill="#18181b"/>
          <rect x="21" y="16.5" width="22" height="3.5" fill="#e11d48"/>
          <circle cx="26" cy="18.2" r="1.2" fill="#fde047"/>
          <text x="32" y="15" font-size="6" fill="#fde047" text-anchor="middle" font-weight="bold">♠</text>
        </g>
      `
    case 'monocle':
      return `
        <g class="acc-monocle">
          <circle cx="36.6" cy="31" r="4.2" fill="none" stroke="#f59e0b" stroke-width="1.2"/>
          <line x1="40" y1="34" x2="42" y2="42" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="1 1"/>
        </g>
      `
    case 'glasses':
      return `
        <g class="acc-glasses">
          <circle cx="27.4" cy="31" r="3.4" fill="none" stroke="#e2e8f0" stroke-width="1.2"/>
          <circle cx="36.6" cy="31" r="3.4" fill="none" stroke="#e2e8f0" stroke-width="1.2"/>
          <line x1="30.8" y1="31" x2="33.2" y2="31" stroke="#e2e8f0" stroke-width="1"/>
        </g>
      `
    case 'cap':
    default:
      return ''
  }
}

export function createPlayerAvatarSVG(
  name: string,
  style: string = 'saffron',
  size: number = 40,
  accessory?: string,
  tier: string = 'free'
): string {
  const avatarStyle = avatarStyles[style] || avatarStyles.saffron
  const hash = hashName(name || 'You')
  const skin = skinTones[hash % skinTones.length]
  const skinShadow = skinShadows[hash % skinShadows.length]
  const hair = hairColors[Math.floor(hash / 7) % hairColors.length]
  const shirt = name === 'You' ? '#d6aa58' : shirtColors[Math.floor(hash / 13) % shirtColors.length]
  const hairStyle = hairByName[name] || (['short', 'curly', 'fade'] as HairStyleName[])[hash % 3]
  const uid = `${style}-${hash % 997}-${tier}`

  const isLegendary = tier === 'legendary'
  const isElite = tier === 'elite'
  const isStylish = tier === 'stylish'

  const borderStroke = isLegendary
    ? `url(#avleg-${uid})`
    : isElite
      ? '#ffd700'
      : isStylish
        ? '#38bdf8'
        : avatarStyle.accentColor

  const borderWidth = isLegendary ? 3 : isElite ? 2.5 : 2

  return `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="avatar-svg avatar-${style} tier-${tier}" role="img" aria-label="${name}">
      <defs>
        <radialGradient id="avbg-${uid}" cx="40%" cy="35%" r="70%">
          <stop offset="0%" style="stop-color:${avatarStyle.bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${avatarStyle.accentColor};stop-opacity:1" />
        </radialGradient>
        <linearGradient id="avleg-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fef08a" />
          <stop offset="50%" style="stop-color:#f59e0b" />
          <stop offset="100%" style="stop-color:#fbbf24" />
        </linearGradient>
        <clipPath id="avclip-${uid}"><circle cx="32" cy="32" r="29"/></clipPath>
      </defs>

      <!-- Avatar background -->
      <circle cx="32" cy="32" r="29" fill="url(#avbg-${uid})"/>
      
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
        ${hairMarkup(hairStyle, hair, avatarStyle.accentColor)}
        <!-- Face features -->
        <circle cx="27.4" cy="31" r="1.7" fill="#241a12"/>
        <circle cx="36.6" cy="31" r="1.7" fill="#241a12"/>
        <path d="M27.8 37.2 Q32 40.4 36.2 37.2" fill="none" stroke="#7a4a28" stroke-width="1.7" stroke-linecap="round"/>
        ${hairStyle === 'long' || hairStyle === 'bun' ? '<circle cx="23.4" cy="35.4" r="2.1" fill="#e8907c" opacity="0.45"/><circle cx="40.6" cy="35.4" r="2.1" fill="#e8907c" opacity="0.45"/>' : ''}
        <!-- Accessory overlay (crown, shades, visor, etc.) -->
        ${accessoryMarkup(accessory)}
        <!-- Ambient shine highlight -->
        <ellipse cx="22" cy="14" rx="9" ry="5.5" fill="white" opacity="0.14"/>
      </g>

      <!-- Outer border ring -->
      <circle cx="32" cy="32" r="29" fill="none" stroke="${borderStroke}" stroke-width="${borderWidth}"/>
      ${isLegendary ? `
        <!-- Legendary star studs -->
        <polygon points="32,1 33.5,3.5 32,6 30.5,3.5" fill="#fde047"/>
        <polygon points="32,58 33.5,60.5 32,63 30.5,60.5" fill="#fde047"/>
        <polygon points="1,32 3.5,33.5 6,32 3.5,30.5" fill="#fde047"/>
        <polygon points="58,32 60.5,33.5 63,32 60.5,30.5" fill="#fde047"/>
      ` : ''}
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
