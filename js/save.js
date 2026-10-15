'use strict';
const slotKey = (i) => 'terres-infinies-slot-' + i;
function save() {
  if (S.scene !== 'game' || !G.slot || !P) return;
  if (P.state === 'dead' && DF().perma) return;
  try {
    const o = {
      v: 2,
      meta: {
        name: G.name,
        diff: G.diff,
        play: G.play,
        created: G.created,
        saved: Date.now(),
        lvl: P.lvl,
        gold: Math.floor(P.gold),
        dist: Math.round(Math.abs(P.x) / TS),
        bosses: defeated.size,
        seed: SEED,
      },
      seed: SEED,
      t: S.time,
      P: {
        x: P.x,
        y: P.y,
        hp: P.hp,
        mp: P.mp,
        lvl: P.lvl,
        xp: P.xp,
        pts: P.pts,
        st: P.st,
        gold: P.gold,
        quests: P.quests,
        spawnX: P.spawnX,
        up: P.up,
        bought: P.bought,
      },
      done: Array.from(done),
      defeated: Array.from(defeated),
      bag,
      mods: Array.from(mods).slice(0, 60000),
      sel,
    };
    localStorage.setItem(slotKey(G.slot), JSON.stringify(o));
  } catch (e) {}
}
function readSlot(i) {
  try {
    const s = localStorage.getItem(slotKey(i));
    if (!s) return null;
    const o = JSON.parse(s);
    return o && o.P ? o : null;
  } catch (e) {
    return null;
  }
}
function resetWorld() {
  colCache.clear();
  mods.clear();
  npcMap.clear();
  enemies = [];
  projs = [];
  balls = [];
  parts = [];
  coins = [];
  pops = [];
  boss = null;
  nearNPC = null;
}
function load(slot) {
  const o = readSlot(slot);
  if (!o) return false;
  const m = o.meta || {};
  G = {
    slot,
    name: m.name || 'Héros',
    diff: DIFFS[m.diff] ? m.diff : 'normal',
    play: m.play || 0,
    created: m.created || Date.now(),
  };
  SEED = o.seed || 0;
  resetWorld();
  P = Object.assign(newPlayer(), o.P);
  P.up = Object.assign({ glove: 0, armor: 0, boots: 0, amulet: 0 }, P.up);
  P.bought = P.bought || 0;
  P.state = 'free';
  S.time = o.t || 0.06;
  done = new Set(o.done || []);
  defeated = new Set(o.defeated || []);
  bag = o.bag || {};
  sel = o.sel || 0;
  for (const mm of o.mods || []) mods.set(mm[0], mm[1]);
  let n = 0;
  while (!freeBox(P.x, P.y, P.w, P.h) && n++ < 40) P.y -= TS;
  cam.x = P.x - W / 2;
  cam.y = P.y - H * 0.58;
  return true;
}
function newGame(opts) {
  G = {
    slot: opts.slot,
    name: opts.name || 'Héros',
    diff: DIFFS[opts.diff] ? opts.diff : 'normal',
    play: 0,
    created: Date.now(),
  };
  SEED = opts.seed || Math.floor(rand() * 900) + 1;
  resetWorld();
  P = newPlayer();
  S.time = 0.06;
  done = new Set();
  defeated = new Set();
  bag = {};
  sel = 0;
  cam.x = P.x - W / 2;
  cam.y = P.y - H * 0.58;
  S.shake = 0;
  S.hit = 0;
  S.toasts = [];
  toast('Un nouveau monde se génère devant toi.');
  S.scene = 'game';
  save();
}
