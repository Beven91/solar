const { dev } = require('@vuepress/core');
const path = require('path');
const loadConfig = require('./loadConfig');

module.exports = {
  start: () => {
    dev({
      sourceDir: path.resolve(''),
      siteConfig: loadConfig(),
    });
  },
};