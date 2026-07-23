// SVG Vector Asset Library for Six Flags Playable Ad HUD & UI

export const SVGS = {
  SIX_FLAGS_LOGO: `
    <svg viewBox="0 0 320 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E50914"/>
          <stop offset="100%" stop-color="#B20710"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#FFA500"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Background Banner Badge -->
      <path d="M 10 10 Q 160 -5 310 10 L 295 70 Q 160 85 25 70 Z" fill="url(#flagGrad)" stroke="#FFD700" stroke-width="3" filter="url(#glow)"/>
      <!-- Flag Pole Graphic -->
      <path d="M 25 12 L 25 68 M 20 12 L 30 12 M 20 68 L 30 68" stroke="#FFD700" stroke-width="3"/>
      <!-- Six Flags Star Cluster -->
      <g transform="translate(42, 22) scale(0.7)">
        <polygon points="12,0 15,9 24,9 17,14 19,23 12,18 5,23 7,14 0,9 9,9" fill="url(#goldGrad)"/>
      </g>
      <!-- Text Branding -->
      <text x="160" y="42" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" font-weight="900" letter-spacing="2" stroke="#000000" stroke-width="1.5">
        SIX FLAGS
      </text>
      <text x="160" y="60" font-family="'Arial', sans-serif" font-size="10" fill="#FFD700" text-anchor="middle" font-weight="bold" letter-spacing="3">
        THRILL PARK TYCOON
      </text>
    </svg>
  `,

  LIGHTNING_BOLT: `
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF200"/>
          <stop offset="100%" stop-color="#FF9900"/>
        </linearGradient>
        <filter id="boltGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="18" fill="#111827" stroke="#FFD700" stroke-width="2">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <polygon points="22,4 10,22 19,22 17,36 30,18 21,18" fill="url(#boltGrad)" filter="url(#boltGlow)">
        <animate attributeName="transform" type="scale" values="1;1.08;1" transform-origin="20 20" dur="0.8s" repeatCount="indefinite"/>
      </polygon>
    </svg>
  `,

  COIN: `
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF275"/>
          <stop offset="50%" stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#D4AF37"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#coinGrad)" stroke="#B8860B" stroke-width="2"/>
      <circle cx="20" cy="20" r="14" fill="none" stroke="#FFF8DC" stroke-width="1.5" stroke-dasharray="3,1"/>
      <text x="20" y="27" font-family="'Arial Black', sans-serif" font-size="20" fill="#8B6508" text-anchor="middle" font-weight="900">$</text>
    </svg>
  `,

  JOY_STAR: `
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00FFFF"/>
          <stop offset="100%" stop-color="#0080FF"/>
        </linearGradient>
      </defs>
      <polygon points="20,2 25,14 38,14 27,22 31,35 20,27 9,35 13,22 2,14 15,14" fill="url(#starGrad)" stroke="#FFFFFF" stroke-width="2"/>
    </svg>
  `,

  COASTER_ICON: `
    <svg viewBox="0 0 50 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 5 40 Q 25 10 45 40" fill="none" stroke="#E50914" stroke-width="4" stroke-linecap="round"/>
      <path d="M 12 40 L 12 45 M 25 25 L 25 45 M 38 40 L 38 45" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="20" y="15" width="12" height="10" rx="3" fill="#FFD700" stroke="#000" stroke-width="1.5"/>
      <circle cx="23" cy="25" r="2.5" fill="#000"/>
      <circle cx="29" cy="25" r="2.5" fill="#000"/>
    </svg>
  `,

  FUNNEL_CAKE_ICON: `
    <svg viewBox="0 0 50 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="35" rx="20" ry="8" fill="#E6C280" stroke="#8B4513" stroke-width="2"/>
      <path d="M 10 32 C 15 20, 35 20, 40 32 M 15 28 C 20 18, 30 18, 35 28" fill="none" stroke="#D2B48C" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="25" r="1.5" fill="#FFF"/>
      <circle cx="20" cy="22" r="1.5" fill="#FFF"/>
      <circle cx="30" cy="24" r="1.5" fill="#FFF"/>
      <path d="M 22 20 Q 25 15 28 20" stroke="#FF4500" stroke-width="2" fill="none"/>
    </svg>
  `,

  SPEED_UP_ICON: `
    <svg viewBox="0 0 50 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <polygon points="28,2 12,28 24,28 22,48 38,22 26,22" fill="#FFD700" stroke="#FF4500" stroke-width="2"/>
    </svg>
  `,

  TAP_POINTER: `
    <svg viewBox="0 0 60 70" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="handShadow">
        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.4"/>
      </filter>
      <!-- Ripple effect ring -->
      <circle cx="20" cy="12" r="10" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.8">
        <animate attributeName="r" values="5;18;22" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.5;0" dur="1s" repeatCount="indefinite"/>
      </circle>
      <!-- Hand Gesture -->
      <path d="M 20 12 L 20 32 L 15 32 C 12 32 10 34 10 37 L 10 48 C 10 58 18 65 28 65 L 35 65 C 43 65 48 58 48 50 L 48 35 C 48 32 46 30 43 30 L 40 30 L 40 28 C 40 25 38 23 35 23 L 32 23 L 32 20 C 32 17 30 15 27 15 L 25 15 L 25 12 C 25 9 22 7 20 12 Z" fill="#FFFFFF" stroke="#000000" stroke-width="3" stroke-linejoin="round" filter="url(#handShadow)"/>
    </svg>
  `,

  TROPHY: `
    <svg viewBox="0 0 60 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 15 10 L 45 10 L 40 32 C 38 40 32 44 25 44 C 18 44 12 40 10 32 Z" fill="#FFD700" stroke="#B8860B" stroke-width="2"/>
      <path d="M 15 15 C 5 15 5 28 12 30" fill="none" stroke="#FFD700" stroke-width="4"/>
      <path d="M 45 15 C 55 15 55 28 48 30" fill="none" stroke="#FFD700" stroke-width="4"/>
      <rect x="21" y="44" width="8" height="8" fill="#DAA520"/>
      <rect x="15" y="52" width="20" height="6" rx="2" fill="#8B4513"/>
    </svg>
  `,

  TICKET: `
    <svg viewBox="0 0 50 35" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 0 L 50 0 L 50 12 A 5 5 0 0 0 50 22 L 50 35 L 0 35 L 0 22 A 5 5 0 0 0 0 12 Z" fill="#E50914" stroke="#FFF" stroke-width="2"/>
      <line x1="15" y1="0" x2="15" y2="35" stroke="#FFF" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="32" y="22" font-family="'Impact', sans-serif" font-size="12" fill="#FFF" text-anchor="middle">ADMIT</text>
    </svg>
  `
};
