'use strict';
const BIOME_NAME = ['Plaines', 'Forêt', 'Toundra', 'Désert'];
function biomeAt(x) {
  if (Math.abs(x) < 40) return 0;
  const b = noise1(x / 110, 7);
  return b < 0.3 ? 3 : b < 0.62 ? 0 : b < 0.82 ? 1 : 2;
}
function arenaK(x) {
  return Math.round(x / GAPT);
}
function rawSurf(x) {
  const b = biomeAt(x),
    amp = b === 3 ? 2.2 : b === 2 ? 5.5 : 4.2,
    k = Math.min(1, Math.abs(x) / 25);
  return clamp(
    Math.round(11 + ((noise1(x / 20, 1) - 0.5) * 2 * amp + (noise1(x / 7, 2) - 0.5) * 2) * k),
    6,
    17,
  );
}
function surfAt(x) {
  const k = arenaK(x);
  if (k) {
    const d = Math.abs(x - k * GAPT);
    if (d < 26) {
      const raw = rawSurf(x),
        flat = rawSurf(k * GAPT);
      return Math.round(lerp(flat, raw, clamp((d - 16) / 10, 0, 1)));
    }
  }
  return rawSurf(x);
}
function treeAtCol(x) {
  const c = Math.floor(x / 5),
    off = Math.floor(rnd(c, 9) * 5);
  if (c * 5 + off !== x) return 0;
  const k = arenaK(x);
  if (k && Math.abs(x - k * GAPT) < 20) return 0;
  const b = biomeAt(x);
  if (b === 3 || Math.abs(x) < 6) return 0;
  const p = b === 1 ? 0.85 : b === 2 ? 0.35 : 0.3;
  if (rnd(c, 10) > p) return 0;
  return 3 + Math.floor(rnd(c, 11) * 3);
}
const colCache = new Map(),
  mods = new Map();
function col(x) {
  let c = colCache.get(x);
  if (c) return c;
  const a = new Uint8Array(ROWS),
    s = surfAt(x),
    b = biomeAt(x);
  for (let y = s; y < ROWS; y++) {
    let id;
    if (y === ROWS - 1) id = 9;
    else if (y === s) id = b === 3 ? 4 : b === 2 ? 5 : 1;
    else if (y < s + (b === 3 ? 4 : 3)) id = b === 3 ? 4 : 2;
    else id = 3;
    if (id === 3 && y > s + 6 && rnd(x * 91 + y * 17, 5) < 0.035) id = 8;
    if (y > s + 3 && y < ROWS - 2 && Math.abs(x) > 3) {
      const cc = noise1(x / 9 + y / 13, 21) + noise1(y / 7 - x / 11, 22);
      if (cc > 1.5) id = 0;
    }
    a[y] = id;
  }
  for (let dx = -2; dx <= 2; dx++) {
    const cx = x + dx,
      th = treeAtCol(cx);
    if (!th) continue;
    const sc = surfAt(cx);
    if (dx === 0) for (let y = sc - th; y < sc; y++) a[y] = 6;
    const top = sc - th;
    for (let y = top - 2; y <= top; y++) {
      if (Math.abs(dx) === 2 && y !== top) continue;
      if (y >= 0 && a[y] === 0) a[y] = 7;
    }
  }
  c = { a, s, b };
  colCache.set(x, c);
  return c;
}
const mkey = (x, y) => (x + 2000000) * 64 + y;
function getB(x, y) {
  if (y < 0) return 0;
  if (y >= ROWS) return 9;
  const m = mods.get(mkey(x, y));
  if (m !== undefined) return m;
  return col(x).a[y];
}
function setB(x, y, v) {
  if (y < 0 || y >= ROWS) return;
  mods.set(mkey(x, y), v);
}
const solid = (id) => id !== 0 && id !== 7;
function moveX(e, dx) {
  if (dx === 0) return false;
  e.x += dx;
  const x0 = Math.floor(e.x / TS),
    x1 = Math.floor((e.x + e.w - 0.01) / TS),
    y0 = Math.floor(e.y / TS),
    y1 = Math.floor((e.y + e.h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (solid(getB(tx, ty))) {
        if (dx > 0) e.x = tx * TS - e.w;
        else e.x = (tx + 1) * TS;
        return true;
      }
  return false;
}
function moveY(e, dy) {
  e.y += dy;
  e.onGround = false;
  const x0 = Math.floor(e.x / TS),
    x1 = Math.floor((e.x + e.w - 0.01) / TS),
    y0 = Math.floor(e.y / TS),
    y1 = Math.floor((e.y + e.h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (solid(getB(tx, ty))) {
        if (dy > 0) {
          e.y = ty * TS - e.h;
          e.onGround = true;
        } else e.y = (ty + 1) * TS;
        e.vy = 0;
        return true;
      }
  return false;
}
function freeBox(x, y, w, h) {
  const x0 = Math.floor(x / TS),
    x1 = Math.floor((x + w - 0.01) / TS),
    y0 = Math.floor(y / TS),
    y1 = Math.floor((y + h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) if (solid(getB(tx, ty))) return false;
  return true;
}
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
