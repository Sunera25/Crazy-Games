// UI assets for buttons, icons, loading screen, and UI elements
export function createSuitIconSVG(suit: 'clubs' | 'diamonds' | 'hearts' | 'spades', size: number = 24): string {
  const color = suit === 'hearts' || suit === 'diamonds' ? '#c65c52' : '#263c38'
  const centerX = size / 2
  const centerY = size / 2

  let symbol = ''
  if (suit === 'hearts') {
    symbol = `
      <path d="M ${centerX},${centerY - size * 0.25} C ${centerX},${centerY - size * 0.4} ${centerX + size * 0.15},${centerY - size * 0.45} ${centerX + size * 0.2},${centerY - size * 0.45}
               C ${centerX + size * 0.3},${centerY - size * 0.45} ${centerX + size * 0.35},${centerY - size * 0.35} ${centerX + size * 0.35},${centerY - size * 0.25}
               C ${centerX + size * 0.35},${centerY - size * 0.35} ${centerX + size * 0.35},${centerY - size * 0.45} ${centerX + size * 0.4},${centerY - size * 0.45}
               C ${centerX + size * 0.45},${centerY - size * 0.45} ${centerX + size * 0.5},${centerY - size * 0.4} ${centerX + size * 0.5},${centerY - size * 0.25}
               C ${centerX + size * 0.5},${centerY + size * 0.1} ${centerX},${centerY + size * 0.4} ${centerX},${centerY + size * 0.45}
               C ${centerX},${centerY + size * 0.4} ${centerX - size * 0.5},${centerY + size * 0.1} ${centerX - size * 0.5},${centerY - size * 0.25}
               C ${centerX - size * 0.5},${centerY - size * 0.4} ${centerX - size * 0.45},${centerY - size * 0.45} ${centerX - size * 0.4},${centerY - size * 0.45}
               C ${centerX - size * 0.35},${centerY - size * 0.45} ${centerX - size * 0.35},${centerY - size * 0.35} ${centerX - size * 0.35},${centerY - size * 0.25}
               C ${centerX - size * 0.35},${centerY - size * 0.45} ${centerX - size * 0.3},${centerY - size * 0.45} ${centerX - size * 0.2},${centerY - size * 0.45}
               C ${centerX - size * 0.15},${centerY - size * 0.45} ${centerX},${centerY - size * 0.4} ${centerX},${centerY - size * 0.25} Z"
        fill="${color}"/>
    `
  } else if (suit === 'diamonds') {
    symbol = `
      <path d="M ${centerX},${centerY - size * 0.4} L ${centerX + size * 0.35},${centerY} L ${centerX},${centerY + size * 0.4} L ${centerX - size * 0.35},${centerY} Z"
            fill="${color}"/>
      <path d="M ${centerX},${centerY - size * 0.25} L ${centerX + size * 0.2},${centerY - size * 0.1} L ${centerX},${centerY + size * 0.25} L ${centerX - size * 0.2},${centerY - size * 0.1} Z"
            fill="white" opacity="0.4"/>
    `
  } else if (suit === 'clubs') {
    symbol = `
      <circle cx="${centerX - size * 0.15}" cy="${centerY - size * 0.15}" r="${size * 0.15}" fill="${color}"/>
      <circle cx="${centerX + size * 0.15}" cy="${centerY - size * 0.15}" r="${size * 0.15}" fill="${color}"/>
      <circle cx="${centerX}" cy="${centerY + size * 0.1}" r="${size * 0.15}" fill="${color}"/>
      <rect x="${centerX - size * 0.05}" y="${centerY + size * 0.15}" width="${size * 0.1}" height="${size * 0.25}" fill="${color}"/>
      <circle cx="${centerX - size * 0.1}" cy="${centerY - size * 0.25}" r="${size * 0.05}" fill="white" opacity="0.5"/>
    `
  } else if (suit === 'spades') {
    symbol = `
      <path d="M ${centerX},${centerY - size * 0.4} C ${centerX},${centerY - size * 0.4} ${centerX + size * 0.35},${centerY} ${centerX},${centerY + size * 0.25}
               C ${centerX - size * 0.35},${centerY} ${centerX},${centerY - size * 0.4} ${centerX},${centerY - size * 0.4} Z"
            fill="${color}"/>
      <rect x="${centerX - size * 0.05}" y="${centerY + size * 0.2}" width="${size * 0.1}" height="${size * 0.25}" fill="${color}"/>
      <ellipse cx="${centerX - size * 0.15}" cy="${centerY + size * 0.1}" rx="${size * 0.1}" ry="${size * 0.08}" fill="white" opacity="0.4"/>
    `
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="suit-icon suit-${suit}">
      ${symbol}
    </svg>
  `
}

export function createLoadingScreenSVG(): string {
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="loading-screen">
      <defs>
        <style>
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-opacity { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
          .loading-spinner { animation: spin 2s linear infinite; }
          .loading-dot { animation: pulse-opacity 1.5s ease-in-out infinite; }
        </style>
        <linearGradient id="load-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1d5049;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#102d2d;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="400" height="300" fill="url(#load-bg)"/>

      <!-- Title -->
      <text x="200" y="60" font-family="Manrope, sans-serif" font-size="28" font-weight="bold" fill="#f6f1e8" text-anchor="middle">OMI</text>
      <text x="200" y="80" font-family="DM Mono, monospace" font-size="12" fill="#9bb2a8" text-anchor="middle" letter-spacing="2">PREPARING GAME</text>

      <!-- Animated spinner -->
      <g transform="translate(200, 150)" class="loading-spinner">
        <circle cx="0" cy="0" r="40" fill="none" stroke="#d6aa58" stroke-width="3" opacity="0.3"/>
        <circle cx="0" cy="-40" r="5" fill="#d6aa58"/>
      </g>

      <!-- Progress indicator -->
      <rect x="80" y="220" width="240" height="4" fill="#35675d" rx="2"/>
      <rect x="80" y="220" width="60" height="4" fill="#d6aa58" rx="2" opacity="0.7" class="loading-bar"/>

      <!-- Loading dots -->
      <circle cx="150" cy="260" r="3" fill="#d6aa58" class="loading-dot"/>
      <circle cx="200" cy="260" r="3" fill="#d6aa58" class="loading-dot" style="animation-delay: 0.3s"/>
      <circle cx="250" cy="260" r="3" fill="#d6aa58" class="loading-dot" style="animation-delay: 0.6s"/>

      <!-- Tips/hints -->
      <text x="200" y="290" font-family="DM Mono, monospace" font-size="10" fill="#9bb2a8" text-anchor="middle" opacity="0.7">Loading your game...</text>
    </svg>
  `
}

export function createVictoryScreenSVG(): string {
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="victory-screen">
      <defs>
        <style>
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
          .bounce-text { animation: bounce 1s ease-in-out infinite; }
        </style>
        <linearGradient id="victory-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2a6b61;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a4944;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="trophy-glow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" style="stop-color:#d6aa58;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#d6aa58;stop-opacity:0" />
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="400" height="300" fill="url(#victory-bg)"/>

      <!-- Glow effect -->
      <circle cx="200" cy="100" r="100" fill="url(#trophy-glow)"/>

      <!-- Trophy -->
      <g transform="translate(200, 80)">
        <!-- Base -->
        <rect x="-30" y="50" width="60" height="8" fill="#d6aa58" rx="2"/>
        <rect x="-35" y="58" width="70" height="4" fill="#c2a04a" rx="1"/>

        <!-- Stem -->
        <rect x="-8" y="30" width="16" height="20" fill="#d6aa58"/>

        <!-- Cup -->
        <path d="M -25,30 L -20,10 L 20,10 L 25,30 Z" fill="#d6aa58" stroke="#c2a04a" stroke-width="1"/>

        <!-- Cup highlight -->
        <ellipse cx="-10" cy="15" rx="8" ry="4" fill="#f5e6c8" opacity="0.5"/>

        <!-- Handles -->
        <path d="M -20,20 Q -35,20 -35,30" fill="none" stroke="#d6aa58" stroke-width="3"/>
        <path d="M 20,20 Q 35,20 35,30" fill="none" stroke="#d6aa58" stroke-width="3"/>
      </g>

      <!-- Text -->
      <text x="200" y="180" font-family="Manrope, sans-serif" font-size="36" font-weight="bold" fill="#f6f1e8" text-anchor="middle" class="bounce-text">YOU WIN!</text>
      <text x="200" y="210" font-family="DM Mono, monospace" font-size="14" fill="#9bb2a8" text-anchor="middle">Congratulations on your victory!</text>

      <!-- Stars -->
      <text x="80" y="150" font-size="24">⭐</text>
      <text x="320" y="150" font-size="24">⭐</text>
    </svg>
  `
}

export function createDefeatScreenSVG(): string {
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="defeat-screen">
      <defs>
        <style>
          @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
          .shake-text { animation: shake 0.5s ease-in-out infinite; }
        </style>
        <linearGradient id="defeat-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3a4a48;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d3432;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="400" height="300" fill="url(#defeat-bg)"/>

      <!-- Sad emoji/circle -->
      <circle cx="200" cy="100" r="50" fill="#193f3c" stroke="#d6aa58" stroke-width="2" opacity="0.7"/>

      <!-- Eyes -->
      <circle cx="180" cy="85" r="5" fill="#d6aa58"/>
      <circle cx="220" cy="85" r="5" fill="#d6aa58"/>

      <!-- Sad mouth -->
      <path d="M 180 110 Q 200 100 220 110" fill="none" stroke="#d6aa58" stroke-width="2" stroke-linecap="round"/>

      <!-- Text -->
      <text x="200" y="180" font-family="Manrope, sans-serif" font-size="36" font-weight="bold" fill="#b8cec0" text-anchor="middle" class="shake-text">RIVALS WIN</text>
      <text x="200" y="210" font-family="DM Mono, monospace" font-size="14" fill="#9bb2a8" text-anchor="middle">Better luck next time!</text>

      <!-- Raindrops effect -->
      <circle cx="100" cy="150" r="2" fill="#4c7d6c" opacity="0.4"/>
      <circle cx="300" cy="170" r="2" fill="#4c7d6c" opacity="0.4"/>
      <circle cx="150" cy="190" r="2" fill="#4c7d6c" opacity="0.4"/>
      <circle cx="250" cy="200" r="2" fill="#4c7d6c" opacity="0.4"/>
    </svg>
  `
}

export function createButtonSVG(label: string, type: 'primary' | 'secondary' = 'primary'): string {
  const bgColor = type === 'primary' ? '#e6b45a' : 'transparent'
  const textColor = type === 'primary' ? '#193c36' : '#d7e6db'
  const borderColor = type === 'primary' ? '#dbad58' : '#6d9484'

  return `
    <svg viewBox="0 0 160 48" xmlns="http://www.w3.org/2000/svg" class="button-svg button-${type}">
      <defs>
        <filter id="btn-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.2"/>
        </filter>
      </defs>

      <!-- Button background -->
      <rect x="2" y="2" width="156" height="44" fill="${bgColor}" stroke="${borderColor}" stroke-width="1.5" rx="4" filter="url(#btn-shadow)"/>

      <!-- Highlight on top -->
      <rect x="2" y="2" width="156" height="22" fill="white" opacity="0.1" rx="4"/>

      <!-- Text placeholder (will be replaced with label) -->
      <text x="80" y="28" font-family="Manrope, sans-serif" font-size="13" font-weight="700" fill="${textColor}" text-anchor="middle">${label}</text>
    </svg>
  `
}

export function createTrumpPanelSVG(suit: string = '♠'): string {
  return `
    <svg viewBox="0 0 140 50" xmlns="http://www.w3.org/2000/svg" class="trump-panel-svg">
      <defs>
        <linearGradient id="trump-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1f4a45;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#153d3a;stop-opacity:1" />
        </linearGradient>
        <filter id="trump-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.2"/>
        </filter>
      </defs>

      <!-- Background panel -->
      <rect width="140" height="50" fill="url(#trump-bg)" stroke="#407267" stroke-width="1" rx="4" filter="url(#trump-shadow)"/>

      <!-- Label -->
      <text x="10" y="16" font-family="DM Mono, monospace" font-size="8" fill="#9db9ac" font-weight="bold" letter-spacing="1">TRUMP</text>

      <!-- Suit display -->
      <g transform="translate(50, 25)">
        <text x="0" y="0" font-size="28" text-anchor="middle" dominant-baseline="middle" fill="#d6aa58">${suit}</text>
      </g>

      <!-- Indicator dot -->
      <circle cx="130" cy="25" r="4" fill="#d6aa58" opacity="0.8"/>
      <circle cx="130" cy="25" r="2" fill="#d6aa58" opacity="0.5"/>
    </svg>
  `
}
