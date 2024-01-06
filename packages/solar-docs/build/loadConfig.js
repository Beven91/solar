const path = require('path');
const fs = require('fs');

module.exports = function () {
  const dir = path.resolve('');
  const configPath = path.join(dir, '.vuepress/config.js');
  const configPath2 = path.join(dir,'vuepress.js');
  const file = fs.existsSync(configPath) ? configPath : configPath2;
  if (fs.existsSync(file)) {
    return require(file);
  } else {
    return {}
  }
}

module.exports.getRepositoryInfo = function () {
  const sourceRoot = path.resolve('');
  const file = path.resolve('.vuepress/repository.js');
  let data = {};
  if (fs.existsSync(file)) {
    data = require(file);
  }
  return {
    repo: data,
    sourceRoot: sourceRoot,
    name: path.basename(sourceRoot),
    installed: fs.existsSync(path.join(sourceRoot, 'node_modules')),
    demoRoot: path.join(sourceRoot, '__tests__')
  }
}

module.exports.getDevServer = function (options) {
  return {
    // static: {
    //   directory: path.join(__dirname, 'public'),
    // },
    hot: true,
    injectClient: true,
    compress: true,
    port: 9000,
    stats: 'errors-only',
    // writeToDisk: true,
    headers: {
      'access-control-allow-method': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'access-control-allow-origin': 'http://localhost:8080'
    },
    ...(options || {})
  }
}