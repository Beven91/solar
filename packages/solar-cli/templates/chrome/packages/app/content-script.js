
// 需要加载的js
const assets = [
  'app.js',
  'common.js',
  'app.css',
];

// 创建运行入口
function launch() {
  // 定义运行环境
  executeScript('window.chrome.env = \'content-script\'');
  // 创建加载
  const promise = Promise.resolve();
  // 创建根元素
  const div = document.createElement('div');
  div.id = 'chrome-extension-content-root';
  div.className = 'chrome-extension-content-script-container';
  document.body.appendChild(div);
  // 加载资源
  assets.forEach((key) => promise.then(() => readyAsset(key)));
}

function executeScript(script) {
  const a = document.createElement('a');
  a.setAttribute('onclick', script);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
}

function readyAsset(key) {
  const url = process.env.remote + key;
  if (/\.css/.test(key)) {
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 启动
launch();