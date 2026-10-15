'use strict';
function updateProjectiles() {
  for (const b of balls) {
    b.x += b.vx;
    b.life--;
    if (S.frame % 2 === 0) burst(b.x, b.y, 1, '#ff9a3c', 1, 14, 4, 0);
    if (solid(getB(Math.floor(b.x / TS), Math.floor(b.y / TS)))) b.life = 0;
    else
      for (const e of enemies) {
        if (!e.dead && b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
          damageEnemy(e, b.dmg, 6, b.dir, false);
          b.life = 0;
          S.hit = 3;
          break;
        }
      }
    if (b.life <= 0) {
      burst(b.x, b.y, 14, '#ff9a3c', 4, 24, 4);
      beep(150, 0.15, 'sawtooth', 0.05, -80);
    }
  }
  balls = balls.filter((b) => b.life > 0);
  for (const q of projs) {
    q.x += q.vx;
    q.y += q.vy;
    q.vy += q.g || 0;
    q.life--;
    if (q.kind !== 'wave' && solid(getB(Math.floor(q.x / TS), Math.floor(q.y / TS)))) q.life = 0;
    if (P.state === 'dead' || q.life <= 0) continue;
    const hit =
      q.kind === 'wave'
        ? overlap({ x: q.x - q.w / 2, y: q.y, w: q.w, h: q.h }, P)
        : q.x > P.x - q.r && q.x < P.x + P.w + q.r && q.y > P.y - q.r && q.y < P.y + P.h + q.r;
    if (hit) {
      damagePlayer(q.dmg, q.x - q.vx * 4, q.kind === 'wave' ? 7 : 4);
      if (q.kind !== 'wave') q.life = 0;
    }
  }
  projs = projs.filter((q) => q.life > 0);
  for (const c of coins) {
    c.t++;
    const px = P.x + P.w / 2,
      py = P.y + P.h / 2,
      dx = px - c.x,
      dy = py - c.y,
      d = Math.hypot(dx, dy);
    if (c.t > 20 && d < 120 && P.state !== 'dead') {
      c.mag = true;
      c.x += (dx / d) * 6;
      c.y += (dy / d) * 6;
    } else {
      c.vy = Math.min(c.vy + 0.4, 10);
      c.vx *= 0.96;
      moveX(c, c.vx);
      moveY(c, c.vy);
      if (c.onGround) c.vx *= 0.8;
    }
    if (d < 22 && c.t > 8) {
      c.got = true;
      if (c.heart) {
        P.hp = Math.min(maxHp(), P.hp + 18);
        pop(px, P.y - 8, '+PV', '#ff7a7a', 14);
      } else {
        P.gold += c.v;
        qProg('gold', null, c.v);
      }
      beep(c.heart ? 500 : 900, 0.06, 'square', 0.03);
    }
  }
  coins = coins.filter((c) => !c.got && c.t < 2400);
}
