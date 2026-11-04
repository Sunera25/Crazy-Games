// Animation-specific assets like particles and special effects
export function createParticleEffectSVG(type: 'confetti' | 'sparkle' | 'card-flip' | 'win-burst'): string {
  switch (type) {
    case 'confetti':
      return `
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="particle-effect confetti">
          <defs>
            <style>
              @keyframes fall { 0% { transform: translateY(0) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(300px) rotateZ(720deg); opacity: 0; } }
              @keyframes sway { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(20px); } }
              .confetti-piece { animation: fall 2.5s ease-in infinite, sway 0.5s ease-in-out infinite; }
            </style>
          </defs>

          <!-- Confetti pieces -->
          <rect x="20" y="0" width="8" height="8" fill="#d6aa58" class="confetti-piece" style="animation-delay: 0s"/>
          <rect x="60" y="0" width="8" height="8" fill="#e6b55a" class="confetti-piece" style="animation-delay: 0.1s"/>
          <rect x="100" y="0" width="8" height="8" fill="#d68fa8" class="confetti-piece" style="animation-delay: 0.2s"/>
          <rect x="140" y="0" width="8" height="8" fill="#8cc6bd" class="confetti-piece" style="animation-delay: 0.3s"/>
          <rect x="180" y="0" width="8" height="8" fill="#de806c" class="confetti-piece" style="animation-delay: 0.4s"/>
          <rect x="220" y="0" width="8" height="8" fill="#d6aa58" class="confetti-piece" style="animation-delay: 0.5s"/>
          <rect x="260" y="0" width="8" height="8" fill="#b8a8d8" class="confetti-piece" style="animation-delay: 0.6s"/>
          <rect x="300" y="0" width="8" height="8" fill="#a8dcc8" class="confetti-piece" style="animation-delay: 0.7s"/>
          <rect x="340" y="0" width="8" height="8" fill="#d6aa58" class="confetti-piece" style="animation-delay: 0.8s"/>
          <rect x="380" y="0" width="8" height="8" fill="#e6b55a" class="confetti-piece" style="animation-delay: 0.9s"/>
        </svg>
      `

    case 'sparkle':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="particle-effect sparkle">
          <defs>
            <style>
              @keyframes sparkle-burst { 0% { r: 0; opacity: 1; } 100% { r: 100px; opacity: 0; } }
              @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
              .sparkle { animation: twinkle 0.8s ease-in-out infinite; }
              .burst-particle { animation: sparkle-burst 1.5s ease-out; }
            </style>
          </defs>

          <!-- Center bright flash -->
          <circle cx="100" cy="100" r="0" fill="#d6aa58" class="burst-particle"/>

          <!-- Star points -->
          <g class="sparkle">
            <polygon points="100,30 110,90 170,100 110,110 100,170 90,110 30,100 90,90" fill="#d6aa58" opacity="0.8"/>
          </g>

          <!-- Outer twinkles -->
          <g class="sparkle" style="animation-delay: 0.2s">
            <circle cx="100" cy="50" r="4" fill="#d6aa58"/>
            <circle cx="150" cy="100" r="4" fill="#d6aa58"/>
            <circle cx="100" cy="150" r="4" fill="#d6aa58"/>
            <circle cx="50" cy="100" r="4" fill="#d6aa58"/>
          </g>

          <!-- Diagonal twinkles -->
          <g class="sparkle" style="animation-delay: 0.4s">
            <circle cx="130" cy="70" r="3" fill="#f5e6c8"/>
            <circle cx="130" cy="130" r="3" fill="#f5e6c8"/>
            <circle cx="70" cy="130" r="3" fill="#f5e6c8"/>
            <circle cx="70" cy="70" r="3" fill="#f5e6c8"/>
          </g>
        </svg>
      `

    case 'card-flip':
      return `
        <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" class="particle-effect card-flip">
          <defs>
            <style>
              @keyframes flip-rotate { 0% { transform: rotateY(0deg); } 50% { transform: rotateY(90deg); } 100% { transform: rotateY(0deg); } }
              .flipping-card { animation: flip-rotate 0.8s ease-in-out; }
            </style>
            <linearGradient id="flip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#faf8f3;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f5eddd;stop-opacity:1" />
            </linearGradient>
          </defs>

          <!-- Card -->
          <rect width="100" height="150" fill="url(#flip-gradient)" stroke="#d9c9a6" stroke-width="1.5" rx="6" class="flipping-card"/>

          <!-- Card back pattern -->
          <circle cx="50" cy="75" r="25" fill="none" stroke="#d3a755" stroke-width="1.5" opacity="0.4"/>
          <circle cx="50" cy="75" r="15" fill="none" stroke="#d3a755" stroke-width="1" opacity="0.3"/>
          <circle cx="50" cy="75" r="8" fill="#d3a755" opacity="0.5"/>

          <!-- Shine -->
          <ellipse cx="30" cy="40" rx="15" ry="20" fill="white" opacity="0.15"/>
        </svg>
      `

    case 'win-burst':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="particle-effect win-burst">
          <defs>
            <style>
              @keyframes burst-expand { 0% { r: 10px; opacity: 1; } 100% { r: 150px; opacity: 0; } }
              @keyframes particle-fly { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)); opacity: 0; } }
              .burst-ring { animation: burst-expand 1.5s ease-out; }
              .burst-particle { animation: particle-fly 1.5s ease-out; }
            </style>
          </defs>

          <!-- Expanding rings -->
          <circle cx="100" cy="100" r="10" fill="none" stroke="#d6aa58" stroke-width="2" opacity="0.8" class="burst-ring"/>
          <circle cx="100" cy="100" r="10" fill="none" stroke="#e6b55a" stroke-width="1.5" opacity="0.6" class="burst-ring" style="animation-delay: 0.2s"/>
          <circle cx="100" cy="100" r="10" fill="none" stroke="#c2a04a" stroke-width="1" opacity="0.4" class="burst-ring" style="animation-delay: 0.4s"/>

          <!-- Star particles -->
          <g class="burst-particle" style="--tx: -80px; --ty: -80px">
            <polygon points="100,95 102,105 112,105 104,110 106,120 100,115 94,120 96,110 88,105 98,105" fill="#d6aa58"/>
          </g>
          <g class="burst-particle" style="--tx: 80px; --ty: -80px">
            <polygon points="100,95 102,105 112,105 104,110 106,120 100,115 94,120 96,110 88,105 98,105" fill="#d6aa58"/>
          </g>
          <g class="burst-particle" style="--tx: -80px; --ty: 80px">
            <polygon points="100,95 102,105 112,105 104,110 106,120 100,115 94,120 96,110 88,105 98,105" fill="#d6aa58"/>
          </g>
          <g class="burst-particle" style="--tx: 80px; --ty: 80px">
            <polygon points="100,95 102,105 112,105 104,110 106,120 100,115 94,120 96,110 88,105 98,105" fill="#d6aa58"/>
          </g>

          <!-- Center burst -->
          <circle cx="100" cy="100" r="30" fill="#d6aa58" opacity="0.3" class="burst-ring" style="animation-delay: 0s"/>
        </svg>
      `
  }
}

export function createTransitionEffectSVG(type: 'fade' | 'slide' | 'wipe' | 'iris'): string {
  switch (type) {
    case 'fade':
      return `
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="transition-effect fade">
          <defs>
            <style>
              @keyframes fade-transition { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
              .fade-overlay { animation: fade-transition 1.2s ease-in-out; }
            </style>
          </defs>
          <rect width="400" height="300" fill="#000" class="fade-overlay"/>
        </svg>
      `

    case 'slide':
      return `
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="transition-effect slide">
          <defs>
            <style>
              @keyframes slide-transition { 0% { transform: translateX(-400px); } 50% { transform: translateX(0); } 100% { transform: translateX(400px); } }
              .slide-bar { animation: slide-transition 1.2s ease-in-out; }
            </style>
          </defs>
          <rect width="400" height="300" fill="#d6aa58" class="slide-bar" opacity="0.6"/>
        </svg>
      `

    case 'wipe':
      return `
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="transition-effect wipe">
          <defs>
            <style>
              @keyframes wipe-transition { 0% { clip-path: inset(0 100% 0 0); } 50% { clip-path: inset(0 0 0 0); } 100% { clip-path: inset(0 0 0 100%); } }
              .wipe-rect { animation: wipe-transition 1.2s ease-in-out; }
            </style>
          </defs>
          <rect width="400" height="300" fill="#1d5049" class="wipe-rect"/>
        </svg>
      `

    case 'iris':
      return `
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="transition-effect iris">
          <defs>
            <style>
              @keyframes iris-transition { 0% { r: 0%; } 50% { r: 100%; } 100% { r: 0%; } }
              .iris-circle { animation: iris-transition 1.2s ease-in-out; }
            </style>
          </defs>
          <circle cx="200" cy="150" r="0" fill="#1d5049" class="iris-circle"/>
        </svg>
      `
  }
}

export function createStreakEffectSVG(count: number = 5): string {
  let streaks = ''
  for (let i = 0; i < count; i++) {
    const x = (i / count) * 400
    const delay = (i * 0.1).toFixed(1)
    streaks += `
      <line x1="${x}" y1="-50" x2="${x}" y2="350" stroke="#d6aa58" stroke-width="3" opacity="0.4" style="animation: streak-fall 1s ease-in ${delay}s forwards"/>
    `
  }

  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="particle-effect streak">
      <defs>
        <style>
          @keyframes streak-fall { 0% { transform: translateY(-50px); opacity: 0.8; } 100% { transform: translateY(350px); opacity: 0; } }
        </style>
      </defs>
      ${streaks}
    </svg>
  `
}
