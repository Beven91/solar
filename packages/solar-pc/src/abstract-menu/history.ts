type Handler = () => void

const pushState = history.pushState;
const replaceState = history.replaceState;
const handlers = [] as Handler[];

history.pushState = function(...args: any[]) {
  const result = pushState.call(history, ...args);
  handlers.forEach((handler) => handler());
  return result;
};

history.replaceState = function(...args: any[]) {
  return replaceState.call(history, ...args);
};

function addListen(handler: Handler) {
  window.addEventListener('popstate', handler);
  handlers.push(handler);
}

function removeListen(handler: Handler) {
  const index = handlers.indexOf(handler);
  if (index > -1) {
    handlers.splice(index, 1);
  }
  window.removeEventListener('popstate', handler);
}

export default {
  addListen,
  removeListen,
};