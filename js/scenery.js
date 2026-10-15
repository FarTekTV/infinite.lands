'use strict';
const AMB = [];
for (let i = 0; i < 70; i++)
  AMB.push({
    x: Math.random() * W,
    y: Math.random() * H,
    s: Math.random(),
    ph: Math.random() * 6.283,
  });
function treeline(cx, cy, k) {
  const bi = biomeAt(Math.floor((cx + W / 2) / TS));
  if (bi === 3) return;
  ctx.fillStyle = rgb(S.bt, k * 0.6);
  const st = 28,
    i0 = Math.floor((cx * 0.6) / st);
  for (let i = 0; i <= Math.ceil(W / st) + 1; i++) {
    const wi = i0 + i,
      x = wi * st - cx * 0.6,
      h = 18 + rnd(wi, 70) * 30,
      base = 412 - cy * 0.3 - noise1((wi * st) / 200, 24) * 30;
    ctx.beginPath();
    ctx.moveTo(x - 11, base);
    ctx.lineTo(x + 3, base - h);
    ctx.lineTo(x + 17, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x + 1, base - 2, 4, 40);
  }
}
function deco(tx, px, py, id) {
  const r = rnd(tx, 60);
  if (id === 1) {
    if (r < 0.18) {
      ctx.fillStyle = '#6fd259';
      ctx.fillRect(px + 6, py - 5, 2, 5);
      ctx.fillRect(px + 10, py - 8, 2, 8);
      ctx.fillRect(px + 14, py - 4, 2, 4);
    } else if (r < 0.27) {
      ctx.fillStyle = '#4a9a3c';
      ctx.fillRect(px + 15, py - 8, 2, 8);
      ctx.fillStyle = r < 0.22 ? '#ff6b8a' : '#ffd23f';
      ctx.fillRect(px + 13, py - 12, 6, 5);
      ctx.fillStyle = '#fff6d0';
      ctx.fillRect(px + 15, py - 10, 2, 2);
    }
  } else if (id === 4) {
    if (r < 0.07) {
      ctx.fillStyle = '#4d9a45';
      ctx.fillRect(px + 13, py - 30, 6, 30);
      ctx.fillRect(px + 7, py - 20, 6, 4);
      ctx.fillRect(px + 7, py - 25, 4, 9);
      ctx.fillRect(px + 19, py - 17, 6, 4);
      ctx.fillRect(px + 21, py - 23, 4, 10);
      ctx.fillStyle = '#3b7d35';
      ctx.fillRect(px + 13, py - 30, 2, 30);
    }
  } else if (id === 5 && r < 0.12) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 4, py - 4, 22, 4);
    ctx.fillRect(px + 9, py - 7, 12, 3);
  }
}
function drawHut(n, light) {
  const gy = n.y + 56,
    x0 = n.x - 125,
    night = light < 0.5;
  ctx.fillStyle = '#4a3a2c';
  ctx.fillRect(x0 - 4, gy, 104, 20);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(x0, gy - 70, 96, 70);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  for (let y = gy - 62; y < gy; y += 10) ctx.fillRect(x0, y, 96, 1.5);
  ctx.fillStyle = '#7a2f2f';
  ctx.beginPath();
  ctx.moveTo(x0 - 12, gy - 70);
  ctx.lineTo(x0 + 48, gy - 112);
  ctx.lineTo(x0 + 108, gy - 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath();
  ctx.moveTo(x0 + 48, gy - 112);
  ctx.lineTo(x0 + 108, gy - 70);
  ctx.lineTo(x0 + 48, gy - 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3d2616';
  ctx.fillRect(x0 + 14, gy - 44, 22, 44);
  ctx.fillStyle = '#d6a62c';
  ctx.fillRect(x0 + 31, gy - 22, 3, 3);
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(x0 + 52, gy - 54, 26, 24);
  ctx.fillStyle = night ? '#ffd27a' : '#9fd0ff';
  ctx.fillRect(x0 + 55, gy - 51, 20, 18);
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(x0 + 64, gy - 51, 2, 18);
  ctx.fillRect(x0 + 55, gy - 43, 20, 2);
  const fx = n.x + 52,
    fy = gy,
    fl = Math.sin(S.frame * 0.3 + n.c) * 2;
  ctx.fillStyle = '#5b3b1d';
  ctx.fillRect(fx - 12, fy - 5, 24, 5);
  ctx.fillRect(fx - 8, fy - 9, 16, 4);
  ctx.fillStyle = '#ff8a2a';
  ctx.beginPath();
  ctx.moveTo(fx - 8, fy - 9);
  ctx.lineTo(fx, fy - 24 + fl);
  ctx.lineTo(fx + 8, fy - 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.moveTo(fx - 4, fy - 9);
  ctx.lineTo(fx, fy - 17 - fl);
  ctx.lineTo(fx + 4, fy - 9);
  ctx.closePath();
  ctx.fill();
  if (night) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(fx, fy - 12, 2, fx, fy - 12, 110);
    g.addColorStop(0, 'rgba(255,170,70,.55)');
    g.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(fx - 110, fy - 122, 220, 220);
    ctx.restore();
  }
}
function drawAmbient(cx, cy, light) {
  const bi = biomeAt(Math.floor((cx + W / 2) / TS)),
    f = S.frame;
  if (bi === 2) {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 60; i++) {
      const a = AMB[i],
        x = (((a.x + Math.sin(f * 0.02 + a.ph) * 22 - cx * 0.3) % W) + W) % W,
        y = (a.y + f * (0.5 + a.s * 1.1)) % H;
      ctx.fillRect(x, y, 2 + a.s * 1.5, 2 + a.s * 1.5);
    }
  } else if (bi === 3) {
    ctx.fillStyle = 'rgba(226,200,140,.38)';
    for (let i = 0; i < 40; i++) {
      const a = AMB[i],
        x = (((a.x + f * (2.2 + a.s * 2.5) - cx * 0.2) % W) + W) % W,
        y = a.y * 0.9 + Math.sin(f * 0.03 + a.ph) * 4;
      ctx.fillRect(x, y, 5 + a.s * 5, 1.5);
    }
  } else if (bi === 1) {
    for (let i = 0; i < 22; i++) {
      const a = AMB[i],
        x = (((a.x + Math.sin(f * 0.015 + a.ph) * 40 - cx * 0.25) % W) + W) % W,
        y = (a.y + f * (0.4 + a.s * 0.6)) % H;
      ctx.fillStyle = a.s < 0.5 ? 'rgba(120,200,90,.8)' : 'rgba(230,190,70,.8)';
      ctx.fillRect(x, y, 4, 3);
    }
  }
  if ((bi === 0 || bi === 1) && light < 0.55) {
    const al = (0.55 - light) / 0.55;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const a = AMB[i + 40],
        x = (((a.x + Math.sin(f * 0.01 + a.ph) * 50 - cx * 0.35) % W) + W) % W,
        y = H * 0.35 + a.y * 0.55 + Math.sin(f * 0.02 + a.ph * 2) * 14,
        p = 0.5 + 0.5 * Math.sin(f * 0.05 + a.ph * 3);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
      g.addColorStop(0, 'rgba(220,255,120,' + (al * p).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(220,255,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 9, y - 9, 18, 18);
    }
    ctx.restore();
  }
}
