'use strict';
const W = 960,
  H = 540,
  TS = 32,
  ROWS = 36,
  GAPT = 75,
  GAP = GAPT * TS,
  NPCW = 47,
  KEY = 'terres-infinies-v1';
const $ = (id) => document.getElementById(id);
const cv = $('g'),
  ctx = cv.getContext('2d');
cv.width = W;
cv.height = H;
ctx.imageSmoothingEnabled = false;
let RS = 1;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp = (a, b, t) => a + (b - a) * t,
  rand = Math.random;
let SEED = 0;
function rnd(i, s) {
  const x = Math.sin(i * 127.1 + (s + SEED) * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function noise1(x, s) {
  const i = Math.floor(x),
    f = x - i,
    u = f * f * (3 - 2 * f);
  return rnd(i, s) * (1 - u) + rnd(i + 1, s) * u;
}
const S = { scene: 'menu', frame: 0, time: 0.06, shake: 0, hit: 0, toasts: [], bt: [96, 150, 126] };
const DIFFS = {
  easy: {
    key: 'easy',
    name: 'Facile',
    hp: 0.7,
    dmg: 0.6,
    xp: 1.3,
    gold: 1.3,
    cap: -1,
    loss: 0.25,
    heart: 0.25,
    boss: 0.8,
    desc: "Ennemis plus faibles, plus d'xp et d'or. Mort : -25 % d'or.",
  },
  normal: {
    key: 'normal',
    name: 'Normal',
    hp: 1,
    dmg: 1,
    xp: 1,
    gold: 1,
    cap: 0,
    loss: 0.5,
    heart: 0.14,
    boss: 1,
    desc: "L'expérience prévue. Mort : -50 % d'or.",
  },
  hard: {
    key: 'hard',
    name: 'Difficile',
    hp: 1.4,
    dmg: 1.5,
    xp: 0.9,
    gold: 0.8,
    cap: 2,
    loss: 0.75,
    heart: 0.08,
    boss: 1.3,
    desc: "Ennemis nombreux et costauds, soins rares. Mort : -75 % d'or.",
  },
  hardcore: {
    key: 'hardcore',
    name: 'Hardcore',
    hp: 1.6,
    dmg: 2,
    xp: 1.2,
    gold: 0.7,
    cap: 3,
    loss: 1,
    heart: 0.05,
    boss: 1.5,
    perma: true,
    desc: 'Une seule vie. La mort efface la sauvegarde.',
  },
};
let G = { slot: 0, name: 'Héros', diff: 'normal', play: 0, created: 0 };
const DF = () => DIFFS[G.diff] || DIFFS.normal;
const SET = { sound: true, vol: 0.6, shake: true, dmgnums: true };
const cam = { x: 0, y: 0 };
let P,
  enemies = [],
  projs = [],
  balls = [],
  parts = [],
  coins = [],
  pops = [],
  boss = null,
  nearNPC = null;
let bag = {},
  done = new Set(),
  defeated = new Set(),
  sel = 0,
  mode = 'mine';
const npcMap = new Map();
const held = new Set(),
  pressed = new Set(),
  mouse = { x: 0, y: 0, down: -1, inside: false };
let mine = { tx: 0, ty: 0, p: 0 };
function burst(x, y, n, col, spd, life, size, g) {
  for (let i = 0; i < n && parts.length < 500; i++) {
    const a = rand() * 6.283,
      s = rand() * spd;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 1,
      life: life * (0.6 + rand() * 0.6),
      max: life,
      col,
      size: size * (0.6 + rand() * 0.7),
      g: g === undefined ? 0.15 : g,
    });
  }
}
function pop(x, y, txt, col, size) {
  if (!SET.dmgnums && /^[-\d]/.test(txt)) return;
  pops.push({ x, y, txt, col: col || '#fff', size: size || 14, life: 50, vy: -1.1 });
}
function toast(txt, col) {
  S.toasts.push({ txt, col: col || '#ece7d9', t: 200 });
  if (S.toasts.length > 4) S.toasts.shift();
}
