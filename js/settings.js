'use strict';
const SETKEY = 'terres-infinies-settings',
  LASTKEY = 'terres-infinies-last';
function loadSettings() {
  try {
    Object.assign(SET, JSON.parse(localStorage.getItem(SETKEY) || '{}'));
  } catch (e) {}
  muted = !SET.sound;
}
function saveSettings() {
  try {
    localStorage.setItem(SETKEY, JSON.stringify(SET));
  } catch (e) {}
  muted = !SET.sound;
}
function esc(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}
function fmtTime(fr) {
  const m = Math.floor(fr / 3600);
  return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0');
}
function fmtDate(t) {
  try {
    return new Date(t).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return '';
  }
}
function migrateOld() {
  try {
    const o = localStorage.getItem('terres-infinies-v1');
    if (o && !localStorage.getItem(slotKey(1))) {
      localStorage.setItem(slotKey(1), o);
    }
    if (o) localStorage.removeItem('terres-infinies-v1');
  } catch (e) {}
}
