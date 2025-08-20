// renderer.js
import { TILE } from './engine.js';
import * as Editor from './editor.js';
import { movers, collectibles } from './entities.js';

export function renderLevel(ctx, tiles, W, H, camera){
  const startX = Math.floor(camera.x/TILE)-1;
  const startY = Math.floor(camera.y/TILE)-1;
  const endX = startX + Math.ceil(ctx.canvas.width/TILE)+2;
  const endY = startY + Math.ceil(ctx.canvas.height/TILE)+2;

  for(let ty=startY; ty<endY; ty++){
    for(let tx=startX; tx<endX; tx++){
      if(tx<0||ty<0||tx>=W||ty>=H) continue;
      const t = tiles[ty][tx];
      const x = tx*TILE-camera.x, y = ty*TILE-camera.y;
      if(t === '#'){
        ctx.fillStyle='#2a335f'; ctx.fillRect(x,y,TILE,TILE);
        ctx.fillStyle='#3b4682'; ctx.fillRect(x+4,y+4,TILE-8,TILE-8);
      } else if(t === '-'){
        ctx.fillStyle='#4c7ad8'; ctx.fillRect(x,y+TILE-10,TILE,6);
      } else if(t === 'T'){
        ctx.fillStyle='#16a34a'; ctx.fillRect(x,y+TILE-12,TILE,10);
      } else if(t === 'F'){
        ctx.fillStyle='#f2c14e'; ctx.fillRect(x+TILE/2-3,y+8,6,TILE-16);
      } else if(t === 'G'){
        ctx.fillStyle='#facc15'; ctx.fillRect(x+20,y+8,8,TILE-16);
      } else if(t==='d'){
        ctx.fillStyle='#ef4444';
        for(let i=0;i<4;i++){
          ctx.beginPath();
          ctx.moveTo(x+i*TILE/4,y+TILE);
          ctx.lineTo(x+i*TILE/4+TILE/8,y+TILE-12);
          ctx.lineTo(x+i*TILE/4+TILE/4,y+TILE);
          ctx.fill();
        }
      }
    }
  }
  // draw crosses (collectibles)
  for (const c of collectibles) {
      const cx = c.x - camera.x;
      const cy = c.y - camera.y;
      ctx.fillStyle='#16a34a';
      ctx.fillRect(cx, cy, TILE, TILE-2);
  }
  // draw moving platforms
  for (const m of movers) {
    if (m.type === 'P') {
      ctx.fillStyle='#888';
      ctx.fillRect(m.x-camera.x, m.y-camera.y, TILE, TILE/2);
    }
  }
}

export function renderPlayer(ctx, player, camera){
  ctx.fillStyle='#8be9fd';
  ctx.fillRect(player.x-camera.x, player.y-camera.y, player.w, player.h);
}

import { enemies } from './entities.js';

export function renderEnemies(ctx, camera){
  for(const e of enemies){
    const ex = e.x - camera.x;
    const ey = e.y - camera.y;
    // Simple body
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(ex, ey, e.w, e.h);
    // Distorted face (black eyes, wide creepy smile)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ex + e.w*0.3, ey + e.h*0.4, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + e.w*0.7, ey + e.h*0.4, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + e.w*0.5, ey + e.h*0.7, 6, 0, Math.PI); ctx.lineWidth=2; ctx.strokeStyle='#000'; ctx.stroke();
  }
}

export function renderParticles(ctx, particles, camera){
  ctx.fillStyle='#dc2626';
  for(const p of particles){
    ctx.fillRect(p.x-camera.x,p.y-camera.y,4,4);
  }
}