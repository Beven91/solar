const path = require('path');

module.exports = function() {
  const pkg = require(path.resolve('package.json'));

  return {
    title: pkg.name,
    theme: '@vuepress/default',
    description: pkg.description,
    temp: path.join(__dirname, '../../.temp'),
    plugins: [
      require('../plugins/source-link'),
      [
        '@vuepress/register-components',
        {
          componentsDir: path.resolve(__dirname, '../components'),
        },
      ],
    ],
  };
};