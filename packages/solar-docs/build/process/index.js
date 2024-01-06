const fs = require('fs-extra');
const path = require('path');
const Repository = require('./repository');
const util = require('../loaders/vendor-loader/index');
const generateComponentProps = require('./features/generate.component.props');
const generateDemoUrl = require('./features/generate.demo.url');
const template = require('./template');
const child_process = require('child_process');

const VENDOR_PATH = '.vuepress/public/vendors/'
const repository = new Repository();

const saveAs = (file, content) => {
  fs.ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, content);
}

async function processPageItem(item, site) {
  const from = item.filePath;
  let content = fs.readFileSync(from).toString('utf-8');
  const props = await generateComponentProps(site, item);
  const reg = /```props\s*\n+```/;
  if (reg.test(content)) {
    content = content.replace(reg, props);
  } else {
    content = content + '\n' + props
  }
  return content;
}

async function processPages(pages, site) {
  for (let i = 0, k = site.pages.length; i < k; i++) {
    const item = site.pages[i];
    const content = await processPageItem(item, site);
    pages.push(createPage(content, item, site));
  }
}

function createPage(content, item, site, suffix) {
  const file = path.join(template.cacheRoot, item.relative);
  fs.ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, content);
  return {
    site: site,
    filePath: file,
    originPath: item.filePath,
    path: item.path + (suffix || ''),
    relative: item.relative,
    reasons: item.reasons,
    // content: content
  }
}

function processAssets(site, sourceRoot) {
  const fromAssets = path.join(site.sourceRoot, '.vuepress/public');
  const destAssets = path.join(sourceRoot, VENDOR_PATH, site.name)
  if (fs.existsSync(fromAssets)) {
    console.log('copy asset', fromAssets)
    fs.mkdirsSync(destAssets);
    fs.copySync(fromAssets, destAssets, { overwrite: true });
  }
}

async function processDemoPageItem(item, site) {
  const repo = site.repo;
  const platform = repo.platform || 'mobile';
  const title = item.component;
  const demoUrl = generateDemoUrl(repo, item.name);
  const props = await generateComponentProps(site, item);
  const template = processTemplate('demo.' + platform + '.md', {
    title,
    src: item.src.replace(site.name + '/', ''),
    url: demoUrl,
    props
  })
  return template;
}

async function processDemoPages(pages, site, sourceRoot) {
  const sources = [];
  const dest = path.join(sourceRoot, VENDOR_PATH, site.name, 'index.js')
  for (let i = 0, k = site.pages.length; i < k; i++) {
    const item = site.pages[i];
    const from = item.demoPath || item.filePath;
    let content = '';
    if (fs.existsSync(from)) {
      content = fs.readFileSync(from).toString('utf-8');
    }
    const template = await processDemoPageItem(item, site);
    sources.push(util.createVendor(item.src, content, {}, from));
    pages.push(createPage(template, item, site, '.html'));
  }
  saveAs(dest, sources.join(';\n'))
}

function processFallbackUrls(site, sourceRoot) {
  const urls = [
    path.join(sourceRoot, VENDOR_PATH, site.name, 'index.js'),
    path.join(sourceRoot, VENDOR_PATH, site.name, 'index.css')
  ]
  urls.forEach((file) => {
    if (!fs.existsSync(file)) {
      saveAs(file, '')
    }
  })
}

function processHomeFallback(pages, site, sourceRoot) {
  const sidebar = site.sidebar;
  const base = sidebar.name + '/'.replace(/\/\//g, '/');
  const repo = site.repo;
  const items = sidebar.items || [];
  const hasIndex = items.find((item) => item.path == base);
  if (hasIndex || items.length < 1) return;
  items.unshift({ title: 'Index', path: base })
  const name = repo.name;
  const templateId = repo.npm !== false ? 'index.npm.md' : 'index.md';
  const content = processTemplate(templateId, {
    name: name,
    title: JSON.stringify(name),
    desc: repo.description || '',
    link: items[1].path
  });
  const item = {
    path: '/' + site.name + '/',
    relative: site.name + '/index.md'
  };
  pages.push(createPage(content, item, site));
}

function processTemplate(name, data) {
  const id = path.join(__dirname, '../template', name);
  let template = fs.readFileSync(id).toString('utf-8')
  Object.keys(data || {}).forEach((key) => {
    template = template.replace(new RegExp('\\$' + key, 'g'), data[key]);
  })
  return template;
}

function eachRepositories(ctx, handler) {
  const dev = __dirname.indexOf(path.resolve('')) < 0;
  if (dev) {
    return Promise.resolve(handler({ dir: path.resolve('') }));
  } else if (ctx.isProd) {
    return repository.eachRepositories(handler);
  }
}

const sortSidebarItems = (site) => {
  const items = site.sidebar.items || [];
  const repo = site.repo;
  const sidebarIndeies = repo.sidebarIndeies || [];
  if (sidebarIndeies.length < 1) return items;
  const newItems = [];
  sidebarIndeies.forEach((value) => {
    const item = items.find((m) => m.fileName == value);
    if (item) {
      newItems.push(item);
    }
  })
  return newItems;
}

async function buildRepoWebpack(repo, sourceRoot) {
  const pkgFile = path.join(sourceRoot || '', 'package.json');
  if (!repo.mainBuild || !sourceRoot) return;
  if (!fs.existsSync(pkgFile)) return;
  const pkg = require(pkgFile);
  delete pkg.devDependencies;
  const idx = path.resolve('bin/index.js');
  pkg.scripts = {
    "build": `node ${idx} build`,
  }
  console.log('Build ', pkg.name, '......');
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
  child_process.execSync('npm install', { cwd: sourceRoot, stdio: [process.stdin, process.stdout, process.stderr] })
  child_process.execSync(`node ${idx} build`, {
    cwd: sourceRoot,
    env: {
      ...process.env,
      mainBuild: 'yes'
    },
    stdio: [process.stdin, process.stdout, process.stderr]
  })
}

module.exports = async function process(ctx) {
  const sourceRoot = path.join(__dirname, '../../src');
  const themeConfig = ctx.siteConfig.themeConfig = ctx.siteConfig.themeConfig || {};
  const repositories = themeConfig.repository = themeConfig.repository || {};
  const sidebars = themeConfig.sidebar = themeConfig.sidebar || {};
  const pages = [];
  const allSites = [];
  // 克隆相关文档库
  await eachRepositories(ctx, async (repo) => {
    // 整理项目文档文件
    const sites = await repository.findRepositorySite(repo);
    if (repo.isWorkspaces) {
      processAssets({ sourceRoot: repo.dir, name: '' }, sourceRoot);
    }
    allSites.push(...sites);
    for (let i = 0, k = sites.length; i < k; i++) {
      const site = sites[i];
      const repo = site.repo;
      if (ctx.isProd) {
        // 本地即时构建
        await buildRepoWebpack(repo, site.sourceRoot);
      }
      sidebars[site.sidebar.name] = sortSidebarItems(site);
      repositories[repo.name] = {
        name: repo.name,
        version: repo.version,
        desc: repo.description,
        author: repo.author,
        type: repo.type,
        title: repo.name
      }
      switch (site.repo.type) {
        case 'demo':
          await processDemoPages(pages, site, sourceRoot);
          break;
        default:
          await processPages(pages, site, sourceRoot);
          break;
      }
      console.log('site', site.sourceRoot)
      processAssets(site, sourceRoot);
      processHomeFallback(pages, site, sourceRoot);
      processFallbackUrls(site, sourceRoot);
    }
  })
  return {
    pages,
    sites: allSites
  };
}

module.exports.processAutoPage = async function (item, site) {
  switch (site.repo.type) {
    case 'demo':
      const content = await processDemoPageItem(item, site);
      return createPage(content, item, site, '.html');
    default:
      const content2 = await processPageItem(item, site);
      return createPage(content2, item, site);
  }
}

