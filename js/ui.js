'use strict';
const pStats = $('pStats'),
  pHelp = $('pHelp'),
  pShop = $('pShop'),
  pDeath = $('pDeath'),
  menu = $('menu'),
  menuBox = $('menuBox'),
  sBody = $('sBody'),
  stage = document.querySelector('.stage');
const paused = () =>
  !pStats.hidden || !pHelp.hidden || !pShop.hidden || !pDeath.hidden || !menu.hidden;
function closePanels() {
  pStats.hidden = true;
  pHelp.hidden = true;
  pShop.hidden = true;
}
function toggleStats() {
  if (S.scene !== 'game' || !menu.hidden || !pDeath.hidden) return;
  const open = pStats.hidden;
  closePanels();
  pStats.hidden = !open;
  if (open) renderStats();
}
function toggleHelp() {
  if (S.scene !== 'game' || !menu.hidden || !pDeath.hidden) return;
  const open = pHelp.hidden;
  closePanels();
  pHelp.hidden = !open;
}
const STAT_LABEL = { for: 'Force', agi: 'Agilité', vit: 'Vitalité', ene: 'Énergie' };
function renderStats() {
  if (pStats.hidden || !P) return;
  const need = xpNeed(P.lvl);
  let h =
    '<h2>' +
    esc(G.name) +
    ' · niveau ' +
    P.lvl +
    '</h2><div class="bar"><i style="width:' +
    Math.round((100 * P.xp) / need) +
    '%"></i></div><div class="mut">' +
    P.xp +
    ' / ' +
    need +
    ' xp · ' +
    DF().name +
    ' · ' +
    Math.floor(P.gold) +
    ' or</div>';
  h += '<h3>Points à répartir : ' + P.pts + '</h3>';
  for (const k of ['for', 'agi', 'vit', 'ene'])
    h +=
      '<div class="row"><span>' +
      STAT_LABEL[k] +
      '</span><b>' +
      P.st[k] +
      '</b><button type="button" data-stat="' +
      k +
      '"' +
      (P.pts > 0 ? '' : ' disabled') +
      '>+</button></div>';
  h +=
    '<h3>Effets</h3><div class="mut">PV max ' +
    maxHp() +
    ' · Énergie max ' +
    maxMp() +
    '<br>Poing ' +
    Math.round(8 * dmgMul()) +
    ' · Pied ' +
    Math.round(13 * dmgMul()) +
    ' · Boule de feu ' +
    Math.round((18 + P.st.ene * 1.6) * dmgMul()) +
    '<br>Vitesse ' +
    spd().toFixed(1) +
    ' · Critique ' +
    Math.round(8 + P.st.agi) +
    ' %<br>Équipement : gants ' +
    P.up.glove +
    ' · armure ' +
    P.up.armor +
    ' · bottes ' +
    P.up.boots +
    ' · amulette ' +
    P.up.amulet +
    '</div>';
  h += '<h3>Quêtes (' + P.quests.length + '/3)</h3>';
  if (P.quests.length) {
    h += '<ul>';
    for (const q of P.quests)
      h +=
        '<li>' +
        q.text +
        ' <span class="mut">' +
        (q.prog >= q.n ? 'prête, parle au villageois' : q.prog + '/' + q.n) +
        '</span></li>';
    h += '</ul>';
  } else h += '<div class="mut">Parle aux villageois (E).</div>';
  h +=
    '<h3>Sac</h3><div class="mut">Terre ' +
    (bag[2] || 0) +
    ' · Pierre ' +
    (bag[3] || 0) +
    ' · Sable ' +
    (bag[4] || 0) +
    ' · Neige ' +
    (bag[5] || 0) +
    ' · Bois ' +
    (bag[6] || 0) +
    ' · Planches ' +
    (bag[10] || 0) +
    '</div>';
  h +=
    '<h3>Partie</h3><button type="button" id="bClose">Fermer</button> <button type="button" id="bQuit">Sauvegarder et quitter</button>';
  sBody.innerHTML = h;
}
pStats.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.stat && P.pts > 0) {
    P.st[b.dataset.stat]++;
    P.pts--;
    if (b.dataset.stat === 'vit') P.hp += 18;
    if (b.dataset.stat === 'ene') P.mp += 10;
    beep(600, 0.06, 'square', 0.04);
    save();
    renderStats();
  } else if (b.id === 'bClose') closePanels();
  else if (b.id === 'bQuit') quitToMenu();
});
$('bStats').addEventListener('click', (e) => {
  toggleStats();
  e.currentTarget.blur();
});
$('bHelp').addEventListener('click', (e) => {
  toggleHelp();
  e.currentTarget.blur();
});
$('bFull').addEventListener('click', (e) => {
  toggleFull();
  e.currentTarget.blur();
});
$('bPause').addEventListener('click', (e) => {
  if (S.scene === 'game' && menu.hidden) showMenu('pause');
  e.currentTarget.blur();
});
$('bGo').addEventListener('click', () => {
  closePanels();
  initAudio();
});
function onEscape() {
  if (S.scene === 'menu') {
    if (menuScr !== 'main') showMenu('main');
    return;
  }
  if (S.scene !== 'game') return;
  if (!menu.hidden) {
    if (menuScr === 'pause') closeMenu();
    else showMenu('pause');
    return;
  }
  if (!pStats.hidden || !pHelp.hidden || !pShop.hidden) {
    closePanels();
    return;
  }
  showMenu('pause');
}
