'use strict';
function barHud(x, y, w, h, v, max, color) {
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(v / max, 0, 1), h);
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.fillRect(x, y, w * clamp(v / max, 0, 1), Math.ceil(h / 3));
}
function drawHud() {
  ctx.fillStyle = 'rgba(16,18,26,.78)';
  ctx.fillRect(8, 8, 236, 76);
  ctx.strokeStyle = '#2f3550';
  ctx.lineWidth = 1;
  ctx.strokeRect(8.5, 8.5, 236, 76);
  T('NIV ' + P.lvl, 16, 26, 15, '#ffb02e');
  T(Math.floor(P.gold) + ' or', 236, 26, 14, '#ffd23f', 'right');
  barHud(16, 32, 220, 14, P.hp, maxHp(), '#e5484d');
  T(Math.ceil(P.hp) + ' / ' + maxHp(), 126, 44, 11, '#fff', 'center');
  barHud(16, 54, 220, 10, P.mp, maxMp(), '#4c8dff');
  barHud(16, 72, 220, 5, P.xp, xpNeed(P.lvl), '#7bd88f');
  if (P.pts > 0) T('+' + P.pts + ' points (I)', 252, 26, 13, '#ffd23f');
  const m = Math.round(P.x / TS),
    sunH = Math.sin(S.time * 6.283);
  T(
    (m < 0 ? '◄ ' : '') + Math.abs(m) + ' m' + (m > 0 ? ' ►' : ''),
    W - 12,
    26,
    16,
    '#ece7d9',
    'right',
  );
  T(
    BIOME_NAME[biomeAt(Math.floor(P.x / TS))] + ' · ' + (sunH > -0.1 ? 'Jour' : 'Nuit'),
    W - 12,
    44,
    12,
    '#9aa0b8',
    'right',
    '600',
  );
  let qy = 66;
  for (const q of P.quests) {
    const ready = q.prog >= q.n;
    let s =
      q.text +
      (q.type === 'walk'
        ? ' (' + Math.round(Math.abs(q.tx - P.x) / TS) + ' m)'
        : ' ' + q.prog + '/' + q.n);
    if (ready) s = '✔ ' + q.text;
    T(s, W - 12, qy, 12, ready ? '#7bd88f' : '#ece7d9', 'right', '600');
    qy += 16;
  }
  const kb = Math.round(GAPT * Math.max(1, Math.round(Math.abs(P.x) / GAP + 0.49))),
    nb = P.x < 0 ? -kb : kb;
  if (!boss)
    T(
      'Prochain boss : ' + Math.abs(Math.round(nb - m)) + ' m',
      W - 12,
      H - 10,
      11,
      '#9aa0b8',
      'right',
      '600',
    );
  if (boss && !boss.dead) {
    const bw = 380,
      bx = W / 2 - bw / 2;
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(bx - 3, 10, bw + 6, 22);
    ctx.fillStyle = '#8a2f2f';
    ctx.fillRect(bx, 13, bw, 16);
    ctx.fillStyle = '#ff6a4a';
    ctx.fillRect(bx, 13, bw * clamp(boss.hp / boss.max, 0, 1), 16);
    T(boss.name, W / 2, 26, 13, '#fff', 'center');
  }
  const x0 = (W - 6 * 48) / 2,
    y0 = H - 56;
  for (let i = 0; i < 6; i++) {
    const x = x0 + i * 48,
      id = HB[i];
    ctx.fillStyle = 'rgba(16,18,26,.85)';
    ctx.fillRect(x, y0, 44, 44);
    ctx.strokeStyle = i === sel ? '#ffb02e' : '#2f3550';
    ctx.lineWidth = i === sel ? 3 : 1;
    ctx.strokeRect(x + 0.5, y0 + 0.5, 43, 43);
    ctx.globalAlpha = (bag[id] || 0) > 0 ? 1 : 0.35;
    ctx.drawImage(TILES[id], x + 8, y0 + 8, 28, 28);
    ctx.globalAlpha = 1;
    T(String(i + 1), x + 4, y0 + 12, 10, '#9aa0b8');
    if (bag[id]) T(String(bag[id]), x + 40, y0 + 40, 12, '#fff', 'right');
  }
  if (P.combo > 1 && P.comboT > 0)
    TD('x' + P.combo + ' COMBO', W - 170, H - 90, 30, '#ffb02e', 'center');
  let ty = 64;
  for (const t of S.toasts) {
    ctx.globalAlpha = Math.min(1, t.t / 30);
    T(t.txt, W / 2, ty + (boss ? 30 : 0), 14, t.col, 'center');
    ctx.globalAlpha = 1;
    ty += 20;
  }
  if (S.banner && S.banner.t > 0) {
    const b = S.banner;
    ctx.globalAlpha = Math.min(1, b.t / 30);
    const by = H * 0.3 - (b.t > 140 ? (b.t - 140) * 1.2 : 0);
    TD(b.txt, W / 2, by, 44, b.col || '#ffd23f', 'center');
    T(b.sub, W / 2, by + 28, 16, '#ece7d9', 'center');
    ctx.globalAlpha = 1;
  }
  if (P.state === 'dead') {
    ctx.fillStyle = 'rgba(120,0,0,.35)';
    ctx.fillRect(0, 0, W, H);
    TD('K.O.', W / 2, H / 2 + 20, 72, '#fff', 'center');
  }
}
