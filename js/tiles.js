'use strict';
const TB = {
  1: '#7a5230',
  2: '#7a5230',
  3: '#7d8290',
  4: '#e2cf8f',
  5: '#7a5230',
  6: '#6b4a2b',
  7: '#3f9c4a',
  8: '#7d8290',
  9: '#2a2a33',
  10: '#b98a4e',
};
const TILE_COL = {
  1: '#7a5230',
  2: '#7a5230',
  3: '#7d8290',
  4: '#e2cf8f',
  5: '#eef3f9',
  6: '#6b4a2b',
  7: '#3f9c4a',
  8: '#ffd23f',
  9: '#2a2a33',
  10: '#b98a4e',
};
const TILES = [];
function mkTile(id) {
  const c = document.createElement('canvas');
  c.width = c.height = TS;
  const g = c.getContext('2d');
  let seed = id * 7919 + 13;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  g.fillStyle = TB[id];
  g.fillRect(0, 0, TS, TS);
  for (let i = 0; i < 30; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.15)';
    g.fillRect(Math.floor(r() * 8) * 4, Math.floor(r() * 8) * 4, 4, 4);
  }
  if (id === 1 || id === 5) {
    g.fillStyle = id === 1 ? '#5db84a' : '#eef3f9';
    g.fillRect(0, 0, TS, 8);
    for (let i = 0; i < 8; i++) g.fillRect(i * 4, 8, 4, Math.floor(r() * 6));
    g.fillStyle = id === 1 ? '#78d35f' : '#fff';
    g.fillRect(0, 0, TS, 3);
  }
  if (id === 6) {
    g.fillStyle = 'rgba(0,0,0,.22)';
    for (let i = 0; i < 4; i++) g.fillRect(4 + i * 8, 0, 2, TS);
    g.fillStyle = 'rgba(255,255,255,.1)';
    g.fillRect(0, 0, 3, TS);
  }
  if (id === 7) {
    g.clearRect(0, 0, TS, TS);
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        if (r() > 0.18) {
          g.fillStyle = r() < 0.5 ? '#3f9c4a' : '#4cb558';
          g.fillRect(x * 4, y * 4, 4, 4);
        }
      }
    return c;
  }
  if (id === 8) {
    for (let i = 0; i < 7; i++) {
      g.fillStyle = r() < 0.6 ? '#ffd23f' : '#fff2a6';
      g.fillRect(2 + Math.floor(r() * 6) * 4, 2 + Math.floor(r() * 6) * 4, 4, 4);
    }
  }
  if (id === 10) {
    g.fillStyle = 'rgba(0,0,0,.25)';
    for (let y = 7; y < TS; y += 8) g.fillRect(0, y, TS, 1);
    g.fillRect(10, 0, 1, 8);
    g.fillRect(22, 8, 1, 8);
    g.fillRect(8, 16, 1, 8);
    g.fillRect(24, 24, 1, 8);
  }
  g.fillStyle = 'rgba(0,0,0,.2)';
  g.fillRect(0, TS - 2, TS, 2);
  g.fillRect(TS - 2, 0, 2, TS);
  return c;
}
for (let i = 1; i <= 10; i++) TILES[i] = mkTile(i);
const HARD = { 1: 16, 2: 14, 3: 34, 4: 10, 5: 10, 6: 24, 7: 5, 8: 46, 10: 22 };
const DROP = { 1: 2, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 10: 10 };
const HB = [2, 3, 4, 5, 6, 10];
