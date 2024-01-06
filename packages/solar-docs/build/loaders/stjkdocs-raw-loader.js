const fs = require('fs');
const path = require('path');
const hightlight = require('@vuepress/markdown/lib/highlight')

module.exports = function () {
  const id = this._module.resource;
  const source = fs.readFileSync(id).toString('utf-8');
  const ext = path.extname(id).replace('.', '');
  return 'module.exports =' + JSON.stringify(hightlight(source, ext));
}