'use strict';
const UP = {
  glove: { name: 'Gants renforcés', base: 90, desc: '+15 % de dégâts par niveau' },
  armor: { name: 'Armure de cuir', base: 90, desc: '-7 % de dégâts reçus par niveau' },
  boots: { name: 'Bottes légères', base: 70, desc: '+0,2 de vitesse par niveau' },
  amulet: { name: "Amulette d'énergie", base: 70, desc: '+15 énergie max par niveau' },
};
const UPMAX = 5,
  SELL = { 2: 1, 3: 2, 4: 1, 5: 1, 6: 3, 10: 2 };
const upPrice = (k) => Math.round(UP[k].base * Math.pow(P.up[k] + 1, 1.45));
const pointPrice = () => 100 * (P.bought + 1),
  healPrice = () => 10 + P.lvl * 2;
let shopNpc = null;
function sellValue() {
  let v = 0;
  for (const k in SELL) v += (bag[k] || 0) * SELL[k];
  return v;
}
function openShop(n) {
  shopNpc = n;
  closePanels();
  pShop.hidden = false;
  renderShop();
}
function renderShop() {
  if (pShop.hidden) return;
  const g = Math.floor(P.gold);
  const item = (key, name, desc, label, dis) =>
    '<div class="item"><div><b>' +
    name +
    '</b><div class="mut">' +
    desc +
    '</div></div><button type="button" data-buy="' +
    key +
    '"' +
    (dis ? ' disabled' : '') +
    '>' +
    label +
    '</button></div>';
  let h =
    '<h2>' +
    esc(shopNpc ? shopNpc.name : 'Marchand') +
    '</h2><div class="mut">Boutique du village</div><h3>Or : ' +
    g +
    '</h3><h3>Soins et voyage</h3>';
  h += item(
    'heal',
    'Potion de soin',
    'PV et énergie à fond',
    healPrice() + ' or',
    g < healPrice() || (P.hp >= maxHp() && P.mp >= maxMp()),
  );
  h += item(
    'home',
    'Retour au dernier repos',
    'Téléportation vers le dernier villageois visité',
    '25 or',
    g < 25 || Math.abs(P.x - P.spawnX) < 200,
  );
  h += '<h3>Équipement</h3>';
  for (const k of ['glove', 'armor', 'boots', 'amulet']) {
    const lv = P.up[k],
      mx = lv >= UPMAX;
    h += item(
      k,
      UP[k].name + ' (' + lv + '/' + UPMAX + ')',
      UP[k].desc,
      mx ? 'Max' : upPrice(k) + ' or',
      mx || g < upPrice(k),
    );
  }
  h +=
    '<h3>Entraînement</h3>' +
    item(
      'point',
      'Point de compétence',
      'À répartir dans le menu Héros',
      pointPrice() + ' or',
      g < pointPrice(),
    );
  h +=
    '<h3>Matériaux</h3>' +
    item('stone20', '20 blocs de pierre', 'Pour bâtir et franchir les falaises', '12 or', g < 12) +
    item('plank20', '20 planches', 'Pour bâtir', '12 or', g < 12);
  h +=
    '<h3>Vente</h3>' +
    item(
      'sell',
      'Vendre le sac',
      'Terre, pierre, sable, neige, bois, planches',
      '+' + sellValue() + ' or',
      sellValue() === 0,
    );
  h += '<h3>&nbsp;</h3><button type="button" id="bShopClose">Fermer</button>';
  pShop.innerHTML = h;
}
function doBuy(k) {
  const g = P.gold;
  let ok = false;
  if (k === 'heal') {
    const p = healPrice();
    if (g >= p) {
      P.gold -= p;
      P.hp = maxHp();
      P.mp = maxMp();
      ok = true;
      toast('Soigné !', '#7bd88f');
    }
  } else if (k === 'home') {
    if (g >= 25) {
      P.gold -= 25;
      closePanels();
      P.x = P.spawnX;
      P.y = (surfAt(Math.floor(P.spawnX / TS)) - 3) * TS;
      P.vx = P.vy = 0;
      cam.x = P.x - W / 2;
      cam.y = P.y - H * 0.58;
      enemies = [];
      projs = [];
      boss = null;
      ok = true;
      toast('Téléporté au dernier repos');
    }
  } else if (UP[k]) {
    const p = upPrice(k);
    if (P.up[k] < UPMAX && g >= p) {
      P.gold -= p;
      P.up[k]++;
      if (k === 'amulet') P.mp += 15;
      ok = true;
      toast(UP[k].name + ' niveau ' + P.up[k], '#ffd23f');
    }
  } else if (k === 'point') {
    const p = pointPrice();
    if (g >= p) {
      P.gold -= p;
      P.bought++;
      P.pts++;
      ok = true;
      toast('+1 point de compétence (touche I)', '#ffd23f');
    }
  } else if (k === 'stone20' || k === 'plank20') {
    if (g >= 12) {
      P.gold -= 12;
      const id = k === 'stone20' ? 3 : 10;
      bag[id] = (bag[id] || 0) + 20;
      ok = true;
    }
  } else if (k === 'sell') {
    const v = sellValue();
    if (v > 0) {
      P.gold += v;
      for (const i in SELL) bag[i] = 0;
      ok = true;
      toast('Vendu pour ' + v + ' or', '#ffd23f');
    }
  }
  if (ok) {
    beep(700, 0.08, 'square', 0.04, 200);
    save();
  }
  renderShop();
}
pShop.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'bShopClose') {
    closePanels();
    return;
  }
  if (b.dataset.buy) doBuy(b.dataset.buy);
});
