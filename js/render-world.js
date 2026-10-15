'use strict';
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, k) =>
  'rgb(' +
  Math.round(c[0] * (k || 1)) +
  ',' +
  Math.round(c[1] * (k || 1)) +
  ',' +
  Math.round(c[2] * (k || 1)) +
  ')';
const STARS = [];
for (let i = 0; i < 70; i++)
  STARS.push([Math.random() * W, Math.random() * H * 0.6, Math.random() * 6]);
const CLOUDS = [];
for (let i = 0; i < 8; i++)
  CLOUDS.push({ x: Math.random() * 1400, y: 30 + Math.random() * 150, w: 60 + Math.random() * 80 });
const SHADE = [];
for (let i = 0; i <= 14; i++) SHADE.push('rgba(8,6,16,' + (i * 0.05).toFixed(2) + ')');
function T(s, x, y, size, col, align, font) {
  ctx.font = (font || '700') + ' ' + size + 'px "Chakra Petch",system-ui,sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0,0,0,.7)';
  ctx.fillText(s, x + 1.5, y + 1.5);
  ctx.fillStyle = col || '#ece7d9';
  ctx.fillText(s, x, y);
}
function TD(s, x, y, size, col, align) {
  ctx.font = '400 ' + size + 'px Bungee,Impact,sans-serif';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0,0,0,.75)';
  ctx.fillText(s, x + 3, y + 3);
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
}
function hills(cx, cy, layer, par, base, amp, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let px = 0; px <= W; px += 8) {
    const wx = (cx * par + px) / scale;
    ctx.lineTo(px, base - cy * par * 0.5 - noise1(wx, 20 + layer) * amp);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}
function drawSlime(g, e, col, big) {
  const sq = clamp(e.vy * 0.02, -0.25, 0.25),
    pul = e.onGround ? Math.sin(e.t * 0.15) : 0;
  const bw = (e.w / 2) * (1 + (e.onGround ? 0.08 * pul : -sq)),
    bh = e.h * (1 + (e.onGround ? -0.05 * pul : sq));
  g.save();
  g.translate(e.x + e.w / 2, e.y + e.h);
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.beginPath();
  g.ellipse(0, 0, bw, 4, 0, 0, 6.283);
  g.fill();
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(-bw, 0);
  g.bezierCurveTo(-bw, -bh * 1.3, bw, -bh * 1.3, bw, 0);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)';
  g.beginPath();
  g.ellipse(-bw * 0.35, -bh * 0.7, bw * 0.22, bh * 0.12, -0.5, 0, 6.283);
  g.fill();
  g.fillStyle = '#10131a';
  const er = big ? 7 : 3.2;
  g.beginPath();
  g.arc(e.dir * bw * 0.25 - bw * 0.25, -bh * 0.45, er, 0, 6.283);
  g.arc(e.dir * bw * 0.25 + bw * 0.25, -bh * 0.45, er, 0, 6.283);
  g.fill();
  if (big) {
    g.fillStyle = '#ffd23f';
    g.beginPath();
    g.moveTo(-bw * 0.4, -bh * 0.95);
    g.lineTo(-bw * 0.4, -bh * 1.25);
    g.lineTo(-bw * 0.2, -bh * 1.05);
    g.lineTo(0, -bh * 1.3);
    g.lineTo(bw * 0.2, -bh * 1.05);
    g.lineTo(bw * 0.4, -bh * 1.25);
    g.lineTo(bw * 0.4, -bh * 0.95);
    g.closePath();
    g.fill();
  }
  g.restore();
}
function drawWorld(cx, cy) {
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const sunH = Math.sin(S.time * 6.283),
    light = clamp(sunH * 1.8 + 0.45, 0, 1);
  let sky = mixc([10, 14, 36], [118, 196, 255], light);
  sky = mixc(sky, [255, 150, 90], clamp(1 - Math.abs(sunH) * 4, 0, 1) * 0.55);
  const gr = ctx.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, rgb(sky, 0.8));
  gr.addColorStop(1, rgb(mixc(sky, [255, 255, 255], 0.25)));
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, W, H);
  const a = S.time * 6.283;
  for (const s of STARS) {
    const al = Math.pow(1 - light, 1.5) * (0.5 + 0.5 * Math.sin(S.frame * 0.03 + s[2]));
    if (al > 0.02) {
      ctx.fillStyle = 'rgba(255,255,255,' + al.toFixed(2) + ')';
      ctx.fillRect(s[0], s[1], 2, 2);
    }
  }
  const sx = W / 2 - Math.cos(a) * W * 0.48,
    sy = H * 0.78 - Math.sin(a) * H * 0.7;
  if (sy < H * 0.9) {
    ctx.fillStyle = '#ffe28a';
    ctx.beginPath();
    ctx.arc(sx, sy, 24, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,226,138,.2)';
    ctx.beginPath();
    ctx.arc(sx, sy, 40, 0, 6.283);
    ctx.fill();
  }
  const mx = W - sx,
    my = H * 0.78 + Math.sin(a) * H * 0.7;
  if (my < H * 0.9) {
    ctx.fillStyle = '#e8ecff';
    ctx.beginPath();
    ctx.arc(mx, my, 18, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = rgb(sky, 0.8);
    ctx.beginPath();
    ctx.arc(mx + 7, my - 4, 16, 0, 6.283);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,' + (0.14 + 0.45 * light).toFixed(2) + ')';
  for (const c of CLOUDS) {
    const x = ((((c.x - cx * 0.15 + S.frame * 0.1) % (W + 400)) + W + 400) % (W + 400)) - 200;
    ctx.beginPath();
    ctx.ellipse(x + c.w * 0.5, c.y + 9, c.w * 0.5, 9, 0, 0, 6.283);
    ctx.ellipse(x + c.w * 0.34, c.y + 3, c.w * 0.22, 11, 0, 0, 6.283);
    ctx.ellipse(x + c.w * 0.64, c.y + 1, c.w * 0.2, 13, 0, 0, 6.283);
    ctx.fill();
  }
  const k = 0.35 + 0.65 * light;
  hills(cx, cy, 0, 0.1, 260, 140, 230, rgb(S.bt, k * 0.5));
  hills(cx, cy, 1, 0.2, 300, 110, 150, rgb(S.bt, k * 0.7));
  hills(cx, cy, 2, 0.4, 360, 90, 90, rgb(S.bt, k * 0.9));
  treeline(cx, cy, k);
  ctx.save();
  ctx.translate(-cx, -cy);
  const tx0 = Math.floor(cx / TS),
    tx1 = tx0 + Math.ceil(W / TS) + 1,
    ty0 = Math.max(0, Math.floor(cy / TS)),
    ty1 = Math.min(ROWS - 1, ty0 + Math.ceil(H / TS) + 1);
  for (let tx = tx0; tx <= tx1; tx++) {
    const c = col(tx);
    for (let ty = ty0; ty <= ty1; ty++) {
      const id = getB(tx, ty),
        px = tx * TS,
        py = ty * TS;
      if (id) {
        ctx.drawImage(TILES[id], px, py);
        if (ty === c.s && (id === 1 || id === 4 || id === 5) && getB(tx, ty - 1) === 0)
          deco(tx, px, py, id);
        if (id !== 7 && ty > c.s + 2) {
          ctx.fillStyle = SHADE[Math.min(14, Math.floor((ty - c.s - 2) * 1.4))];
          ctx.fillRect(px, py, TS, TS);
        }
      } else if (ty > c.s + 1) {
        ctx.fillStyle = '#1c1626';
        ctx.fillRect(px, py, TS, TS);
      }
    }
  }
  for (const q of P.quests) {
    if (q.type === 'walk' && q.prog < q.n && Math.abs(q.tx - cx) < W + 100) {
      const gx = q.tx,
        gy = surfAt(Math.floor(gx / TS)) * TS;
      ctx.fillStyle = '#ece7d9';
      ctx.fillRect(gx - 2, gy - 70, 4, 70);
      ctx.fillStyle = '#ffb02e';
      ctx.beginPath();
      ctx.moveTo(gx + 2, gy - 70);
      ctx.lineTo(gx + 34, gy - 60 + Math.sin(S.frame * 0.1) * 3);
      ctx.lineTo(gx + 2, gy - 48);
      ctx.fill();
    }
  }
  for (const n of npcMap.values()) {
    if (!n || Math.abs(n.x - cx - W / 2) > W) continue;
    drawHut(n, light);
    drawFighter(ctx, n, LOOK.villager, false);
    const q = P.quests.find((x) => x.id === n.c),
      mk = q ? (q.prog >= q.n ? '?' : '…') : done.has(n.c) ? '' : '!';
    T(n.name, n.x + 12, n.y - 22, 12, '#ece7d9', 'center');
    if (mk)
      T(mk, n.x + 12, n.y - 36, mk === '…' ? 16 : 22, mk === '?' ? '#7bd88f' : '#ffb02e', 'center');
    if (n === nearNPC && !n.sayT)
      T('[E] Parler · [B] Boutique', n.x + 12, n.y - 50, 12, '#ffb02e', 'center');
    if (n.sayT > 0) {
      ctx.font = '600 13px "Chakra Petch",system-ui,sans-serif';
      const w = Math.min(300, ctx.measureText(n.say).width + 16);
      ctx.fillStyle = 'rgba(16,18,26,.92)';
      ctx.fillRect(n.x + 12 - w / 2, n.y - 72, w, 24);
      ctx.strokeStyle = '#ffb02e';
      ctx.strokeRect(n.x + 12 - w / 2, n.y - 72, w, 24);
      T(n.say, n.x + 12, n.y - 55, 13, '#ece7d9', 'center', '600');
    }
  }
  for (const e of enemies) {
    if (e.dead) continue;
    const fl = e.hurt > 0 && (e.hurt >> 1) % 2 === 1;
    const tele = e.boss && e.bs === 'tele' && (S.frame >> 2) % 2 === 0;
    if (e.kind === 'slime') drawSlime(ctx, e, fl || tele ? '#fff' : slimeCol(e), e.boss);
    else drawFighter(ctx, e, LOOK[e.boss ? e.def.look : ET[e.kind].look], fl || tele);
    if (!e.boss && e.hp < e.max) {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(e.x - 2, e.y - 10, e.w + 4, 6);
      ctx.fillStyle = '#e5484d';
      ctx.fillRect(e.x, e.y - 9, (e.w * e.hp) / e.max, 4);
    }
    if (!e.boss && e.lv > 1) T('Niv.' + e.lv, e.x + e.w / 2, e.y - 14, 10, '#ffb02e', 'center');
  }
  for (const c of coins) {
    if (c.heart) {
      ctx.fillStyle = '#ff5d6a';
      ctx.beginPath();
      ctx.arc(c.x + 3, c.y + 4, 4, 0, 6.283);
      ctx.arc(c.x + 9, c.y + 4, 4, 0, 6.283);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(c.x - 1, c.y + 6);
      ctx.lineTo(c.x + 6, c.y + 14);
      ctx.lineTo(c.x + 13, c.y + 6);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(c.x + 1, c.y, 8, 10);
      ctx.fillStyle = '#fff2a6';
      ctx.fillRect(c.x + 3, c.y + 2, 2, 6);
    }
  }
  for (const q of projs) {
    if (q.kind === 'wave') {
      ctx.fillStyle = 'rgba(207,200,176,.85)';
      ctx.fillRect(q.x - q.w / 2, q.y, q.w, q.h);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.fillRect(q.x - q.w / 2 + 4, q.y + 4, q.w - 8, 8);
    } else if (q.kind === 'arrow') {
      ctx.strokeStyle = '#d9c9a0';
      ctx.lineWidth = 2;
      const an = Math.atan2(q.vy, q.vx);
      ctx.beginPath();
      ctx.moveTo(q.x - Math.cos(an) * 14, q.y - Math.sin(an) * 14);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(q.x - 2, q.y - 2, 4, 4);
    } else {
      ctx.fillStyle = q.kind === 'orb' ? '#b9f0ff' : '#8a8f9c';
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.r, 0, 6.283);
      ctx.fill();
      if (q.kind === 'orb') {
        ctx.fillStyle = 'rgba(185,240,255,.3)';
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r + 4, 0, 6.283);
        ctx.fill();
      }
    }
  }
  if (!(P.iv > 0 && (S.frame >> 2) % 2 === 0 && P.state !== 'dead')) {
    drawFighter(ctx, P, LOOK.hero, P.hurt > 0 && (P.hurt >> 1) % 2 === 1);
  }
  if (P.atk && P.atk.type !== 'special' && P.atk.t >= P.atk.hit && P.atk.t < P.atk.hit + 5) {
    ctx.save();
    ctx.translate(P.x + P.w / 2, P.y + P.atk.oy + 13);
    ctx.scale(P.dir, 1);
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-6, 0, P.atk.range * 0.8, -0.8, 0.8);
    ctx.stroke();
    ctx.restore();
  }
  for (const b of balls) {
    const g = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 16);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.35, '#ffc14a');
    g.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 16, 0, 6.283);
    ctx.fill();
  }
  for (const p of parts) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.col;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  for (const p of pops) T(p.txt, p.x, p.y, p.size, p.col, 'center');
  if (mouse.inside && mouse.down !== -2) {
    const tx = Math.floor((mouse.x + cx) / TS),
      ty = Math.floor((mouse.y + cy) / TS),
      id = getB(tx, ty),
      ok = inReach(tx, ty);
    ctx.strokeStyle = ok ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx * TS + 1, ty * TS + 1, TS - 2, TS - 2);
    if (id && mine.p > 0 && mine.tx === tx && mine.ty === ty) {
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.fillRect(tx * TS, ty * TS + TS - 5, TS * clamp(mine.p / (HARD[id] || 1), 0, 1), 5);
    }
  }
  ctx.restore();
  const dark = (1 - light) * 0.58;
  if (dark > 0.01) {
    const ppx = P.x + 12 - cx,
      ppy = P.y + 30 - cy,
      g = ctx.createRadialGradient(ppx, ppy, 30, ppx, ppy, 360);
    g.addColorStop(0, 'rgba(5,8,30,' + (dark * 0.3).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(5,8,30,' + dark.toFixed(2) + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  drawAmbient(cx, cy, light);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.98);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}
