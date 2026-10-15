'use strict';
let menuScr = 'main',
  newOpts = { slot: 1, diff: 'normal', name: 'Héros', seed: '' };
const SCREENS = {
  main() {
    const last = +localStorage.getItem(LASTKEY) || 0,
      ls = last ? readSlot(last) : null;
    return (
      '<h1 class="logo">Terres<br>Infinies</h1><p class="tag">Plateforme · Combat · Exploration</p>' +
      (ls
        ? '<button type="button" class="mbtn primary" data-play="' +
          last +
          '">Continuer<small>' +
          esc((ls.meta && ls.meta.name) || 'Héros') +
          ' · niveau ' +
          ls.P.lvl +
          '</small></button>'
        : '') +
      '<button type="button" class="mbtn' +
      (ls ? '' : ' primary') +
      '" data-go="slots">' +
      (ls ? 'Parties' : 'Jouer') +
      '<small>3 emplacements de sauvegarde</small></button>' +
      '<button type="button" class="mbtn" data-go="options">Options</button>' +
      '<button type="button" class="mbtn" data-act="full">Plein écran<small>Touche F</small></button>' +
      '<p class="mut ver">ZQSD / flèches · J K L · E parler · B boutique · I héros</p>'
    );
  },
  slots() {
    let h = '<h2 class="mh">Parties</h2>';
    for (let i = 1; i <= 3; i++) {
      const o = readSlot(i);
      if (!o) {
        h +=
          '<button type="button" class="mbtn" data-new="' +
          i +
          '">Emplacement ' +
          i +
          '<small>Vide · créer une nouvelle partie</small></button>';
        continue;
      }
      const m = o.meta || {},
        d = DIFFS[m.diff] || DIFFS.normal;
      h +=
        '<div class="slot"><div class="sinfo"><div><b>' +
        esc(m.name || 'Héros') +
        '</b><span class="badge d-' +
        d.key +
        '">' +
        d.name +
        '</span></div><div class="mut">Niveau ' +
        o.P.lvl +
        ' · ' +
        Math.floor(o.P.gold) +
        ' or · ' +
        (m.dist || 0) +
        ' m · ' +
        (m.bosses || 0) +
        ' boss · ' +
        fmtTime(m.play || 0) +
        '</div><div class="mut">' +
        (m.saved ? fmtDate(m.saved) : '') +
        '</div></div>' +
        '<div class="sact"><button type="button" data-play="' +
        i +
        '">Jouer</button><button type="button" data-del="' +
        i +
        '">Supprimer</button></div></div>';
    }
    return h + '<button type="button" class="mbtn" data-go="main">Retour</button>';
  },
  new() {
    const s = newOpts;
    let h =
      '<h2 class="mh">Nouvelle partie · emplacement ' +
      s.slot +
      '</h2><label class="fld">Nom du héros<input id="inName" type="text" maxlength="16" value="' +
      esc(s.name) +
      '" autocomplete="off"></label><div class="fld">Difficulté</div><div class="diffs">';
    for (const k of ['easy', 'normal', 'hard', 'hardcore']) {
      const d = DIFFS[k];
      h +=
        '<button type="button" class="dc d-' +
        k +
        (s.diff === k ? ' on' : '') +
        '" data-diff="' +
        k +
        '"><b>' +
        d.name +
        '</b><small>' +
        d.desc +
        '</small></button>';
    }
    return (
      h +
      '</div><label class="fld">Graine du monde (optionnel)<input id="inSeed" type="text" maxlength="9" inputmode="numeric" placeholder="aléatoire" value="' +
      esc(s.seed) +
      '" autocomplete="off"></label><button type="button" class="mbtn primary" data-start="1">Commencer l\'aventure</button><button type="button" class="mbtn" data-go="slots">Retour</button>'
    );
  },
  options() {
    return (
      '<h2 class="mh">Options</h2>' +
      '<button type="button" class="mbtn" data-opt="sound">Son<small>' +
      (SET.sound ? 'Activé' : 'Coupé') +
      '</small></button>' +
      '<label class="fld">Volume<input id="inVol" type="range" min="0" max="100" value="' +
      Math.round(SET.vol * 100) +
      '"></label>' +
      '<button type="button" class="mbtn" data-opt="shake">Tremblements d\'écran<small>' +
      (SET.shake ? 'Activés' : 'Désactivés') +
      '</small></button>' +
      '<button type="button" class="mbtn" data-opt="dmgnums">Nombres de dégâts<small>' +
      (SET.dmgnums ? 'Affichés' : 'Masqués') +
      '</small></button>' +
      '<button type="button" class="mbtn" data-act="full">Plein écran<small>Touche F</small></button>' +
      '<button type="button" class="mbtn" data-go="' +
      (S.scene === 'game' ? 'pause' : 'main') +
      '">Retour</button>'
    );
  },
  pause() {
    return (
      '<h2 class="mh">Pause</h2><p class="mut">' +
      esc(G.name) +
      ' · ' +
      DF().name +
      ' · ' +
      Math.floor(P.gold) +
      ' or</p>' +
      '<button type="button" class="mbtn primary" data-act="resume">Reprendre</button>' +
      '<button type="button" class="mbtn" data-act="stats">Héros et quêtes<small>Touche I</small></button>' +
      '<button type="button" class="mbtn" data-go="options">Options</button>' +
      '<button type="button" class="mbtn" data-act="full">Plein écran</button>' +
      '<button type="button" class="mbtn" data-act="quit">Sauvegarder et quitter</button>'
    );
  },
};
function showMenu(scr) {
  menuScr = scr;
  menu.hidden = false;
  menu.className = 'menu' + (scr === 'pause' ? ' dim' : '');
  menuBox.innerHTML = SCREENS[scr]();
}
function closeMenu() {
  menu.hidden = true;
  held.clear();
  pressed.clear();
}
menu.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  initAudio();
  const d = b.dataset;
  if (d.go) showMenu(d.go);
  else if (d.play) startGame(+d.play);
  else if (d.new) {
    newOpts = { slot: +d.new, diff: 'normal', name: 'Héros', seed: '' };
    showMenu('new');
  } else if (d.del) {
    if (d.sure) {
      try {
        localStorage.removeItem(slotKey(d.del));
      } catch (err) {}
      showMenu('slots');
    } else {
      d.sure = '1';
      b.textContent = 'Confirmer la suppression';
    }
  } else if (d.diff) {
    newOpts.diff = d.diff;
    menu.querySelectorAll('.dc').forEach((x) => x.classList.toggle('on', x === b));
  } else if (d.start) {
    const nm = ($('inName').value || '').trim().slice(0, 16) || 'Héros',
      sd = parseInt($('inSeed').value, 10);
    startGame(newOpts.slot, { name: nm, diff: newOpts.diff, seed: sd > 0 ? sd : 0 });
  } else if (d.opt) {
    SET[d.opt] = !SET[d.opt];
    saveSettings();
    showMenu('options');
  } else if (d.act === 'full') toggleFull();
  else if (d.act === 'resume') closeMenu();
  else if (d.act === 'stats') {
    closeMenu();
    toggleStats();
  } else if (d.act === 'quit') quitToMenu();
  beep(500, 0.05, 'square', 0.03);
});
menu.addEventListener('input', (e) => {
  if (e.target.id === 'inVol') {
    SET.vol = e.target.value / 100;
    saveSettings();
  }
});
