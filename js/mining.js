'use strict';
const camPx = () => [Math.round(cam.x), Math.round(cam.y)];
function inReach(tx, ty) {
  return Math.hypot(tx * TS + 16 - (P.x + P.w / 2), ty * TS + 16 - (P.y + P.h / 2)) <= TS * 4.6;
}
function breakBlock(tx, ty, id) {
  setB(tx, ty, 0);
  const it = DROP[id];
  if (it) bag[it] = (bag[it] || 0) + 1;
  if (id === 8) {
    const g = 8 + P.lvl;
    P.gold += g;
    pop(tx * TS + 16, ty * TS, '+' + g + ' or', '#ffd23f', 14);
    qProg('gold', null, g);
  }
  burst(tx * TS + 16, ty * TS + 16, 8, TILE_COL[id] || '#999', 3, 22, 3);
  qProg('mine');
  beep(id === 3 || id === 8 ? 170 : 240, 0.08, 'square', 0.05);
}
function placeBlock(tx, ty) {
  const id = HB[sel];
  if (!bag[id] || getB(tx, ty) !== 0 || !inReach(tx, ty)) return;
  if (overlap({ x: tx * TS, y: ty * TS, w: TS, h: TS }, P)) return;
  setB(tx, ty, id);
  bag[id]--;
  beep(300, 0.06, 'triangle', 0.05);
}
function craft() {
  if (bag[6] > 0) {
    bag[6]--;
    bag[10] = (bag[10] || 0) + 4;
    toast('4 planches fabriquées');
    beep(420, 0.1, 'triangle', 0.05);
  } else toast("Il faut du bois (tronc d'arbre)");
}
function updateMining() {
  if (mouse.down !== 0) {
    mine.p = 0;
    return;
  }
  const [cx, cy] = camPx(),
    tx = Math.floor((mouse.x + cx) / TS),
    ty = Math.floor((mouse.y + cy) / TS),
    id = getB(tx, ty);
  if (id && id !== 9 && inReach(tx, ty) && P.state !== 'dead') {
    if (mine.tx !== tx || mine.ty !== ty) {
      mine.tx = tx;
      mine.ty = ty;
      mine.p = 0;
    }
    mine.p += 1 + P.st.for * 0.06;
    if (mine.p >= HARD[id]) {
      breakBlock(tx, ty, id);
      mine.p = 0;
    } else if (Math.floor(mine.p) % 9 === 0 && mine.p > 1)
      burst(tx * TS + 16, ty * TS + 16, 1, TILE_COL[id] || '#999', 2, 12, 2);
  } else mine.p = 0;
}
