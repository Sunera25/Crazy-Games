// Game board and table decorative elements
export function createTableBackgroundSVG(): string {
  return `
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" class="table-bg-svg">
      <defs>
        <radialGradient id="table-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#d4a64c;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#d4a64c;stop-opacity:0" />
        </radialGradient>
        <pattern id="felt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#20534b"/>
          <circle cx="10" cy="10" r="0.5" fill="#2a6b61" opacity="0.3"/>
          <circle cx="30" cy="20" r="0.5" fill="#2a6b61" opacity="0.3"/>
          <circle cx="20" cy="30" r="0.5" fill="#2a6b61" opacity="0.3"/>
        </pattern>
      </defs>

      <!-- Felt background -->
      <rect width="600" height="500" fill="url(#felt-pattern)"/>

      <!-- Glow effect -->
      <circle cx="300" cy="250" r="250" fill="url(#table-glow)"/>

      <!-- Outer circle lines -->
      <circle cx="300" cy="250" r="220" fill="none" stroke="#4c7d6c" stroke-width="1.5" opacity="0.6"/>
      <circle cx="300" cy="250" r="180" fill="none" stroke="#4c7d6c" stroke-width="1" opacity="0.4"/>
      <circle cx="300" cy="250" r="140" fill="none" stroke="#4c7d6c" stroke-width="1" opacity="0.3"/>
      <circle cx="300" cy="250" r="100" fill="none" stroke="#4c7d6c" stroke-width="1" opacity="0.25"/>

      <!-- Compass lines (cardinal directions) -->
      <line x1="300" y1="50" x2="300" y2="450" stroke="#4c7d6c" stroke-width="1" opacity="0.3"/>
      <line x1="100" y1="250" x2="500" y2="250" stroke="#4c7d6c" stroke-width="1" opacity="0.3"/>

      <!-- Diagonal lines -->
      <line x1="150" y1="100" x2="450" y2="400" stroke="#4c7d6c" stroke-width="0.8" opacity="0.2"/>
      <line x1="450" y1="100" x2="150" y2="400" stroke="#4c7d6c" stroke-width="0.8" opacity="0.2"/>

      <!-- Center accent -->
      <circle cx="300" cy="250" r="40" fill="none" stroke="#d3a755" stroke-width="2" opacity="0.4"/>
      <circle cx="300" cy="250" r="30" fill="none" stroke="#d3a755" stroke-width="1" opacity="0.3"/>

      <!-- Corner ornaments -->
      <g opacity="0.5">
        <circle cx="30" cy="30" r="15" fill="none" stroke="#d3a755" stroke-width="1"/>
        <circle cx="570" cy="30" r="15" fill="none" stroke="#d3a755" stroke-width="1"/>
        <circle cx="30" cy="470" r="15" fill="none" stroke="#d3a755" stroke-width="1"/>
        <circle cx="570" cy="470" r="15" fill="none" stroke="#d3a755" stroke-width="1"/>
      </g>
    </svg>
  `
}

export function createPlayerPositionIndicatorSVG(position: 'top' | 'left' | 'right' | 'bottom', isActive: boolean): string {
  const size = 80
  const active = isActive
  const opacity = active ? 1 : 0.5
  const color = active ? '#d3a755' : '#6b9487'

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="position-indicator">
      <defs>
        <filter id="pos-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${active ? 2 : 1}"/>
        </filter>
      </defs>

      <!-- Background circle -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#193f3c" stroke="${color}" stroke-width="2" opacity="${opacity}" filter="url(#pos-glow)"/>

      <!-- Inner circle -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity * 0.6}"/>

      <!-- Position indicator arrow/symbol -->
      ${position === 'top' ? `
        <polygon points="${size / 2},10 ${size / 2 + 8},20 ${size / 2 - 8},20" fill="${color}" opacity="${opacity}"/>
      ` : position === 'bottom' ? `
        <polygon points="${size / 2},${size - 10} ${size / 2 + 8},${size - 20} ${size / 2 - 8},${size - 20}" fill="${color}" opacity="${opacity}"/>
      ` : position === 'left' ? `
        <polygon points="10,${size / 2} 20,${size / 2 + 8} 20,${size / 2 - 8}" fill="${color}" opacity="${opacity}"/>
      ` : `
        <polygon points="${size - 10},${size / 2} ${size - 20},${size / 2 + 8} ${size - 20},${size / 2 - 8}" fill="${color}" opacity="${opacity}"/>
      `}

      <!-- Active pulse -->
      ${active ? `
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="none" stroke="${color}" stroke-width="1" opacity="0.3" class="pulse-ring"/>
      ` : ''}
    </svg>
  `
}

export function createTrickZoneIndicatorSVG(): string {
  return `
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" class="trick-zone-indicator">
      <defs>
        <linearGradient id="trick-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2a6b61;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#1a4944;stop-opacity:0.1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="200" height="160" fill="url(#trick-bg)" stroke="#78a38b" stroke-width="1.5" stroke-dasharray="5,5" rx="8" opacity="0.7"/>

      <!-- Inner frame -->
      <rect x="8" y="8" width="184" height="144" fill="none" stroke="#4c7d6c" stroke-width="1" rx="4" opacity="0.5"/>

      <!-- Center spot for cards -->
      <circle cx="100" cy="80" r="50" fill="none" stroke="#d3a755" stroke-width="1.5" opacity="0.4" stroke-dasharray="3,3"/>

      <!-- Corner accents -->
      <circle cx="15" cy="15" r="3" fill="#d3a755" opacity="0.4"/>
      <circle cx="185" cy="15" r="3" fill="#d3a755" opacity="0.4"/>
      <circle cx="15" cy="145" r="3" fill="#d3a755" opacity="0.4"/>
      <circle cx="185" cy="145" r="3" fill="#d3a755" opacity="0.4"/>
    </svg>
  `
}

export function createScoreBoardSVG(): string {
  return `
    <svg viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg" class="scoreboard-svg">
      <defs>
        <linearGradient id="score-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#255450;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#193f3c;stop-opacity:0.6" />
        </linearGradient>
      </defs>

      <!-- Background panel -->
      <rect width="180" height="80" fill="url(#score-bg)" stroke="#407267" stroke-width="1.5" rx="6"/>

      <!-- Inner highlight -->
      <rect x="2" y="2" width="176" height="76" fill="none" stroke="#5a9280" stroke-width="1" rx="5" opacity="0.3"/>

      <!-- Left team section -->
      <g>
        <text x="12" y="20" font-family="DM Mono, monospace" font-size="9" fill="#9db9ac" font-weight="bold">TEAM A</text>
        <text x="12" y="50" font-family="DM Mono, monospace" font-size="32" fill="#efc16a" font-weight="bold">0</text>
        <rect x="6" y="62" width="60" height="2" fill="#5a9280" rx="1" opacity="0.5"/>
      </g>

      <!-- Right team section -->
      <g>
        <text x="112" y="20" font-family="DM Mono, monospace" font-size="9" fill="#9db9ac" font-weight="bold">TEAM B</text>
        <text x="112" y="50" font-family="DM Mono, monospace" font-size="32" fill="#efc16a" font-weight="bold">0</text>
        <rect x="114" y="62" width="60" height="2" fill="#5a9280" rx="1" opacity="0.5"/>
      </g>

      <!-- Center divider -->
      <line x1="90" y1="8" x2="90" y2="72" stroke="#407267" stroke-width="1" opacity="0.5"/>
    </svg>
  `
}
