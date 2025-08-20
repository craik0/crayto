// editor.js - editor mode state and brush selection
// Editor mode state
export let editMode = false;
export let currentBrush = '#';
// Get references to editor UI elements
const toggleEditBtn = document.getElementById('toggleEdit');
const swatches = Array.from(document.querySelectorAll('.swatch'));

// Enable or disable edit mode
export function setEditMode(on) {
  editMode = on;
  if (toggleEditBtn) {
    toggleEditBtn.textContent = `Edit: ${on ? 'On' : 'Off'}`;
  }
  document.body.style.cursor = on ? 'crosshair' : 'default';
}

// Set current brush for painting
export function setBrush(b) {
  currentBrush = b;
  swatches.forEach(s => s.classList.toggle('active', s.dataset.brush === b));
}