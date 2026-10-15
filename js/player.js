'use strict';
function newPlayer() {
  return {
    x: 0,
    y: (surfAt(0) - 3) * TS,
    w: 24,
    h: 60,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    hp: 100,
    mp: 50,
    lvl: 1,
    xp: 0,
    pts: 0,
    st: { for: 0, agi: 0, vit: 0, ene: 0 },
    gold: 0,
    quests: [],
    state: 'free',
    atk: null,
    hurt: 0,
    iv: 0,
    dash: 0,
    dashCd: 0,
    coyote: 0,
    jbuf: 0,
    combo: 0,
    comboT: 0,
    anim: 'idle',
    t: 0,
    p: 0,
    spawnX: 0,
    dead: 0,
    buf: null,
    blocking: false,
    up: { glove: 0, armor: 0, boots: 0, amulet: 0 },
    bought: 0,
  };
}
const maxHp = () => 100 + P.st.vit * 18 + (P.lvl - 1) * 8;
const maxMp = () => 50 + P.st.ene * 10 + (P.lvl - 1) * 4 + P.up.amulet * 15;
const dmgMul = () => 1 + P.st.for * 0.14 + (P.lvl - 1) * 0.05 + P.up.glove * 0.15;
const spd = () => 3.1 + P.st.agi * 0.16 + P.up.boots * 0.2;
const xpNeed = (l) => Math.round(40 * l + 8 * l * l);
function addXp(n) {
  P.xp += n;
  while (P.xp >= xpNeed(P.lvl)) {
    P.xp -= xpNeed(P.lvl);
    P.lvl++;
    P.pts += 3;
    P.hp = maxHp();
    P.mp = maxMp();
    toast('NIVEAU ' + P.lvl + ' ! +3 points (touche I)', '#ffd23f');
    S.banner = { txt: 'Niveau ' + P.lvl, sub: '+3 points à répartir (touche I)', t: 150 };
    burst(P.x + 12, P.y + 30, 30, '#ffd23f', 5, 40, 3, 0.05);
    beep(500, 0.15, 'square', 0.05, 300);
    setTimeout(() => beep(800, 0.25, 'square', 0.05, 200), 130);
    save();
  }
}
const ATK = {
  punch: { dur: 15, hit: 5, dmg: 8, kb: 3, range: 38, oy: 12, bh: 26 },
  kick: { dur: 24, hit: 9, dmg: 13, kb: 6, range: 52, oy: 30, bh: 26 },
  special: { dur: 34, hit: 14 },
};
function startAttack(type) {
  if (type === 'special') {
    if (P.mp < 20) {
      pop(P.x + 12, P.y - 10, "Pas assez d'énergie", '#8fb4ff', 13);
      return;
    }
    P.mp -= 20;
  }
  P.atk = Object.assign({ type, t: 0 }, ATK[type]);
}
function attackHit(a) {
  const p = P;
  if (a.type === 'special') {
    balls.push({
      x: p.x + p.w / 2 + p.dir * 22,
      y: p.y + 26,
      vx: p.dir * 8.5,
      dir: p.dir,
      dmg: Math.round((18 + p.st.ene * 1.6) * dmgMul()),
      life: 100,
    });
    S.shake = Math.max(S.shake, 3);
    beep(300, 0.25, 'sawtooth', 0.05, 500);
    return;
  }
  const box = {
    x: p.dir > 0 ? p.x + p.w - 6 : p.x - a.range + 6,
    y: p.y + a.oy,
    w: a.range,
    h: a.bh,
  };
  let hit = false;
  for (const e of enemies) {
    if (e.dead || !overlap(box, e)) continue;
    hit = true;
    p.combo++;
    p.comboT = 70;
    const cm = 1 + Math.min(p.combo - 1, 6) * 0.08;
    let d = a.dmg * dmgMul() * cm;
    const crit = rand() < 0.08 + p.st.agi * 0.01;
    if (crit) d *= 1.8;
    damageEnemy(e, Math.round(d), a.kb, p.dir, crit);
  }
  for (const q of projs) {
    if (q.kind !== 'wave' && overlap(box, { x: q.x - q.r, y: q.y - q.r, w: q.r * 2, h: q.r * 2 })) {
      q.life = 0;
      burst(q.x, q.y, 6, '#fff', 2, 16, 2);
      hit = true;
    }
  }
  if (hit) {
    burst(box.x + box.w / 2, box.y + box.h / 2, 9, '#fff', 5, 12, 3, 0);
    S.hit = a.type === 'kick' ? 5 : 3;
    S.shake = Math.max(S.shake, a.type === 'kick' ? 5 : 3);
    beep(a.type === 'kick' ? 140 : 200, 0.09, 'square', 0.06);
  } else beep(520, 0.05, 'triangle', 0.02, -200);
  p.vx += p.dir * (a.type === 'punch' ? 1.6 : 2.4);
}
function damagePlayer(d, srcX, kb) {
  const p = P;
  if (p.iv > 0 || p.state === 'dead') return;
  d = Math.max(1, Math.round((d - p.st.vit * 0.4 - (p.lvl - 1) * 0.2) * (1 - p.up.armor * 0.07)));
  const side = p.x + p.w / 2 >= srcX ? 1 : -1;
  if (p.blocking && (srcX - (p.x + p.w / 2)) * p.dir > 0) {
    d = Math.max(1, Math.round(d * 0.25));
    p.hp -= d;
    p.iv = 18;
    p.vx = side * 2;
    pop(p.x + 12, p.y - 6, 'BLOQUÉ', '#8fb4ff', 14);
    p.mp = Math.min(maxMp(), p.mp + 3);
    beep(260, 0.08, 'triangle', 0.05);
  } else {
    p.hp -= d;
    p.state = 'hurt';
    p.hurt = 18;
    p.iv = 45;
    p.vx = side * kb;
    p.vy = -4;
    p.atk = null;
    p.combo = 0;
    S.shake = Math.max(S.shake, 7);
    S.hit = 3;
    pop(p.x + 12, p.y - 6, '-' + d, '#ff6b6b', 16);
    burst(p.x + 12, p.y + 26, 8, '#ff4d4d', 3, 22, 3);
    beep(120, 0.18, 'sawtooth', 0.06, -60);
  }
  if (p.hp <= 0) {
    p.hp = 0;
    p.state = 'dead';
    p.dead = 100;
    p.atk = null;
    toast('K.O. !', '#ff6b6b');
    if (DF().perma) {
      try {
        localStorage.removeItem(slotKey(G.slot));
      } catch (e) {}
    }
  }
}
function respawn() {
  const p = P;
  if (DF().perma) {
    endRun();
    return;
  }
  p.state = 'free';
  p.hp = maxHp();
  p.mp = maxMp();
  p.gold = Math.floor(p.gold * (1 - DF().loss));
  p.x = p.spawnX;
  p.y = (surfAt(Math.floor(p.spawnX / TS)) - 3) * TS;
  p.vx = p.vy = 0;
  p.iv = 90;
  p.hurt = 0;
  enemies = [];
  projs = [];
  boss = null;
  toast('Tu te réveilles au dernier repos (or -' + Math.round(DF().loss * 100) + ' %).');
  save();
}
function updatePlayer() {
  const p = P;
  p.t++;
  if (p.state === 'dead') {
    p.dead--;
    p.vx *= 0.9;
    p.vy = Math.min(p.vy + 0.55, 14);
    moveX(p, p.vx);
    moveY(p, p.vy);
    p.anim = 'hurt';
    if (p.dead <= 0) respawn();
    return;
  }
  if (p.iv > 0) p.iv--;
  if (p.dashCd > 0) p.dashCd--;
  if (p.comboT > 0 && --p.comboT === 0) p.combo = 0;
  p.mp = Math.min(maxMp(), p.mp + 0.06 + p.st.ene * 0.012);
  const L = held.has('left'),
    Rt = held.has('right');
  p.blocking = false;
  if (p.hurt > 0) {
    p.hurt--;
    if (p.hurt === 0) p.state = 'free';
  }
  for (const a of ['punch', 'kick', 'special']) if (pressed.has(a)) p.buf = { a, t: 10 };
  if (p.buf && --p.buf.t <= 0) p.buf = null;
  if (pressed.has('jump')) p.jbuf = 7;
  else if (p.jbuf > 0) p.jbuf--;
  if (p.onGround) p.coyote = 6;
  else if (p.coyote > 0) p.coyote--;
  let target = 0;
  if (p.state === 'free') {
    if (held.has('block') && p.onGround && !p.atk) p.blocking = true;
    else {
      if (L && !Rt) {
        target = -spd();
        p.dir = -1;
      } else if (Rt && !L) {
        target = spd();
        p.dir = 1;
      }
    }
    if (p.jbuf > 0 && p.coyote > 0) {
      p.vy = -11.3;
      p.jbuf = 0;
      p.coyote = 0;
      beep(330, 0.1, 'square', 0.03, 260);
      burst(p.x + 12, p.y + 60, 5, '#cfc8b0', 2, 18, 2);
    }
    if (!held.has('jump') && p.vy < -4.5) p.vy *= 0.88;
    if (pressed.has('dash') && p.dashCd === 0 && !p.atk) {
      p.state = 'dash';
      p.dash = 12;
      p.iv = Math.max(p.iv, 16);
      p.dashCd = 50;
      p.vx = p.dir * 9.5;
      beep(200, 0.12, 'sawtooth', 0.03, 300);
    }
    if (!p.atk && p.buf) {
      startAttack(p.buf.a);
      p.buf = null;
    }
    if (p.atk && p.onGround) target = 0;
  }
  if (p.state === 'dash') {
    p.dash--;
    p.vy = 0;
    p.vx = p.dir * 9.5;
    if (p.dash <= 0) {
      p.state = 'free';
      p.vx *= 0.4;
    }
    if (p.t % 2 === 0) burst(p.x + 12, p.y + 40, 1, 'rgba(255,255,255,.7)', 0.5, 14, 3, 0);
  }
  if (p.atk) {
    const a = p.atk;
    a.t++;
    p.p = a.t / a.dur;
    if (a.t === a.hit) attackHit(a);
    if (a.t >= a.dur) p.atk = null;
  }
  if (p.state === 'free') p.vx += (target - p.vx) * (p.onGround ? 0.35 : 0.18);
  else if (p.state === 'hurt') p.vx *= 0.92;
  if (p.state !== 'dash') p.vy = Math.min(p.vy + 0.55, 14);
  const pv = p.vy,
    wasG = p.onGround;
  if (moveX(p, p.vx)) {
    if (p.state === 'free' && p.onGround && target !== 0 && !p.atk) p.vy = -6.8;
    p.vx = 0;
  }
  moveY(p, p.vy);
  if (!wasG && p.onGround && pv > 7) burst(p.x + 12, p.y + 60, 8, '#cfc8b0', 2.5, 20, 2);
  if (p.onGround && Math.abs(p.vx) > 2.5 && p.t % 7 === 0)
    burst(p.x + 12 - p.dir * 6, p.y + 59, 2, '#cfc8b0', 1.2, 14, 2, 0.02);
  if (p.state === 'dead') p.anim = 'hurt';
  else if (p.hurt > 0) p.anim = 'hurt';
  else if (p.state === 'dash') p.anim = 'dash';
  else if (p.atk) p.anim = p.atk.type;
  else if (p.blocking) p.anim = 'block';
  else if (!p.onGround) p.anim = p.vy < 0 ? 'jump' : 'fall';
  else if (Math.abs(p.vx) > 0.6) p.anim = 'run';
  else p.anim = 'idle';
}
