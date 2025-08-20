// main.js – bootstrap game / wire UI / loop
import * as Engine   from './engine.js';
import * as Entities from './entities.js';
import { collectibles } from './entities.js';
import * as Editor   from './editor.js';
import { setupInput, mouse } from './input.js';
import { tiles } from './entities.js';
import { renderEnemies } from './renderer.js';

// Setup input
const canvas = document.getElementById('game');
setupInput(canvas);

// === Hook up all UI buttons ===
document.getElementById('reset').onclick     = Entities.reset;
document.getElementById('musicBtn').onclick  = Engine.toggleMusic;
document.getElementById('prevLevel').onclick = Entities.prevLevel;
document.getElementById('nextLevel').onclick = Entities.nextLevel;

// Keyboard shortcuts (same as single-file)
window.addEventListener('keydown', e=>{
  const k = e.key.toLowerCase();
  Engine.ensureBgm();
  if(k==='[') Entities.prevLevel();
  if(k===']') Entities.nextLevel();
  if(k==='n') Entities.addBlankLevel();
  if(k==='p') Entities.duplicateLevel();
  if(k==='x') Entities.doExport();
});

// Initialize default brush & load level 0
Editor.setBrush('#');
Entities.loadLevel(0);
// ensure collectibles reset and platforms patrol range is set each load
if (Entities.collectibles) Entities.collectibles.length = 0;
for (const m of Entities.movers) {
  if (m.type === 'P') {
    m.min = m.x - (5 * 48);
    m.max = m.x + (5 * 48);
  }
}
// reset collectibles and patrol params on level start
if (Entities.collectibles) Entities.collectibles.length = 0;
if (Entities.movers) {
  for (const m of Entities.movers) {
    if (m.type === 'P') {
      m.min = m.x - (5 * 48);
      m.max = m.x + (5 * 48);
    }
  }
}

// === MAIN loop ===
const _raf = window.requestAnimationFrame || (fn=>setTimeout(fn,16));
function loop(){
  // If in edit mode, allow painting & erasing when mouse is held
  if(Editor.editMode){
    if(mouse.left || mouse.right){
      Entities.paintAtCursor(mouse.right); // right = erase (.)
      if (Editor.currentBrush === 'E') {
        const gx = Math.floor(mouse.x/48)*48, gy = Math.floor(mouse.y/48)*48;
        tiles[gy/48][gx/48] = '.';
        if (!Entities.enemies.some(e=>e.x===gx && e.y===gy)) {
          Entities.enemies.push({ x: gx, y: gy, w:48, h:48, vy:0, dir:1, vx:0.8 });
        }
      }
    }
  }
  Engine.update();
  Entities.updateEnemies(tiles);
  Entities.checkPlayerEnemyCollision();
  Engine.draw();
  renderEnemies(canvas.getContext('2d'), Engine.camera);
  _raf(loop);
}
loop();

// Retina crispness
function fitCanvas(){
  const dpr = Math.max(1, Math.min(2, Math.round(window.devicePixelRatio||1)));
  const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
  const w = Math.floor(cssW*dpr), h = Math.floor(cssH*dpr);
  if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; }
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// Sync music button text
Engine.updateMusicLabel();