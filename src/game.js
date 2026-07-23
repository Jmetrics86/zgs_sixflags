// Main Game State Manager & Dynamic Command Dock System for Cedar Point
import { SVGS } from './svgs.js';
import { sound } from './sound.js';
import { EndCard } from './endcard.js';

export class Game {
  constructor(park3d) {
    this.park3d = park3d;
    this.cash = 150;
    this.thrill = 10;
    this.guests = 100;
    this.currentStepIndex = 0;
    this.endCard = new EndCard();

    // 12 BUILDABLE CEDAR POINT LOCATIONS (Sequence Pool)
    this.BUILD_STEPS = [
      { id: 'rentals', name: 'RENTALS & LOCKERS', category: 'FRONT GATE', cost: 100, icon: SVGS.TICKET, thrill: 8, guests: 200 },
      { id: 'hugos', name: 'HUGOS ITALIAN KITCHEN', category: 'MAIN MIDWAY', cost: 250, icon: SVGS.FUNNEL_CAKE_ICON, thrill: 8, guests: 300 },
      { id: 'coasters_diner', name: 'COASTERS 1950S DINER', category: 'MAIN MIDWAY', cost: 400, icon: SVGS.FUNNEL_CAKE_ICON, thrill: 8, guests: 400 },
      { id: 'french_quarter', name: 'FRENCH QUARTER & CORRAL', category: 'MAIN MIDWAY', cost: 600, icon: SVGS.FUNNEL_CAKE_ICON, thrill: 8, guests: 500 },
      { id: 'coaster_stage2', name: 'THRILL LOOP COASTER', category: 'COASTER PLAZA', cost: 800, icon: SVGS.COASTER_ICON, thrill: 12, guests: 700, isCoasterStage2: true },
      { id: 'happy_friar', name: 'HAPPY FRIAR HOT FRIES', category: 'GEMINI MIDWAY', cost: 1000, icon: SVGS.FUNNEL_CAKE_ICON, thrill: 8, guests: 800 },
      { id: 'grand_pavilion', name: 'GRAND PAVILION & BAR', category: 'BOARDWALK', cost: 1500, icon: SVGS.TROPHY, thrill: 10, guests: 1000 },
      { id: 'backbeat', name: 'BACKBEATQUE BBQ', category: 'FRONTIER TRAIL', cost: 2000, icon: SVGS.FUNNEL_CAKE_ICON, thrill: 10, guests: 1200 },
      { id: 'bay_harbor', name: 'BAY HARBOR MARINA SEAFOOD', category: 'CEDAR POINT MARINA', cost: 3000, icon: SVGS.TROPHY, thrill: 10, guests: 1500 },
      { id: 'millennium_force', name: 'MILLENNIUM FORCE HYPER', category: 'COASTER PEAK', cost: 4500, icon: SVGS.SPEED_UP_ICON, thrill: 18, guests: 2000, isCoasterStage3: true },
      { id: 'hotel_breakers', name: 'HOTEL BREAKERS RESORT', category: 'BEACHFRONT', cost: 6000, icon: SVGS.TROPHY, thrill: 12, guests: 2500 },
      { id: 'castaway_bay', name: 'CASTAWAY BAY WATERPARK', category: 'GRAND FINALE', cost: 10000, icon: SVGS.TROPHY, thrill: 15, guests: 3000, isFinale: true }
    ];

    this.createUI();
    this.updateHUD();
  }

  updateHUD() {
    const cashEl = document.getElementById('cash-text');
    if (cashEl) cashEl.textContent = `${this.cash.toLocaleString()} ⚡`;

    const guestEl = document.getElementById('guest-text');
    if (guestEl) guestEl.textContent = `${this.guests.toLocaleString()}`;

    const thrillPercentEl = document.getElementById('thrill-percent');
    if (thrillPercentEl) thrillPercentEl.textContent = `${this.thrill}%`;

    const thrillBarEl = document.getElementById('thrill-bar');
    if (thrillBarEl) thrillBarEl.style.width = `${this.thrill}%`;
  }

  createUI() {
    const app = document.getElementById('app');

    const overlay = document.createElement('div');
    overlay.id = 'game-overlay';
    overlay.className = 'absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none overflow-hidden';

    overlay.innerHTML = `
      <!-- TOP HUD BANNER -->
      <div id="top-hud" class="pointer-events-auto flex flex-col items-center gap-2 w-full max-w-md mx-auto">
        <!-- Six Flags / Cedar Point Header Logo -->
        <div class="w-64 h-16 drop-shadow-lg transform hover:scale-105 transition-transform">
          ${SVGS.SIX_FLAGS_LOGO}
        </div>

        <!-- Stat Counters Row -->
        <div class="flex justify-between items-center w-full bg-slate-900/85 backdrop-blur-md border border-amber-400/50 rounded-2xl p-2.5 shadow-2xl text-white">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 drop-shadow">${SVGS.LIGHTNING_BOLT}</div>
            <div class="flex flex-col">
              <span class="text-[10px] text-amber-300 font-bold tracking-wider uppercase">THRILL ENERGY</span>
              <span id="cash-text" class="text-xl font-black text-amber-400 tracking-wide">150 ⚡</span>
            </div>
          </div>

          <div class="w-px h-8 bg-slate-700"></div>

          <div class="flex items-center gap-2">
            <div class="w-8 h-8 drop-shadow">${SVGS.TICKET}</div>
            <div class="flex flex-col">
              <span class="text-[10px] text-sky-300 font-bold tracking-wider uppercase">HAPPY GUESTS</span>
              <span id="guest-text" class="text-xl font-black text-sky-400 tracking-wide">100</span>
            </div>
          </div>

          <button id="mute-btn" class="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full border border-slate-600 text-white font-bold active:scale-95 transition-transform">
            🔊
          </button>
        </div>

        <!-- Thrill Rating Bar -->
        <div class="w-full bg-slate-900/85 backdrop-blur-md border border-slate-700 rounded-xl p-2 shadow-xl flex flex-col gap-1">
          <div class="flex justify-between items-center text-xs font-bold px-1">
            <span class="flex items-center gap-1 text-amber-400">
              <span class="w-4 h-4">${SVGS.JOY_STAR}</span>
              CEDAR POINT THRILL RATING
            </span>
            <span id="thrill-percent" class="text-amber-300 font-black">10%</span>
          </div>
          <div class="w-full h-4 bg-slate-800 rounded-full p-0.5 overflow-hidden border border-slate-700 shadow-inner">
            <div id="thrill-bar" class="h-full bg-gradient-to-r from-amber-500 via-red-500 to-yellow-400 rounded-full transition-all duration-500 shadow-md" style="width: 10%"></div>
          </div>
        </div>

        <!-- Banner Prompt -->
        <div id="banner-prompt" class="w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white text-center font-black py-2 px-3 rounded-xl shadow-2xl border border-amber-300 animate-pulse text-xs tracking-wide uppercase">
          👔 GUIDE PARK MANAGER TO BUILD FRONT GATE RENTALS & LOCKERS!
        </div>
      </div>

      <!-- DYNAMIC COMMAND DOCK -->
      <div id="bottom-dock" class="pointer-events-auto w-full max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border-t-2 border-amber-400/80 rounded-3xl p-3 shadow-2xl flex flex-col gap-2.5">
        <div class="flex justify-between items-center text-[11px] font-bold text-amber-300 uppercase tracking-widest px-1">
          <span>👔 PARK MANAGER COMMAND DOCK</span>
          <span id="progress-step-text" class="text-xs font-black text-amber-400">1 / 12</span>
        </div>

        <!-- Dynamic Cards Grid (Cards disappear & get replaced upon purchase!) -->
        <div id="cards-grid" class="grid grid-cols-2 gap-2">
          
          <!-- Card 1: Active Target -->
          <button id="btn-card-1" class="relative bg-gradient-to-b from-red-600 to-red-800 border-2 border-amber-400 rounded-2xl p-2.5 text-white flex items-center justify-between shadow-lg active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer">
            <div class="flex items-center gap-2">
              <div id="card-1-icon" class="w-9 h-9 p-1 bg-black/20 rounded-xl">${SVGS.TICKET}</div>
              <div class="flex flex-col text-left">
                <span id="card-1-title" class="text-[11px] font-black leading-tight">RENTALS & LOCKERS</span>
                <span id="card-1-subtitle" class="text-[9px] text-amber-300 font-bold">FRONT GATE</span>
              </div>
            </div>
            <div id="card-1-btn" class="bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded-lg animate-bounce">
              $100
            </div>
          </button>

          <!-- Card 2: Upcoming Target -->
          <button id="btn-card-2" class="relative bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 opacity-60 rounded-2xl p-2.5 text-white flex items-center justify-between shadow-lg transition-all duration-300 overflow-hidden" disabled>
            <div class="flex items-center gap-2">
              <div id="card-2-icon" class="w-9 h-9 p-1 bg-black/20 rounded-xl">${SVGS.FUNNEL_CAKE_ICON}</div>
              <div class="flex flex-col text-left">
                <span id="card-2-title" class="text-[11px] font-black leading-tight">HUGOS KITCHEN</span>
                <span id="card-2-subtitle" class="text-[9px] text-slate-400 font-bold">NEXT UP</span>
              </div>
            </div>
            <div id="card-2-btn" class="text-[10px] font-black text-amber-400">$250</div>
          </button>

        </div>
      </div>

      <!-- ANIMATED TUTORIAL POINTER HAND -->
      <div id="pointer-hand" class="pointer-events-none absolute w-14 h-16 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-50">
        ${SVGS.TAP_POINTER}
      </div>
    `;

    app.appendChild(overlay);

    document.getElementById('btn-card-1').addEventListener('click', () => this.onTapActiveCard());

    const muteBtn = document.getElementById('mute-btn');
    muteBtn.addEventListener('click', () => {
      sound.isMuted = !sound.isMuted;
      muteBtn.textContent = sound.isMuted ? '🔇' : '🔊';
    });

    this.renderCommandDock();
  }

  renderCommandDock() {
    const current = this.BUILD_STEPS[this.currentStepIndex];
    const next = this.BUILD_STEPS[this.currentStepIndex + 1];

    if (!current) return;

    // Update 3D Camera Zoom-Out Progress Ratio
    this.park3d.setBuildProgress(this.currentStepIndex, this.BUILD_STEPS.length);

    // Update Progress Step Counter
    document.getElementById('progress-step-text').textContent = `${this.currentStepIndex + 1} / ${this.BUILD_STEPS.length}`;

    // Render Card 1 (Active)
    document.getElementById('card-1-title').textContent = current.name;
    document.getElementById('card-1-subtitle').textContent = current.category;
    document.getElementById('card-1-icon').innerHTML = current.icon;
    document.getElementById('card-1-btn').textContent = `${current.cost.toLocaleString()} ⚡`;

    // Prompt Banner
    document.getElementById('banner-prompt').textContent = `👔 GUIDE MANAGER TO BUILD ${current.name}!`;

    // Render Card 2 (Upcoming)
    if (next) {
      document.getElementById('card-2-title').textContent = next.name;
      document.getElementById('card-2-subtitle').textContent = 'NEXT UP';
      document.getElementById('card-2-icon').innerHTML = next.icon;
      document.getElementById('card-2-btn').textContent = `${next.cost.toLocaleString()} ⚡`;
    } else {
      document.getElementById('card-2-title').textContent = 'CEDAR POINT COMPLETE';
      document.getElementById('card-2-subtitle').textContent = '100% BUILT';
      document.getElementById('card-2-btn').textContent = '🏆';
    }

    this.movePointerTo('btn-card-1');
  }

  onTapActiveCard() {
    const current = this.BUILD_STEPS[this.currentStepIndex];
    if (!current) return;

    // Check energy balance
    if (this.cash < current.cost) {
      this.spawnFloatingText(`NEED ${current.cost.toLocaleString()} ⚡!`, 'text-yellow-400');
      return;
    }

    // Deduct Cost
    this.cash -= current.cost;
    this.addThrill(current.thrill);
    this.addGuests(current.guests);

    sound.resume();
    sound.playBuild();
    sound.playCoin();
    sound.startBgm();

    // Guide Park Manager Avatar to build
    if (current.isCoasterStage2) {
      this.park3d.buildCoasterStage(2);
      sound.playCoasterRoar();
    } else if (current.isCoasterStage3) {
      this.park3d.buildCoasterStage(3);
      sound.playCoasterRoar();
    }

    this.park3d.guideManagerToBuild(current.id, current.id);
    this.park3d.spawnPeeps(8);

    // Slide-out Animation & REPLACE Card in Menu!
    const btn1 = document.getElementById('btn-card-1');
    btn1.classList.add('scale-90', 'opacity-50');

    setTimeout(() => {
      btn1.classList.remove('scale-90', 'opacity-50');

      // Move to NEXT build step in queue!
      this.currentStepIndex++;

      if (this.currentStepIndex >= this.BUILD_STEPS.length) {
        // Complete Park Grand Finale!
        this.hidePointer();
        document.getElementById('banner-prompt').textContent = '🏆 CEDAR POINT RESORT FULLY UNLOCKED!';
        document.getElementById('banner-prompt').className = 'w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-black text-center font-black py-2 px-3 rounded-xl shadow-2xl border border-white animate-bounce text-xs tracking-wide uppercase';
        
        setTimeout(() => this.triggerEndCard(), 2000);
      } else {
        this.renderCommandDock();
      }
    }, 250);
  }

  movePointerTo(elementId) {
    const el = document.getElementById(elementId);
    const pointer = document.getElementById('pointer-hand');
    if (!el || !pointer) return;

    const rect = el.getBoundingClientRect();
    pointer.style.left = `${rect.left + rect.width / 2}px`;
    pointer.style.top = `${rect.top + rect.height / 2 + 10}px`;
    pointer.style.display = 'block';
  }

  hidePointer() {
    const pointer = document.getElementById('pointer-hand');
    if (pointer) pointer.style.display = 'none';
  }

  addCash(amount) {
    this.cash += amount;
    this.updateHUD();
  }

  addGuests(amount) {
    this.guests += amount;
    this.updateHUD();
  }

  addThrill(amount) {
    this.thrill = Math.min(100, this.thrill + amount);
    this.updateHUD();
  }

  spawnFloatingText(text, textColorClass) {
    const container = document.getElementById('top-hud');
    if (!container) return;

    const pop = document.createElement('div');
    pop.className = `absolute text-2xl font-black drop-shadow-lg ${textColorClass} pointer-events-none transition-all duration-700 transform -translate-y-4 opacity-100 z-50`;
    pop.textContent = text;
    pop.style.top = '40%';
    pop.style.left = '50%';
    pop.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(pop);

    setTimeout(() => {
      pop.style.transform = 'translate(-50%, -120%) scale(1.2)';
      pop.style.opacity = '0';
    }, 50);

    setTimeout(() => pop.remove(), 750);
  }

  triggerEndCard() {
    this.endCard.show();
  }
}
