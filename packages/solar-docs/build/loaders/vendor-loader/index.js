const fs = require('fs');
const path = require('path');
const loaderUtils = require('loader-utils');
const hightlight = require('@vuepress/markdown/lib/highlight');

const runtime = {
  createRoot: null,
};

function probeApp(content) {
  if (/import\s+React/.test(content)) {
    return 'react';
  }
  return '';
}

function findNodeModules(sourceRoot, name) {
  const segments = sourceRoot.split(path.sep);
  while (segments.length > 0) {
    const id = path.join(segments.join(path.sep), 'node_modules/' + name);
    if (fs.existsSync(id)) {
      return id;
    }
    segments.pop();
  }
  return null;
}

function hasCreateRoot(sourceRoot) {
  if (runtime.createRoot == null) {
    runtime.createRoot = !!findNodeModules(sourceRoot, 'react-dom/client.js');
  }
  return runtime.createRoot;
}

function createReactApp(sourceRoot, index) {
  const createRoot = hasCreateRoot(sourceRoot);
  if (index) {
    return `const run = require('${index.replace(/\\/g, '/')}').default;\nrun(container,App);\n`;
  } else if (createRoot) {
    return 'require(\'react-dom/client\').createRoot(container).render(<App />);';
  }
  return 'require(\'react-dom\').render(<App />,container);';
}

function createApp(type, options, index) {
  const sourceRoot = options.sourceRoot;
  if (!sourceRoot) return '';
  switch (type) {
    case 'react':
      return createReactApp(sourceRoot, index);
    default:
      return '';
  }
}

function createSource(type, source, resource) {
  const ext = path.extname(resource).replace('.', '');
  switch (type) {
    case 'react':
      const lang = ext == 'js' ? 'jsx' : ext;
      return hightlight(source, lang);
    default:
      return hightlight(source, ext);
  }
}

function createVendor(name, source, options, resource, index) {
  const appType = probeApp(source);
  source = createSource(appType, source, resource).replace(/'/g, '\\\'').replace(/\n/g, '\t\t');
  return `self.STJKVENDORS['${name}']= {
    run(container,write){
      ___hook.write = write;
      const App = module.exports.default;
      ${createApp(appType, options, index)}
    },
    source:'${source}'
  };
  `;
}

function createConsole() {
  const id = require.resolve('./console.js').replace(/\\/g, '/');
  return `var ___hook = { write:null };\nvar __AppCodeboxConsole = require('${id}');\nvar console = new __AppCodeboxConsole(___hook);`;
}

module.exports = function(content) {
  const resource = this._module.resource;
  const options = loaderUtils.getOptions(this);
  const findTests = options.include || [];
  const item = findTests.find((m) => m.file == resource);
  if (!item) {
    return content;
  }
  const index = item.index ? path.join(item.dir, item.index) : '';
  const id = resource.split(item.dir)[1];
  const name = (item.name + '/' + id.split('.').slice(0, -1).join('.')).replace(/\\/g, '/').replace(/\/\//g, '/');
  return `${createConsole()}\n${content};\n${createVendor(name, content, options, resource, index)}`;
};

module.exports.createVendor = createVendor;

module.exports.probeApp = probeApp;