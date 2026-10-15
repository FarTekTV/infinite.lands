'use strict';
const keymap = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  ArrowDown: 'block',
  KeyS: 'block',
  KeyJ: 'punch',
  KeyK: 'kick',
  KeyL: 'special',
  ShiftLeft: 'dash',
  ShiftRight: 'dash',
  KeyE: 'interact',
  KeyC: 'craft',
  KeyB: 'shop',
};
addEventListener('keydown', (e) => {
  const tg = e.target && e.target.tagName;
  if (tg === 'INPUT' || tg === 'TEXTAREA') return;
  initAudio();
  if (e.code === 'KeyF') {
    if (!e.repeat) toggleFull();
    return;
  }
  if (e.code === 'Escape') {
    if (!e.repeat) onEscape();
    return;
  }
  if (S.scene !== 'game' || !menu.hidden || !pDeath.hidden) return;
  const a = keymap[e.code];
  if (a) {
    e.preventDefault();
    if (e.repeat) return;
    if (!held.has(a)) pressed.add(a);
    held.add(a);
    return;
  }
  if (e.repeat) return;
  if (e.code.startsWith('Digit')) {
    const n = +e.code.slice(5);
    if (n >= 1 && n <= 6) sel = n - 1;
  } else if (e.code === 'KeyI') toggleStats();
  else if (e.code === 'KeyH') toggleHelp();
});
addEventListener('keyup', (e) => {
  const a = keymap[e.code];
  if (a) held.delete(a);
});
addEventListener('blur', () => held.clear());
for (const b of document.querySelectorAll('#touch [data-act]')) {
  const a = b.dataset.act;
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    initAudio();
    if (!held.has(a)) pressed.add(a);
    held.add(a);
    b.classList.add('on');
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave'])
    b.addEventListener(ev, () => {
      held.delete(a);
      b.classList.remove('on');
    });
}
$('bMode').addEventListener('click', (e) => {
  mode = mode === 'mine' ? 'place' : 'mine';
  e.currentTarget.textContent = mode === 'mine' ? 'Miner' : 'Poser';
});
function mpos(e) {
  const r = cv.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) * W) / r.width;
  mouse.y = ((e.clientY - r.top) * H) / r.height;
}
cv.addEventListener('contextmenu', (e) => e.preventDefault());
cv.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  initAudio();
  if (S.scene !== 'game' || paused()) return;
  mpos(e);
  mouse.inside = true;
  const x0 = (W - 6 * 48) / 2,
    y0 = H - 56;
  if (mouse.y >= y0 && mouse.y <= y0 + 44 && mouse.x >= x0 && mouse.x < x0 + 6 * 48) {
    sel = clamp(Math.floor((mouse.x - x0) / 48), 0, 5);
    return;
  }
  try {
    cv.setPointerCapture(e.pointerId);
  } catch (err) {}
  const place = e.button === 2 || (e.pointerType === 'touch' && mode === 'place');
  if (place) {
    const [cx, cy] = camPx();
    placeBlock(Math.floor((mouse.x + cx) / TS), Math.floor((mouse.y + cy) / TS));
  } else mouse.down = 0;
});
cv.addEventListener('pointermove', (e) => {
  mpos(e);
  mouse.inside = S.scene === 'game';
});
cv.addEventListener('pointerup', () => {
  mouse.down = -1;
});
cv.addEventListener('pointercancel', () => {
  mouse.down = -1;
});
cv.addEventListener('pointerleave', () => {
  mouse.inside = false;
  mouse.down = -1;
});
addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});
