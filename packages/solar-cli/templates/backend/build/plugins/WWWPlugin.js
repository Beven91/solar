const fs = require('fs');
const path = require('path');
const pkg = require('../../package.json');

class WWWPlugin {
  options = {
    target: '',
  };

  constructor(options) {
    this.options = options;
  }

  makePackage(root) {
    const id = path.join(root, 'package.json');
    const pm2 = path.resolve('pm2.json');
    const pm2Config = require(pm2);
    const meta = {
      name: pkg.name,
      description: pkg.description,
      version: fs.readFileSync('VERSION').toString('utf-8').trim(),
      private: true,
      dependencies: {},
      workspace: true,
      workspaces: [
        'src/api/*',
      ],
    };
    pm2Config.env = pm2Config.env || {};
    pm2Config.env['RUN_ENV'] = process.env.npm_config_env || '';
    fs.writeFileSync(pm2, JSON.stringify(pm2Config, null, 2));
    fs.writeFileSync(id, JSON.stringify(meta, null, 2));
    fs.readdirSync('src/api').forEach((name) => {
      const id = path.resolve('src/api', name);
      if (fs.lstatSync(id).isDirectory()) {
        const file = 'package.json';
        const from = id + '/' + file;
        const target = path.join('dist/src/api/', name, file);
        fs.copyFileSync(from, target);
      }
    });
  }

  apply(compiler) {
    const root = path.resolve(this.options.target || '');
    compiler.hooks.afterEmit.tap('WWWPlugin', () => {
      this.makePackage(root);
    });
  }
}

module.exports = WWWPlugin;