/**
 * @name requestAnimationFrame polyfill
 */
let lastTime = 0;

function requestAnimationFrame(callback: Function) {
  const currTime = new Date().getTime();
  const timeToCall = Math.max(0, 16 - (currTime - lastTime));
  const id = window.setTimeout(function() {
    callback(currTime + timeToCall);
  }, timeToCall);
  lastTime = currTime + timeToCall;
  return id;
}

function cancelAnimationFrame(id: any) {
  clearTimeout(id);
}

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrame;

window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || cancelAnimationFrame;

export default {
  requestAnimationFrame,
  cancelAnimationFrame,
};
