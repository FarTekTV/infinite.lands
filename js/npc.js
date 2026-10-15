'use strict';
const NAMES = ['Aldric', 'Mirelle', 'Bastien', 'Odile', 'Tanguy', 'Maëlle', 'Gaspard', 'Isaure'];
const LINES = [
  'Un boss garde chaque borne, tous les 75 mètres.',
  "La nuit, les gobelins sortent en nombre. Reste près d'un abri.",
  'Mine de la pierre, empile des blocs : on bâtit vite par ici.',
  'Monte en niveau : force, agilité, vitalité, énergie.',
];
function npcFor(c) {
  if (npcMap.has(c)) return npcMap.get(c);
  let n = null;
  if (c === 0 || rnd(c, 41) < 0.8) {
    const tx =
      c === 0 ? 6 + Math.floor(rnd(0, 40) * 6) : c * NPCW + 4 + Math.floor(rnd(c, 40) * (NPCW - 8));
    n = {
      c,
      name: NAMES[Math.abs(c * 3 + Math.floor(rnd(c, 42) * 8)) % 8],
      x: tx * TS,
      y: surfAt(tx) * TS - 56,
      w: 24,
      h: 56,
      dir: 1,
      t: Math.floor(rand() * 100),
      anim: 'npc',
      p: 0,
      say: '',
      sayT: 0,
    };
  }
  npcMap.set(c, n);
  return n;
}
function questFor(c, n) {
  const lv = 1 + Math.floor(Math.abs(n.x) / 1800),
    r = c === 0 ? 0 : rnd(c, 50),
    k = Math.floor(rnd(c, 51) * 4);
  let q;
  if (r < 0.25) q = { type: 'kill', mob: 'slime', n: 3 + k + lv, text: '' };
  else if (r < 0.45) q = { type: 'kill', mob: 'goblin', n: 2 + k + lv, text: '' };
  else if (r < 0.58) q = { type: 'kill', mob: 'archer', n: 2 + Math.floor(k / 2) + lv, text: '' };
  else if (r < 0.75) q = { type: 'mine', n: 8 + k * 3 + lv * 2, text: '' };
  else if (r < 0.86) {
    const sg = rnd(c, 52) < 0.5 ? -1 : 1;
    q = { type: 'walk', n: 1, tx: n.x + sg * (800 + Math.floor(rnd(c, 53) * 1200)), text: '' };
  } else if (r < 0.94) q = { type: 'gold', n: 15 + k * 8 + lv * 6, text: '' };
  else q = { type: 'boss', n: 1, text: '' };
  q.text =
    q.type === 'kill'
      ? q.mob === 'slime'
        ? 'Éliminer ' + q.n + ' slimes'
        : q.mob === 'goblin'
          ? 'Vaincre ' + q.n + ' gobelins'
          : 'Abattre ' + q.n + ' archers squelettes'
      : q.type === 'mine'
        ? 'Miner ' + q.n + ' blocs'
        : q.type === 'walk'
          ? 'Rejoindre la borne à ' + Math.round(Math.abs(q.tx - n.x) / TS) + ' m'
          : q.type === 'gold'
            ? 'Ramasser ' + q.n + " pièces d'or"
            : 'Vaincre un boss';
  q.id = c;
  q.prog = 0;
  q.xp = 30 + lv * 15 + q.n * 4;
  q.gold = 10 + lv * 6 + q.n;
  return q;
}
function qProg(type, key, n) {
  n = n || 1;
  for (const q of P.quests) {
    if (q.type !== type || (q.mob && q.mob !== key) || q.prog >= q.n) continue;
    q.prog = Math.min(q.n, q.prog + n);
    if (q.prog >= q.n) {
      toast(
        'Quête prête : ' +
          q.text +
          ' (retourne voir ' +
          (npcMap.get(q.id) ? npcMap.get(q.id).name : 'le villageois') +
          ')',
        '#7bd88f',
      );
      beep(660, 0.15, 'triangle', 0.05);
    }
  }
}
function say(n, t) {
  n.say = t;
  n.sayT = 220;
}
function completeQuest(q) {
  P.quests = P.quests.filter((x) => x !== q);
  done.add(q.id);
  addXp(q.xp);
  P.gold += q.gold;
  toast('Quête terminée : +' + q.xp + ' xp, +' + q.gold + ' or', '#ffd23f');
  save();
}
function interact() {
  const n = nearNPC;
  if (!n) return;
  P.spawnX = n.x;
  const q = P.quests.find((x) => x.id === n.c);
  if (q) {
    if (q.prog >= q.n) {
      completeQuest(q);
      say(n, 'Merci ! Voilà ta récompense.');
    } else say(n, 'Il te reste : ' + q.text + ' (' + q.prog + '/' + q.n + ')');
    return;
  }
  if (done.has(n.c)) {
    openShop(n);
    return;
  }
  if (P.quests.length >= 3) {
    say(n, 'Termine déjà tes quêtes en cours.');
    return;
  }
  const nq = questFor(n.c, n);
  P.quests.push(nq);
  say(n, nq.text + '. Je te récompenserai.');
  toast('Nouvelle quête : ' + nq.text);
  beep(440, 0.12, 'triangle', 0.05);
  save();
}
