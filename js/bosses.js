'use strict';
function bossName(def, k) {
  const r = Math.floor((k - 1) / 4);
  return def.name + (r > 0 ? ' ' + (['II', 'III', 'IV'][r - 1] || 'x' + (r + 1)) : '');
}
function spawnBoss(sign, k) {
  const D = BOSSES[(k - 1) % 4],
    r = Math.floor((k - 1) / 4),
    bx = sign * k * GAP,
    tx = Math.floor(bx / TS);
  const hp = D.hp * (1 + 0.55 * r) * DF().boss,
    e = {
      kind: D.kind,
      boss: true,
      def: D,
      name: bossName(D, k),
      bkey: sign + ':' + k,
      bx,
      x: bx,
      y: surfAt(tx) * TS - D.h - 1,
      w: D.w,
      h: D.h,
      vx: 0,
      vy: 0,
      dir: -sign,
      hp,
      max: hp,
      dmg: D.dmg * (1 + 0.4 * r) * DF().dmg,
      xp: D.xp * (1 + 0.5 * r) * DF().xp,
      gold: Math.round((50 + k * 25) * DF().gold),
      lv: k,
      spd: D.spd,
      t: 0,
      hurt: 0,
      cd: 70,
      bs: 'idle',
      st: 0,
      ai: 0,
      anim: 'idle',
      p: 0,
      onGround: false,
      biome: biomeAt(tx),
      next: '',
    };
  enemies.push(e);
  boss = e;
  toast('Un boss approche : ' + e.name, '#ff8a5c');
  S.banner = { txt: e.name, sub: 'Boss', t: 170, col: '#ff6a4a' };
  S.shake = 8;
  beep(90, 0.5, 'sawtooth', 0.08, -30);
}
function bossCheck() {
  if (boss) return;
  const k = Math.round(Math.abs(P.x) / GAP);
  if (k < 1) return;
  const sign = P.x < 0 ? -1 : 1;
  if (defeated.has(sign + ':' + k) || P.state === 'dead') return;
  if (Math.abs(P.x - sign * k * GAP) < 650) spawnBoss(sign, k);
}
function updateBoss(e) {
  const D = e.def,
    dx = P.x + P.w / 2 - (e.x + e.w / 2),
    dist = Math.abs(dx),
    dir = dx >= 0 ? 1 : -1,
    ph2 = e.hp < e.max * 0.5,
    sp = D.spd * (ph2 ? 1.35 : 1);
  e.t++;
  if (e.hurt > 0) e.hurt--;
  e.st--;
  if (e.bs === 'idle') {
    e.dir = dir;
    if (dist > e.w * 0.8 + 30) {
      e.vx = dir * sp;
      e.anim = 'run';
    } else {
      e.vx *= 0.7;
      e.anim = 'idle';
    }
    e.cd--;
    if (e.cd <= 0 && P.state !== 'dead') {
      e.next = D.atk[e.ai++ % D.atk.length];
      e.bs = 'tele';
      e.st = ph2 ? 22 : 34;
      e.vx = 0;
    }
  } else if (e.bs === 'tele') {
    e.dir = dir;
    e.vx *= 0.6;
    e.anim = 'special';
    e.p = 1 - Math.max(0, e.st) / (ph2 ? 22 : 34);
    if (e.st <= 0) {
      const cx = e.x + e.w / 2,
        cy = e.y + e.h * 0.4;
      if (e.next === 'charge') {
        e.bs = 'charge';
        e.st = 34;
        e.vx = dir * (sp * 3.6 + 3);
      } else if (e.next === 'slam') {
        e.bs = 'air';
        e.st = 0;
        e.vy = -13.5;
        e.vx = clamp(dx / 42, -7, 7);
      } else if (e.next === 'shoot') {
        const n = ph2 ? 7 : 5,
          a0 = Math.atan2(P.y + 30 - cy, P.x + 12 - cx);
        for (let i = 0; i < n; i++) {
          const a = a0 + (i - (n - 1) / 2) * 0.22;
          projs.push({
            kind: 'orb',
            x: cx,
            y: cy,
            vx: Math.cos(a) * 5,
            vy: Math.sin(a) * 5,
            g: 0,
            dmg: e.dmg,
            life: 200,
            r: 7,
          });
        }
        e.bs = 'rest';
        e.st = 36;
        beep(400, 0.2, 'sawtooth', 0.05, -250);
      } else if (e.next === 'summon') {
        addEnemy('slime', e.x - 60, e.biome);
        addEnemy('slime', e.x + e.w + 30, e.biome);
        e.bs = 'rest';
        e.st = 40;
      } else if (e.next === 'rocks') {
        for (let i = 0; i < 3; i++)
          projs.push({
            kind: 'rock',
            x: cx,
            y: e.y,
            vx: dx / 50 + (rand() - 0.5) * 1.8,
            vy: -9,
            g: 0.35,
            dmg: e.dmg,
            life: 160,
            r: 9,
          });
        e.bs = 'rest';
        e.st = 40;
      }
    }
  } else if (e.bs === 'charge') {
    e.anim = 'dash';
    if (e.st <= 0) {
      e.bs = 'rest';
      e.st = 40;
    }
  } else if (e.bs === 'air') {
    e.anim = 'jump';
    e.st++;
    if (e.onGround && e.st > 6) {
      for (const sd of [-1, 1])
        projs.push({
          kind: 'wave',
          x: e.x + e.w / 2,
          y: e.y + e.h - 30,
          w: 26,
          h: 30,
          vx: sd * 6,
          vy: 0,
          g: 0,
          dmg: e.dmg * 0.8,
          life: 75,
        });
      S.shake = 14;
      burst(e.x + e.w / 2, e.y + e.h, 20, '#cfc8b0', 4, 26, 3);
      beep(70, 0.3, 'sawtooth', 0.08, -20);
      e.bs = 'rest';
      e.st = 40;
      e.vx = 0;
    }
  } else if (e.bs === 'rest') {
    e.anim = 'idle';
    e.vx *= 0.8;
    if (e.st <= 0) {
      e.bs = 'idle';
      e.cd = ph2 ? 45 : 80;
    }
  }
}
