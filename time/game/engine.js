// engine.js - modular + enemy platform logic + safari-safe
import { editMode } from './editor.js';
import { keys, mouse } from './input.js';
import {
  W, H, levelRows, tiles, player, enemies, movers,
  goal, loadLevel, teleportToSpawn, LEVELS, levelIndex, collectibles
} from './entities.js';

// Constants
export const TILE = 48;
export const GRAVITY = 0.9;
export const MOVE_ACCEL = 0.7;
export const MAX_SPEED_X = 6.2;
export const JUMP_VELOCITY = -16;
export const FRICTION_GROUND = 0.8;
export const BOUNCE_VELOCITY = -22;

// Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Music
let bgm = null, audioStarted = false;
try { bgm = new Audio('./piano.mp3'); bgm.loop = true; bgm.volume = 0.5; } catch {}
export function ensureBgm() { if (bgm && !audioStarted) { bgm.play().then(() => { audioStarted = true; updateMusicLabel(); }); } }
export function toggleMusic() { if (!bgm) return; if (!audioStarted) { ensureBgm(); } else { bgm.muted = !bgm.muted; updateMusicLabel(); } }
export function updateMusicLabel() { const btn = document.getElementById('musicBtn'); if (btn) btn.textContent = 'Music: ' + ((bgm && audioStarted && !bgm.muted) ? 'On' : 'Off'); }

// Camera
export const camera = { x: 0, y: 0 };

// State
export let deathTimer = 0, jumping = false, treasureCount = 0, winTimer = 0, levelAdvanced = false;
export let gameWon = false;

// Helpers
function inBounds(tx, ty) { return tx >= 0 && ty >= 0 && tx < W && ty < H; }
function rectTiles(rx, ry, rw, rh) {
  const x0 = Math.floor(rx / TILE), x1 = Math.floor((rx + rw) / TILE);
  const y0 = Math.floor(ry / TILE), y1 = Math.floor((ry + rh) / TILE);
  return { x0, x1, y0, y1 };
}
function collideSolid(x, y, w, h) {
  const { x0, x1, y0, y1 } = rectTiles(x, y, w, h);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (inBounds(tx, ty) && tiles[ty][tx] === '#') return true;
    }
  }
  return false;
}
function collideSemisolid(x, y, w, h, vy) {
  const y1 = Math.floor((y + h) / TILE), x0 = Math.floor(x / TILE), x1 = Math.floor((x + w) / TILE);
  for (let tx = x0; tx <= x1; tx++) {
    const t = inBounds(tx, y1) ? tiles[y1][tx] : null;
    if (t === '-' && vy >= 0) {
      const top = y1 * TILE;
      if (y + h <= top + 12) return { hit: true, y: top - h };
    }
  }
  return { hit: false };
}
function collideTrampoline(x, y, w, h, vy) {
  const y1 = Math.floor((y + h) / TILE), x0 = Math.floor(x / TILE), x1 = Math.floor((x + w) / TILE);
  for (let tx = x0; tx <= x1; tx++) {
    const t = inBounds(tx, y1) ? tiles[y1][tx] : null;
    if (t === 'T' && vy >= 0) {
      const top = y1 * TILE;
      if (y + h <= top + 12) return { hit: true, y: top - h };
    }
  }
  return { hit: false };
}
function touchingDeath(x, y, w, h) {
  const { x0, x1, y0, y1 } = rectTiles(x, y, w, h);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (inBounds(tx, ty) && tiles[ty][tx] === 'd') return true;
  }
  return false;
}
function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Enemy helpers
function groundBelow(e) {
  const footY = Math.floor((e.y + TILE) / TILE), col = Math.floor(e.x / TILE);
  return inBounds(col, footY) && tiles[footY][col] === '#';
}
function pitAhead(e) {
  const dir = e.dir, frontX = Math.floor((e.x + dir * TILE) / TILE), frontY = Math.floor((e.y + TILE) / TILE);
  return !(inBounds(frontX, frontY) && tiles[frontY][frontX] === '#');
}
function spikeAhead(e) {
  const dir = e.dir, frontCol = Math.floor((e.x + dir * TILE) / TILE), row = Math.floor(e.y / TILE);
  return inBounds(frontCol, row) && tiles[row][frontCol] === 'd';
}
function stickToMover(e) {
  for (const m of movers) {
    if (aabb(e.x, e.y, TILE, TILE, m.x, m.y, TILE, TILE)) {
      e.y = m.y - TILE; return;
    }
  }
}

// Update
export function update() {
  if (gameWon) return;
  if (editMode) return;
  if (deathTimer > 0) {
    deathTimer--;
    if (deathTimer === 0) { teleportToSpawn(); ensureBgm(); }
    return;
  }

  // Player
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has(' ') || keys.has('w') || keys.has('arrowup');
  if (left) { player.vx -= MOVE_ACCEL; player.facing = -1; }
  if (right) { player.vx += MOVE_ACCEL; player.facing = 1; }
  if (player.onGround && !(left || right)) player.vx *= FRICTION_GROUND;
  player.vx = Math.max(Math.min(player.vx, MAX_SPEED_X), -MAX_SPEED_X);
  player.vy += GRAVITY;
  if (jump && player.jumpsLeft > 0 && !jumping) {
    player.vy = JUMP_VELOCITY; player.onGround = false; player.jumpsLeft--; jumping = true;
  }
  if (!jump) jumping = false;
  player.x += player.vx;
  if (collideSolid(player.x, player.y, player.w, player.h)) {
    const d = Math.sign(player.vx);
    while (collideSolid(player.x, player.y, player.w, player.h)) player.x -= d;
    player.vx = 0;
  }
  player.y += player.vy; player.onGround = false;
  if (collideSolid(player.x, player.y, player.w, player.h)) {
    const d = Math.sign(player.vy);
    while (collideSolid(player.x, player.y, player.w, player.h)) player.y -= d;
    if (d > 0) player.onGround = true; player.vy = 0;
  }
  if (!player.onGround && player.vy >= 0) {
    const semi = collideSemisolid(player.x, player.y, player.w, player.h, player.vy);
    if (semi.hit) { player.y = semi.y; player.vy = 0; player.onGround = true; }
  }
  if (player.vy >= 0) {
    const tramp = collideTrampoline(player.x, player.y, player.w, player.h, player.vy);
    if (tramp.hit) { player.y = tramp.y; player.vy = BOUNCE_VELOCITY; player.onGround = false; player.jumpsLeft = 2; jumping = true; }
  }
  if (touchingDeath(player.x, player.y, player.w, player.h)) teleportToSpawn();
  if (player.y > H * TILE + TILE * 3) teleportToSpawn();
  // collect G tiles directly from tile map
  collectTreasures(player.x, player.y, player.w, player.h);
  if (player.onGround) player.jumpsLeft = 2;

  // Unstuck enemies every frame so they always appear
  for (const e of enemies) {
    while (
      (collideSolid(e.x, e.y, TILE, TILE) ||
        movers.some(m => aabb(e.x, e.y, TILE, TILE, m.x, m.y, TILE, TILE))) &&
      e.y > 0
    ) {
      e.y -= 2; // pop upward fast
    }
  }

  // collect crosses
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const c = collectibles[i];
    if (aabb(player.x, player.y, player.w, player.h, c.x, c.y, c.w, c.h)) {
      collectibles.splice(i, 1);
      treasureCount++;
    }
  }

  // Movers
  for (const m of movers) {
    const s = 1.2;
    if (m.type === 'H') {
      m.x += m.dir * s;
      if (m.x <= 0) { m.x = 0; m.dir = 1; }
      if (m.x + TILE >= W * TILE) { m.x = W*TILE - TILE; m.dir = -1; }
    }
    if (m.type === 'V') {
      m.y += m.dir * s;
      if (m.y <= 0) { m.y = 0; m.dir = 1; }
      if (m.y + TILE >= H * TILE) { m.y = H*TILE - TILE; m.dir = -1; }
    }
    if (m.type === 'P') {
      if (m.min !== null && m.max !== null) {
        // horizontal platform
        m.x += m.dir * m.speed;
        if (m.x <= m.min) { m.x = m.min; m.dir = 1; }
        if (m.x >= m.max) { m.x = m.max; m.dir = -1; }
      } else {
        // vertical platform
        m.y += m.dir * m.speed;
        if (m.min !== null && m.y <= m.min) { m.y = m.min; m.dir = 1; }
        if (m.max !== null && m.y >= m.max) { m.y = m.max; m.dir = -1; }
      }
    }
    if (aabb(player.x, player.y, player.w, player.h, m.x, m.y, TILE, TILE)) teleportToSpawn();
  }

  // Goal
  if (aabb(player.x, player.y, player.w, player.h, goal.x + 8, goal.y + 8, goal.w - 16, goal.h - 16)) {
    winTimer = Math.min(winTimer + 1, 90);
    if (winTimer >= 60 && !levelAdvanced) {
      levelAdvanced = true;
      if (levelIndex + 1 < LEVELS.length) {
        levelIndex++;
        return;
      } else {
        gameWon = true;
        return;
      }
    }
  } else { winTimer = Math.max(winTimer - 1, 0); levelAdvanced = false; }

  // Camera
  const tx = player.x - canvas.width / 2 + player.w / 2;
  const ty = player.y - canvas.height / 2 + player.h / 2;
  camera.x += (tx - camera.x) * 0.1;
  camera.y += (ty - camera.y) * 0.1;
  camera.x = Math.max(0, Math.min(camera.x, W * TILE - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, H * TILE - canvas.height));
}

// Draw
export function draw() {
  if (gameWon) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONGRATULATIONS', canvas.width/2, canvas.height/2);
    return;
  }
  // If beaten all levels, show congrats screen
  if (levelIndex >= LEVELS.length) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONGRATULATIONS', canvas.width / 2, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b0f1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // background stars
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#7aa0ff';
  for (let i = 0; i < 80; i++) {
    const sx = (i * 173) % (W * TILE) - camera.x * 0.3;
    const sy = (i * 97) % (H * TILE);
    ctx.fillRect(((sx % (W * TILE)) + (W * TILE)) % (W * TILE) - camera.x, ((sy % (H * TILE)) + (H * TILE)) % (H * TILE) - camera.y, 2, 2);
  }
  ctx.restore();

  const startX = Math.floor(camera.x / TILE) - 1,
        endX   = Math.ceil((camera.x + canvas.width) / TILE) + 1;
  const startY = Math.floor(camera.y / TILE) - 1,
        endY   = Math.ceil((camera.y + canvas.height) / TILE) + 1;

  // Draw main tiles
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const t = tiles[y][x], dx = x * TILE - camera.x, dy = y * TILE - camera.y;
      if (t === '#') { ctx.fillStyle = '#2a335f'; ctx.fillRect(dx, dy, TILE, TILE); ctx.fillStyle = '#3b4682'; ctx.fillRect(dx + 4, dy + 4, TILE - 8, TILE - 8); }
      else if (t === '-') { ctx.fillStyle = '#4c7ad8'; ctx.fillRect(dx, dy + TILE - 10, TILE, 6); }
      else if (t === 'T') { ctx.fillStyle = '#16a34a'; ctx.fillRect(dx, dy + TILE - 12, TILE,10); ctx.fillStyle = '#22c55e'; ctx.fillRect(dx+2,dy+TILE-14,TILE-4,6); }
      else if (t === 'F') { ctx.fillStyle = '#f2c14e'; ctx.fillRect(dx+TILE/2-3,dy+8,6,TILE-16); ctx.fillStyle = '#e85d75'; ctx.beginPath(); ctx.moveTo(dx+TILE/2+3,dy+12); ctx.lineTo(dx+TILE/2+23,dy+22); ctx.lineTo(dx+TILE/2+3,dy+32); ctx.closePath(); ctx.fill(); }
      else if (t === 'G') { ctx.save(); ctx.translate(dx,dy); ctx.fillStyle='#facc15'; ctx.fillRect(TILE/2-4,8,8,TILE-16); ctx.fillRect(8,TILE/2-4,TILE-16,8); ctx.globalAlpha=0.6; ctx.fillStyle='#fde68a'; ctx.fillRect(TILE/2-2,10,4,TILE-20); ctx.restore(); }
      else if (t === 'S' || t === 's') { ctx.fillStyle='#38bdf8'; ctx.fillRect(dx+TILE/2-4,dy+8,8,TILE-16); ctx.fillStyle='#7dd3fc'; ctx.fillRect(dx+TILE/2-3,dy+10,6,TILE-20); }
      else if (t === 'd') { ctx.save(); ctx.fillStyle='#ef4444'; for (let j=0;j<4;j++){const sx2=dx+j*(TILE/4);ctx.beginPath();ctx.moveTo(sx2,dy+TILE);ctx.lineTo(sx2+TILE/8,dy+TILE-12);ctx.lineTo(sx2+TILE/4,dy+TILE);ctx.closePath();ctx.fill();} ctx.restore(); }
      else if (t === 'E') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(dx, dy, TILE, TILE);
      }
    }
  }

  // Arrows (edit mode only)
  if (editMode) {
    ctx.font='24px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    for (let y=startY; y<endY; y++) for (let x=startX; x<endX; x++) {
      if (x<0||y<0||x>=W||y>=H) continue;
      const t=tiles[y][x], dx=x*TILE-camera.x, dy=y*TILE-camera.y;
      if (t==='<'||t==='>') { ctx.fillStyle='#facc15'; ctx.fillText(t, dx+TILE/2, dy+TILE/2); }
      if (t==='^'||t==='v') { ctx.fillStyle='#22c55e'; ctx.fillText(t, dx+TILE/2, dy+TILE/2); }
    }
  }

  // Draw movers
  ctx.fillStyle='#2a335f';
  for(const m of movers){
    const dx=m.x-camera.x, dy=m.y-camera.y;
    ctx.fillRect(dx,dy,TILE,TILE);ctx.fillStyle='#3b4682';ctx.fillRect(dx+4,dy+4,TILE-8,TILE-8);ctx.fillStyle='#2a335f';
  }

  // Draw enemies on top
  ctx.fillStyle='#dc2626';
  for(const e of enemies){ ctx.fillRect(e.x-camera.x,e.y-camera.y,TILE,TILE); }

  // Draw grid/cursor
  if(editMode){
    ctx.save();ctx.globalAlpha=0.15;ctx.strokeStyle='#9ab2ff';
    for(let gx=startX;gx<endX;gx++){const lx=gx*TILE-camera.x+0.5;ctx.beginPath();ctx.moveTo(lx,-camera.y);ctx.lineTo(lx,H*TILE-camera.y);ctx.stroke();}
    for(let gy=startY;gy<endY;gy++){const ly=gy*TILE-camera.y+0.5;ctx.beginPath();ctx.moveTo(-camera.x,ly);ctx.lineTo(W*TILE-camera.x,ly);ctx.stroke();}
    const tx=Math.floor((mouse.x+camera.x)/TILE), ty=Math.floor((mouse.y+camera.y)/TILE);
    if(inBounds(tx,ty)){ctx.globalAlpha=0.2;ctx.fillStyle='#6aa9ff';ctx.fillRect(tx*TILE-camera.x,ty*TILE-camera.y,TILE,TILE);}
    ctx.globalAlpha=1;ctx.fillStyle='#e6e6e6';ctx.font='14px system-ui';ctx.fillText('EDIT • E toggle • <:^>v path markers',12,24);
    ctx.restore();
  }

  // Player
  ctx.save();
  const px=player.x-camera.x, py=player.y-camera.y;
  ctx.fillStyle='#8be9fd'; roundRect(ctx,px,py,player.w,player.h,8); ctx.fill();
  ctx.fillStyle='#112'; ctx.fillRect(px+(player.facing===1?player.w-10:6),py+14,4,4);
  ctx.restore();

  // HUD
  ctx.save(); ctx.translate(14,18); ctx.fillStyle='#facc15'; ctx.fillRect(6,-6,6,22); ctx.fillRect(-4,4,26,6);
  ctx.fillStyle='#e6e6e6'; ctx.font='16px system-ui'; ctx.fillText('= '+treasureCount,32,8); ctx.restore();

  if(winTimer>0){ ctx.save(); ctx.globalAlpha=Math.min(1,winTimer/60); ctx.fillStyle='#e6e6e6'; ctx.font='28px system-ui'; ctx.textAlign='center'; ctx.fillText('You reached the flag! 🎉',canvas.width/2,50); ctx.restore(); }
}

function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath(); }

window.addEventListener('mousedown',ensureBgm);
window.addEventListener('touchstart',ensureBgm);

// Collect treasure
function collectTreasures(x,y,w,h){
  const x0=Math.floor(x/TILE), x1=Math.floor((x+w)/TILE), y0=Math.floor(y/TILE), y1=Math.floor((y+h)/TILE);
  let got=0; for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(inBounds(tx,ty)&&tiles[ty][tx]==='G'){ tiles[ty][tx]='.'; levelRows[ty] = tiles[ty].join(''); got++; }
  } if(got>0) treasureCount+=got;
}