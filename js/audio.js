'use strict';
let AC = null,
  muted = false;
function initAudio() {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {
    AC = null;
  }
}
function beep(f, d, type, v, sl) {
  if (!AC || muted) return;
  try {
    const t = AC.currentTime,
      o = AC.createOscillator(),
      g = AC.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (sl) o.frequency.linearRampToValueAtTime(Math.max(40, f + sl), t + d);
    g.gain.setValueAtTime((v || 0.04) * SET.vol * 1.6, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(AC.destination);
    o.start(t);
    o.stop(t + d);
  } catch (e) {}
}
