'use strict';
const LOOK = {
  hero: {
    skin: '#f2c79a',
    gi: '#f4f1ea',
    belt: '#2b2b33',
    band: '#e53935',
    hair: '#2a1c14',
    glove: '#e53935',
    foot: '#2b2b33',
    scale: 1,
  },
  villager: {
    skin: '#f2c79a',
    gi: '#3d6fb5',
    belt: '#7a4b24',
    hair: '#6b3b1d',
    glove: '#f2c79a',
    foot: '#4a3322',
    hat: '#c58b34',
    scale: 0.96,
  },
  goblin: {
    skin: '#6fb34a',
    gi: '#6b4b2d',
    belt: '#3a2a18',
    hair: null,
    glove: '#6fb34a',
    foot: '#3a2a18',
    ears: 1,
    scale: 0.9,
  },
  archer: {
    skin: '#e8e2cf',
    gi: '#cfc8b0',
    belt: '#8a8470',
    hair: null,
    glove: '#e8e2cf',
    foot: '#8a8470',
    skull: 1,
    scale: 0.95,
  },
  bossGob: {
    skin: '#4f9a3a',
    gi: '#8a2f2f',
    belt: '#d6a62c',
    hair: null,
    glove: '#d6a62c',
    foot: '#2a1a10',
    ears: 1,
    scale: 1.5,
  },
  golem: {
    skin: '#8a8f9c',
    gi: '#6a6f7c',
    belt: '#4a4e59',
    hair: null,
    glove: '#5b606c',
    foot: '#4a4e59',
    scale: 1.9,
    thick: 1.35,
  },
  spectre: {
    skin: '#b9f0ff',
    gi: '#2b2e5a',
    belt: '#7b6cff',
    hair: null,
    glove: '#b9f0ff',
    foot: '#1a1c3a',
    hood: 1,
    scale: 1.3,
  },
};
function ext(p) {
  return p < 0.3 ? p / 0.3 : p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.45);
}
function getPose(f) {
  const t = f.t,
    a = f.anim,
    o = {
      lean: 0.08,
      bob: 0,
      crouch: 0,
      lf: [0.35, 0.1],
      lb: [-0.35, -0.15],
      af: [1.2, 2.6],
      ab: [0.9, 2.5],
    };
  let e;
  if (a === 'idle') {
    o.bob = Math.sin(t * 0.1);
    o.af = [1.2, 2.6 + Math.sin(t * 0.1) * 0.12];
  } else if (a === 'npc') {
    o.lean = 0.02;
    o.af = [0.25, 0.3];
    o.ab = [-0.2, 0.1];
    o.lf = [0.15, 0.1];
    o.lb = [-0.15, -0.1];
    o.bob = Math.sin(t * 0.06) * 0.8;
  } else if (a === 'run') {
    const s = Math.sin(t * 0.33);
    o.lean = 0.26;
    o.lf = [s * 0.95, s * 0.95 - 0.55];
    o.lb = [-s * 0.95, -s * 0.95 - 0.55];
    o.af = [-s * 0.9 + 0.4, -s * 0.9 + 1.6];
    o.ab = [s * 0.9 + 0.4, s * 0.9 + 1.6];
    o.bob = -Math.abs(Math.cos(t * 0.33)) * 2;
  } else if (a === 'jump') {
    o.lf = [0.9, -0.1];
    o.lb = [-0.1, -0.9];
    o.af = [1.9, 2.8];
    o.ab = [1.3, 2.5];
    o.lean = 0.05;
  } else if (a === 'fall') {
    o.lf = [0.5, 0.2];
    o.lb = [-0.5, -0.1];
    o.af = [2.4, 2.9];
    o.ab = [2, 2.6];
  } else if (a === 'punch') {
    e = ext(f.p);
    o.af = [lerp(1.2, 1.57, e), lerp(2.6, 1.57, e)];
    o.lean = 0.08 + 0.3 * e;
    o.lf = [0.8, 0.35];
    o.lb = [-0.55, -0.45];
    o.crouch = 2;
  } else if (a === 'kick') {
    e = ext(f.p);
    o.lf = [lerp(0.35, 1.45, e), lerp(0.1, 1.5, e)];
    o.lean = -0.3 * e;
    o.lb = [-0.12, -0.08];
    o.af = [0.6, 2.4];
    o.ab = [0.3, 2.2];
  } else if (a === 'special') {
    e = ext(f.p);
    o.af = [lerp(1.2, 1.57, e), lerp(2.6, 1.57, e)];
    o.ab = [lerp(0.9, 1.5, e), lerp(2.5, 1.6, e)];
    o.crouch = 4;
    o.lf = [0.8, 0.4];
    o.lb = [-0.7, -0.5];
    o.lean = 0.1 + 0.15 * e;
  } else if (a === 'block') {
    o.af = [2.1, 3.1];
    o.ab = [1.9, 3];
    o.crouch = 3;
    o.lean = 0.2;
    o.lf = [0.6, 0.3];
    o.lb = [-0.5, -0.3];
  } else if (a === 'hurt') {
    o.lean = -0.35;
    o.af = [0.3, 0];
    o.ab = [-0.4, -0.7];
    o.lf = [0.3, 0.2];
    o.lb = [-0.4, -0.2];
  } else if (a === 'dash') {
    o.lean = 0.5;
    o.lf = [1.1, 0.3];
    o.lb = [-1, -1.3];
    o.af = [-0.9, -1];
    o.ab = [-0.8, -1];
  }
  return o;
}
function drawFighter(g, f, L, flash) {
  const s = L.scale || 1,
    po = getPose(f),
    th = L.thick || 1;
  const C = (k) => (flash ? '#fff' : L[k]);
  g.save();
  g.translate(Math.round(f.x + f.w / 2), Math.round(f.y + f.h));
  g.scale(f.dir * s, s);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.beginPath();
  g.ellipse(0, 0, 14, 3.5, 0, 0, 6.283);
  g.fill();
  const hip = [0, -27 + po.crouch + po.bob],
    sl = Math.sin(po.lean),
    cl = Math.cos(po.lean);
  const neck = [hip[0] + sl * 19, hip[1] - cl * 19],
    sh = [hip[0] + sl * 16, hip[1] - cl * 16],
    head = [neck[0] + sl * 7, neck[1] - cl * 7 - 1];
  const limb = (o, a, l1, l2) => {
    const k = [o[0] + Math.sin(a[0]) * l1, o[1] + Math.cos(a[0]) * l1];
    return [k, [k[0] + Math.sin(a[1]) * l2, k[1] + Math.cos(a[1]) * l2]];
  };
  const seg = (a, b, w, c) => {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
    g.stroke();
  };
  const lb = limb(hip, po.lb, 14, 13),
    lf = limb(hip, po.lf, 14, 13),
    ab = limb(sh, po.ab, 10, 10),
    af = limb(sh, po.af, 10, 10);
  const leg = (l) => {
    seg(hip, l[0], 8 * th, C('gi'));
    seg(l[0], l[1], 7 * th, C('gi'));
    seg(l[1], [l[1][0] + 5, l[1][1]], 6 * th, C('foot'));
  };
  const arm = (a) => {
    seg(sh, a[0], 5.5 * th, C('skin'));
    seg(a[0], a[1], 5 * th, C('skin'));
    g.fillStyle = C('glove');
    g.beginPath();
    g.arc(a[1][0], a[1][1], 4.4 * th, 0, 6.283);
    g.fill();
  };
  leg(lb);
  arm(ab);
  seg(hip, neck, 15 * th, C('gi'));
  seg(hip, [hip[0] + sl * 3, hip[1] - cl * 3], 16 * th, C('belt'));
  g.fillStyle = C('skin');
  g.beginPath();
  g.arc(head[0], head[1], 8 * th, 0, 6.283);
  g.fill();
  if (L.hair && !flash) {
    g.fillStyle = L.hair;
    g.beginPath();
    g.arc(head[0], head[1], 8.4 * th, 3.4, 6.1);
    g.fill();
  }
  if (L.band) {
    seg([head[0] - 8, head[1] - 2], [head[0] + 8, head[1] - 2], 3, C('band'));
    seg(
      [head[0] - 8, head[1] - 2],
      [head[0] - 15, head[1] + 3 + Math.sin(f.t * 0.2) * 2],
      2.5,
      C('band'),
    );
  }
  if (L.ears) {
    g.fillStyle = C('skin');
    g.beginPath();
    g.moveTo(head[0] - 7, head[1] - 1);
    g.lineTo(head[0] - 15, head[1] - 6);
    g.lineTo(head[0] - 6, head[1] - 5);
    g.fill();
  }
  if (L.hat) {
    g.fillStyle = C('hat');
    g.fillRect(head[0] - 10, head[1] - 8, 20, 3);
    g.fillRect(head[0] - 6, head[1] - 14, 12, 7);
  }
  if (L.hood) {
    g.fillStyle = flash ? '#fff' : '#1d2048';
    g.beginPath();
    g.arc(head[0], head[1], 9.5 * th, 2.9, 6.5);
    g.lineTo(head[0] - 9, head[1] + 9);
    g.fill();
  }
  g.fillStyle = flash ? '#bbb' : L.skull || L.hood ? '#10131a' : '#1a1a22';
  if (L.skull) {
    g.fillRect(head[0] + 1, head[1] - 3, 3, 3);
    g.fillRect(head[0] - 4, head[1] - 3, 3, 3);
  } else {
    g.fillRect(head[0] + 3, head[1] - 2, 2.4, 3);
  }
  leg(lf);
  arm(af);
  g.restore();
}
