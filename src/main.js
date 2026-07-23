// Main Entry Point for Six Flags Playable Ad
import './style.css';
import { Park3D } from './park3d.js';
import { Game } from './game.js';

function init() {
  try {
    const container = document.getElementById('canvas-container');
    if (!container) {
      console.error('Canvas container element #canvas-container not found');
      return;
    }

    let game = null;

    // Initialize 3D Park Scene with Cashflow Callback
    const park3d = new Park3D(container, (amount) => {
      if (game) game.addCash(amount);
    });

    // Initialize Game UI and Mechanics Loop
    game = new Game(park3d);

    // Render Loop
    function animate() {
      requestAnimationFrame(animate);
      try {
        park3d.update();
      } catch (err) {
        console.error('Error during 3D frame update:', err);
      }
    }
    animate();
  } catch (e) {
    console.error('Error initializing Six Flags game:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
