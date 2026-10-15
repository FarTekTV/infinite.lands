'use strict';
function render() {
  const [bx, by] = camPx(),
    cx = bx + Math.round((Math.random() - 0.5) * S.shake * (SET.shake ? 2 : 0)),
    cy = by + Math.round((Math.random() - 0.5) * S.shake * (SET.shake ? 2 : 0));
  drawWorld(cx, cy);
  drawHud();
}
let last = performance.now(),
  acc = 0,
  lastCW = 0;
function fitCanvas() {
  const cw = cv.clientWidth;
  if (!cw || cw === lastCW) return;
  lastCW = cw;
  const dpr = Math.min(window.devicePixelRatio || 1, 2),
    px = clamp(Math.round(cw * dpr), 960, 2560);
  cv.width = px;
  cv.height = Math.round((px * 9) / 16);
  RS = cv.width / W;
  stage.style.setProperty('--zf', Math.min(1.4, 1 + (cw / 960 - 1) * 0.3).toFixed(3));
}
function loop(now) {
  const dt = Math.min(100, now - last);
  last = now;
  acc += dt;
  while (acc >= 16.667) {
    acc -= 16.667;
    if (S.scene === 'menu' || paused()) {
      pressed.clear();
      continue;
    }
    if (S.hit > 0) {
      S.hit--;
      continue;
    }
    update();
    if (S.frame % 20 === 0) renderStats();
  }
  fitCanvas();
  if (S.scene === 'menu') menuFrame(dt / 16.667);
  else render();
  requestAnimationFrame(loop);
}
loadSettings();
migrateOld();
setupDemo();
showMenu('main');
requestAnimationFrame(loop);
