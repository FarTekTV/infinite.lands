'use strict';
function setFs(on) {
  stage.classList.toggle('fs', on);
}
async function toggleFull() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try {
      await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } catch (e) {}
    setFs(false);
    return;
  }
  if (stage.classList.contains('fs')) {
    setFs(false);
    return;
  }
  try {
    await (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
    setFs(true);
  } catch (e) {
    setFs(true);
  }
}
document.addEventListener('fullscreenchange', () => setFs(!!document.fullscreenElement));
