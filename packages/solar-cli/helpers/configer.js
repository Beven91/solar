/**
 * @module Configer
 * @description 读取应用的package.json中的solar配置
 */
const path = require('path');
const fs = require('fs');

class Configer {
  constructor() {
    this.pkg = {};
    this.filename = path.resolve('package.json');
    if (fs.existsSync(this.filename)) {
      this.pkg = require(this.filename);
    }
  }

  get solar() {
    return this.pkg.solar || {};
  }

  findPath(dir) {
    const root = this.solar.root || '';
    if (root) {
      dir = (root + '/' + dir).replace(/\/\/\//, '/').replace(/\/\//, '/');
    }
    return path.resolve(dir);
  }
}

module.exports = new Configer();
