'use strict';
function startGame(slot, opts) {
  initAudio();
  let ok = true;
  if (opts) newGame(Object.assign({ slot }, opts));
  else ok = load(slot);
  if (!ok) {
    showMenu('slots');
    return;
  }
  cv.style.cursor = 'crosshair';
  S.scene = 'game';
  S.frame = 0;
  held.clear();
  pressed.clear();
  mouse.down = -1;
  closePanels();
  menu.hidden = true;
  pDeath.hidden = true;
  try {
    localStorage.setItem(LASTKEY, slot);
  } catch (e) {}
  if (opts) pHelp.hidden = false;
  else toast('Bon retour, ' + G.name + ' !');
  save();
}
function quitToMenu() {
  save();
  S.scene = 'menu';
  pDeath.hidden = true;
  closePanels();
  setupDemo();
  showMenu('main');
}
function endRun() {
  const info =
    G.name +
    ' · niveau ' +
    P.lvl +
    ' · ' +
    Math.round(Math.abs(P.x) / TS) +
    ' m · ' +
    defeated.size +
    ' boss · ' +
    fmtTime(G.play);
  try {
    localStorage.removeItem(slotKey(G.slot));
  } catch (e) {}
  S.scene = 'over';
  $('deathInfo').textContent = info;
  closePanels();
  pDeath.hidden = false;
}
$('bDeath').addEventListener('click', () => {
  S.scene = 'menu';
  pDeath.hidden = true;
  setupDemo();
  showMenu('main');
});
function setupDemo() {
  SEED = Math.floor(rand() * 900) + 1;
  resetWorld();
  G = { slot: 0, name: '', diff: 'normal', play: 0, created: 0 };
  P = newPlayer();
  P.x = 0;
  P.dir = 1;
  P.anim = 'run';
  cv.style.cursor = 'default';
  S.time = rand();
  S.scene = 'menu';
  S.shake = 0;
  S.toasts = [];
  mouse.inside = false;
  mouse.down = -1;
  cam.x = -W * 0.68;
  cam.y = P.y - H * 0.62;
}
function menuFrame(k) {
  S.frame++;
  S.time = (S.time + k / 2600) % 1;
  P.t += k;
  P.x += 2.1 * k;
  const ty = surfAt(Math.floor((P.x + 12) / TS)) * TS - 60;
  P.y += (ty - P.y) * Math.min(1, 0.2 * k);
  P.anim = 'run';
  cam.x = P.x - W * 0.68;
  cam.y = clamp(P.y - H * 0.62, -160, ROWS * TS - H);
  const tg = BIOME_TINT[biomeAt(Math.floor(P.x / TS))];
  for (let i = 0; i < 3; i++) S.bt[i] += (tg[i] - S.bt[i]) * 0.02;
  const [bx, by] = camPx();
  drawWorld(bx, by);
}
