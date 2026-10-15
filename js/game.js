'use strict';
function update() {
  S.frame++;
  G.play++;
  S.time = (S.time + 1 / 7600) % 1;
  updatePlayer();
  updateMining();
  if (pressed.has('interact')) interact();
  if (pressed.has('craft')) craft();
  if (pressed.has('shop') && nearNPC) openShop(nearNPC);
  bossCheck();
  for (const e of enemies) {
    if (e.dead) continue;
    if (e.boss) updateBoss(e);
    else updateEnemy(e);
    e.vy = Math.min(e.vy + 0.55, 14);
    if (moveX(e, e.vx)) {
      if (e.onGround && Math.abs(e.vx) > 0.3 && !e.boss) e.vy = -7.2;
      e.vx *= 0.5;
      if (e.boss && e.bs === 'charge') {
        e.bs = 'rest';
        e.st = 40;
      }
    }
    moveY(e, e.vy);
    if (e.boss) {
      e.x = clamp(e.x, e.bx - 700, e.bx + 700 - e.w);
    }
    if ((e.kind === 'slime' || e.boss) && P.state !== 'dead' && overlap(e, P))
      damagePlayer(e.boss ? e.dmg * 0.7 : e.dmg, e.x + e.w / 2, e.boss ? 7 : 5);
    if (!e.boss && Math.abs(e.x - P.x) > 1500) e.dead = true;
    if (e.boss && Math.abs(e.x - P.x) > 1300) {
      e.dead = true;
      boss = null;
    }
  }
  enemies = enemies.filter((e) => !e.dead);
  const night = Math.sin(S.time * 6.283) < -0.1;
  if (P.state !== 'dead' && S.frame % (night ? 80 : 150) === 0 && !boss) spawnEnemy();
  nearNPC = null;
  const c0 = Math.floor(P.x / (NPCW * TS));
  for (let c = c0 - 1; c <= c0 + 1; c++) {
    const n = npcFor(c);
    if (!n) continue;
    n.t++;
    if (n.sayT > 0) n.sayT--;
    n.dir = P.x > n.x ? 1 : -1;
    if (Math.abs(n.x + 12 - (P.x + 12)) < 90 && Math.abs(n.y - P.y) < 120) nearNPC = n;
  }
  for (const q of P.quests)
    if (q.type === 'walk' && q.prog < q.n && Math.abs(P.x - q.tx) < 60) {
      q.prog = 1;
      toast(
        'Borne atteinte ! Retourne voir ' +
          (npcMap.get(q.id) ? npcMap.get(q.id).name : 'le villageois'),
        '#7bd88f',
      );
    }
  updateProjectiles();
  for (const p of parts) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.life--;
  }
  parts = parts.filter((p) => p.life > 0);
  for (const p of pops) {
    p.y += p.vy;
    p.life--;
  }
  pops = pops.filter((p) => p.life > 0);
  for (const t of S.toasts) t.t--;
  if (S.banner) S.banner.t--;
  S.toasts = S.toasts.filter((t) => t.t > 0);
  S.shake *= 0.88;
  if (S.shake < 0.2) S.shake = 0;
  const tgt = BIOME_TINT[biomeAt(Math.floor((P.x + P.w / 2) / TS))];
  for (let i = 0; i < 3; i++) S.bt[i] += (tgt[i] - S.bt[i]) * 0.02;
  const tx = P.x + P.w / 2 - W / 2 + P.dir * 50,
    ty = P.y + P.h / 2 - H * 0.58;
  cam.x += (tx - cam.x) * 0.12;
  cam.y += (ty - cam.y) * 0.1;
  cam.y = clamp(cam.y, -160, ROWS * TS - H + 10);
  if (S.frame % 300 === 0) save();
  pressed.clear();
}
const BIOME_TINT = [
  [96, 150, 126],
  [58, 118, 92],
  [196, 210, 230],
  [206, 166, 112],
];
