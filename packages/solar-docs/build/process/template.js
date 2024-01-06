const fs = require('fs-extra');
const path = require('path');

const cacheRoot = path.join(__dirname, '../../.cache');

module.exports = function generateFindTestsTemplate(files, name){
  const file = path.join(cacheRoot, name, 'findTests.tsx');
  fs.ensureDirSync(path.dirname(file));
  const code = files
    .filter((name) => /\.(ts|tsx|vue|js)/.test(name))
    .map((item) => `import '${item.replace(/\\/g, '/')}';`).join('\n');
  fs.writeFileSync(file, code);
  return file;
}

module.exports.cacheRoot = cacheRoot;

module.exports.clearCache = function () {
  if (fs.existsSync(cacheRoot)) {
    fs.removeSync(cacheRoot);
  }
}