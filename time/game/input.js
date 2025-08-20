// input.js - handle keyboard and mouse input state
export const keys = new Set();
export const mouse = { x: 0, y: 0, left: false, right: false };

export function setupInput(canvas) {
  window.addEventListener('keydown', e => {
    keys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', e => {
    keys.delete(e.key.toLowerCase());
  });
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) mouse.left = true;
    if (e.button === 2) mouse.right = true;
  });
  window.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.left = false;
    if (e.button === 2) mouse.right = false;
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}