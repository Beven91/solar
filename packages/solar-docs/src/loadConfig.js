const path = require('path');
const fs = require('fs');
const loadConfig = require('./config');
const deepMerge = require('deepmerge');

module.exports = function() {
  const configPath = path.resolve('.vuepress/config.js');
  let selfConfig = {};
  if (fs.existsSync(configPath)) {
    selfConfig = require(configPath);
  }
  return deepMerge(loadConfig(), selfConfig);
};