// Google Playable Ad Compliant Victory End Card & Exit Handler
import { SVGS } from './svgs.js';
import { sound } from './sound.js';

export class EndCard {
  constructor() {
    this.targetUrl = 'https://www.sixflags.com';
    this.overlay = null;
  }

  show() {
    sound.playFanfare();

    if (this.overlay) {
      this.overlay.classList.remove('hidden');
      return;
    }

    const app = document.getElementById('app');

    this.overlay = document.createElement('div');
    this.overlay.id = 'end-card-overlay';
    this.overlay.className = 'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-between p-6 text-white animate-fade-in select-none';

    this.overlay.innerHTML = `
      <!-- Confetti Particles Overlay -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-10 left-10 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        <div class="absolute top-20 right-12 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
        <div class="absolute bottom-32 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
      </div>

      <!-- Victory Header -->
      <div class="flex flex-col items-center text-center gap-3 mt-4 w-full max-w-sm">
        <div class="w-20 h-20 drop-shadow-2xl animate-bounce">
          ${SVGS.TROPHY}
        </div>

        <span class="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl border border-white">
          PARK RATING: 5/5 STARS
        </span>

        <h1 class="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-red-500 to-yellow-300 drop-shadow-md">
          PARK MANAGER OF THE YEAR!
        </h1>
        <p class="text-xs text-slate-300 font-medium px-2 leading-relaxed">
          You built the ultimate thrill destination! Now come test your courage on our real world-record-breaking hypercoasters!
        </p>
      </div>

      <!-- Main Six Flags Branding Card -->
      <div class="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-5 flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden">
        
        <div class="w-full h-18 drop-shadow-md">
          ${SVGS.SIX_FLAGS_LOGO}
        </div>

        <!-- Coaster Highlights -->
        <div class="w-full grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-2 flex flex-col items-center">
            <span class="text-amber-400 text-base">🎢 80+ MPH</span>
            <span class="text-slate-300">HYPERCOASTERS</span>
          </div>
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-2 flex flex-col items-center">
            <span class="text-amber-400 text-base">🍰 TREATS</span>
            <span class="text-slate-300">FUNNEL CAKES</span>
          </div>
        </div>

        <!-- PRIMARY GOOGLE AD EXIT CTA BUTTON -->
        <button id="cta-btn" class="w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black py-4 px-6 rounded-2xl text-lg tracking-wider uppercase shadow-2xl border-2 border-yellow-300 active:scale-95 transition-all duration-200 animate-pulse flex items-center justify-center gap-2 cursor-pointer">
          <span>VISIT SIX FLAGS SOON</span>
          <span class="text-xl">➔</span>
        </button>

        <!-- Secondary Play Again Option -->
        <button id="replay-btn" class="text-xs text-slate-400 font-bold underline hover:text-white transition-colors cursor-pointer py-1">
          ↺ Play Mini-Game Again
        </button>

      </div>

      <!-- Google Playable Ad Compliance Footer -->
      <div class="text-[10px] text-slate-400 font-bold tracking-wider uppercase text-center pb-2">
        SIX FLAGS © 2026 • ALL RIGHTS RESERVED
      </div>
    `;

    app.appendChild(this.overlay);

    document.getElementById('cta-btn').addEventListener('click', () => this.handleExit());
    document.getElementById('replay-btn').addEventListener('click', () => this.handleReplay());
  }

  handleExit() {
    sound.playClick();

    // 1. Google ExitApi standard
    if (window.ExitApi && typeof window.ExitApi.exit === 'function') {
      try {
        window.ExitApi.exit();
        return;
      } catch (e) {
        console.warn('ExitApi error:', e);
      }
    }

    // 2. MRAID standard
    if (window.mraid && typeof window.mraid.open === 'function') {
      try {
        window.mraid.open(this.targetUrl);
        return;
      } catch (e) {
        console.warn('MRAID error:', e);
      }
    }

    // 3. Fallback direct window open
    window.open(this.targetUrl, '_blank');
  }

  handleReplay() {
    sound.playClick();
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
    window.location.reload();
  }
}
