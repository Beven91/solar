const exec = process.env.npm_execpath || '';
const Npm = require('npm-shell');

if (process.env.INSTALLENV !== 'yarn' && exec.indexOf('yarn.js')< 0) {
  // 仅在npm下使用lerna
  const npm = new Npm();
  npm.run('lerna');
}
