'use strict';
const ET = {
  slime: { w: 30, h: 24, hp: 22, dmg: 8, xp: 8, gold: 2, spd: 1.4 },
  goblin: { w: 22, h: 54, hp: 42, dmg: 11, xp: 16, gold: 4, spd: 1.6, look: 'goblin' },
  archer: { w: 22, h: 57, hp: 30, dmg: 9, xp: 20, gold: 5, spd: 1.25, look: 'archer' },
};
const SLIME_COL = ['#5fd068', '#3fb86f', '#8fd8ff', '#e6c35a'];
const slimeCol = (e) => (e.boss ? '#58d66e' : SLIME_COL[e.biome || 0]);
const BOSSES = [
  {
    name: 'Roi Gluant',
    kind: 'slime',
    w: 92,
    h: 72,
    hp: 240,
    dmg: 14,
    atk: ['slam', 'summon', 'slam'],
    spd: 1.1,
    xp: 140,
  },
  {
    name: 'Chef Gobelin',
    kind: 'fighter',
    look: 'bossGob',
    w: 36,
    h: 88,
    hp: 320,
    dmg: 16,
    atk: ['charge', 'slam', 'charge'],
    spd: 1.9,
    xp: 180,
  },
  {
    name: 'Golem des Cavernes',
    kind: 'fighter',
    look: 'golem',
    w: 46,
    h: 112,
    hp: 480,
    dmg: 20,
    atk: ['slam', 'rocks', 'slam'],
    spd: 0.9,
    xp: 240,
  },
  {
    name: 'Spectre de Givre',
    kind: 'fighter',
    look: 'spectre',
    w: 32,
    h: 78,
    hp: 400,
    dmg: 17,
    atk: ['shoot', 'charge', 'shoot'],
    spd: 1.5,
    xp: 260,
  },
];
function addEnemy(kind, x, biome) {
  const T = ET[kind],
    lv = 1 + Math.floor(Math.abs(x) / 1800),
    tx = Math.floor(x / TS);
  const y = surfAt(tx) * TS - T.h - 1;
  if (!freeBox(x, y, T.w, T.h)) return null;
  const m = 1 + 0.4 * (lv - 1),
    e = {
      kind,
      x,
      y,
      w: T.w,
      h: T.h,
      vx: 0,
      vy: 0,
      dir: -1,
      hp: T.hp * m * DF().hp,
      max: T.hp * m * DF().hp,
      dmg: T.dmg * (1 + 0.25 * (lv - 1)) * DF().dmg,
      xp: T.xp * (1 + 0.3 * (lv - 1)) * DF().xp,
      gold: Math.max(1, Math.round(T.gold * DF().gold)),
      lv,
      spd: T.spd,
      t: 0,
      hurt: 0,
      cd: 60,
      state: 'walk',
      anim: 'idle',
      p: 0,
      st: 0,
      onGround: false,
      biome: biome === undefined ? biomeAt(tx) : biome,
    };
  enemies.push(e);
  return e;
}
function spawnEnemy() {
  const night = Math.sin(S.time * 6.283) < -0.1,
    d = Math.abs(P.x) / TS;
  const cap = Math.max(1, 3 + (night ? 2 : 0) + Math.min(3, Math.floor(d / 150)) + DF().cap);
  if (enemies.filter((e) => !e.boss).length >= cap) return;
  const side = rand() < 0.5 ? -1 : 1,
    px = P.x + side * (540 + rand() * 240);
  let kind = 'slime';
  const r = rand();
  if (d > 40 && r > 0.55) kind = 'goblin';
  if (night && d > 25 && r > 0.4) kind = 'goblin';
  if (d > 110 && r > 0.82) kind = 'archer';
  const e = addEnemy(kind, px);
  if (e) e.dir = -side;
}
function enemyMelee(e) {
  const box = { x: e.dir > 0 ? e.x + e.w : e.x - 34, y: e.y + 10, w: 34, h: e.h - 20 };
  if (overlap(box, P)) damagePlayer(e.dmg, e.x + e.w / 2, 5);
}
function updateEnemy(e) {
  e.t++;
  if (e.hurt > 0) e.hurt--;
  if (e.cd > 0) e.cd--;
  const dx = P.x + P.w / 2 - (e.x + e.w / 2),
    dist = Math.abs(dx),
    dir = dx >= 0 ? 1 : -1,
    alive = P.state !== 'dead';
  if (e.kind === 'slime') {
    if (e.onGround) {
      e.vx *= 0.7;
      e.jt = (e.jt || 0) - 1;
      if (e.jt <= 0) {
        e.jt = 50 + Math.floor(rand() * 40);
        if (dist < 480 && alive) {
          e.dir = dir;
          e.vy = -8.5;
          e.vx = dir * 2.8;
        } else {
          e.dir = rand() < 0.5 ? -1 : 1;
          e.vy = -5;
          e.vx = e.dir * 1.6;
        }
      }
    }
    return;
  }
  if (e.kind === 'goblin') {
    if (e.state === 'swing') {
      e.st++;
      e.anim = 'punch';
      e.p = e.st / 26;
      e.vx *= 0.8;
      if (e.st === 13) enemyMelee(e);
      if (e.st >= 26) {
        e.state = 'walk';
        e.cd = 45 + rand() * 30;
      }
    } else {
      e.dir = dir;
      if (dist < 460 && alive) {
        if (dist > 40) {
          e.vx = dir * e.spd;
          e.anim = 'run';
        } else {
          e.vx *= 0.6;
          e.anim = 'idle';
          if (e.cd <= 0) {
            e.state = 'swing';
            e.st = 0;
          }
        }
      } else {
        e.anim = 'idle';
        e.vx *= 0.8;
      }
    }
    return;
  }
  if (e.kind === 'archer') {
    e.dir = dir;
    if (e.state === 'shoot') {
      e.st++;
      e.anim = 'special';
      e.p = e.st / 30;
      e.vx *= 0.8;
      if (e.st === 16)
        projs.push({
          kind: 'arrow',
          x: e.x + e.w / 2 + dir * 14,
          y: e.y + e.h * 0.4,
          vx: dir * 5.8,
          vy: -1.6,
          g: 0.07,
          dmg: e.dmg,
          life: 140,
          r: 5,
        });
      if (e.st >= 30) {
        e.state = 'walk';
        e.cd = 90 + rand() * 50;
      }
    } else {
      if (dist < 200) {
        e.vx = -dir * e.spd;
        e.anim = 'run';
      } else if (dist > 340) {
        e.vx = dir * e.spd;
        e.anim = 'run';
      } else {
        e.vx *= 0.7;
        e.anim = 'idle';
      }
      if (e.cd <= 0 && dist < 480 && alive) {
        e.state = 'shoot';
        e.st = 0;
      }
    }
  }
}
function killEnemy(e) {
  if (e.dead) return;
  e.dead = true;
  const cx = e.x + e.w / 2,
    cy = e.y + e.h / 2;
  burst(cx, cy, e.boss ? 40 : 14, e.kind === 'slime' ? slimeCol(e) : '#cfc8b0', 4, 34, 4);
  addXp(Math.round(e.xp));
  const n = Math.min(e.boss ? 14 : 6, Math.max(1, Math.round(e.gold / (e.boss ? 4 : 1.5)))),
    v = Math.max(1, Math.round(e.gold / n));
  for (let i = 0; i < n; i++)
    coins.push({
      x: cx,
      y: cy,
      w: 10,
      h: 10,
      vx: (rand() - 0.5) * 6,
      vy: -3 - rand() * 4,
      v,
      t: 0,
      vy0: 0,
    });
  if (rand() < DF().heart || e.boss)
    coins.push({
      x: cx,
      y: cy,
      w: 12,
      h: 12,
      vx: (rand() - 0.5) * 3,
      vy: -5,
      heart: true,
      t: 0,
      v: 0,
    });
  qProg('kill', e.kind);
  if (e.boss) {
    boss = null;
    defeated.add(e.bkey);
    P.pts += 2;
    qProg('boss');
    S.shake = 18;
    S.hit = 8;
    toast('BOSS VAINCU : ' + e.name + ' (+2 points)', '#ffd23f');
    S.banner = { txt: 'Boss vaincu', sub: e.name, t: 180 };
    beep(200, 0.2, 'square', 0.06, 200);
    setTimeout(() => beep(400, 0.3, 'square', 0.06, 400), 200);
    save();
  }
}
function damageEnemy(e, d, kb, dir, crit) {
  e.hp -= d;
  e.hurt = e.boss ? 5 : 14;
  if (!e.boss) {
    e.vx = dir * kb;
    e.vy = -3.2;
    if (e.state === 'swing' || e.state === 'shoot') {
      e.state = 'walk';
      e.cd = 40;
      e.st = 0;
    }
  } else e.vx += dir * kb * 0.1;
  pop(e.x + e.w / 2, e.y, String(d) + (crit ? '!' : ''), crit ? '#ffd23f' : '#fff', crit ? 18 : 14);
  burst(
    e.x + e.w / 2,
    e.y + e.h * 0.4,
    crit ? 10 : 6,
    e.kind === 'slime' ? slimeCol(e) : '#e8e2cf',
    3,
    22,
    3,
  );
  if (e.hp <= 0) killEnemy(e);
}
