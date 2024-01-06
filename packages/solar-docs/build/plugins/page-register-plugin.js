const path = require('path');
const processRepository = require('../process');
const Repository = require('../process/repository');
const chokidar = require('chokidar');
const Runtimes = require('../parser/Runtimes');
const generateFindTests = require('../process/template');

const repository = new Repository();
const sourceRegexp = /\.(tsx|ts)/i;
const sourceDir = path.resolve('');
const runtime = {
  pages: [],
  sites: [],
}

if(process.env.mainBuild !== "yes") {
  generateFindTests.clearCache();
}

async function updateAllReasons(id) {
  const relatedPages = runtime.pages.filter((item) => {
    const reasons = item.reasons || [];
    return reasons.indexOf(id) > -1;
  });
  relatedPages.forEach((page) => hotUpdatePageItem(page))
}

async function hotUpdatePageItem(page) {
  if (page) {
    const { site, ...other } = page;
    await processRepository.processAutoPage({ ...other, filePath: page.originPath }, site);
  }
}

async function handleUpdate(ctx, type, target) {
  const id = path.join(sourceDir, target);
  const site = runtime.sites.find((site) => id.indexOf(site.sourceRoot) > -1);
  delete Runtimes.imports[id];
  switch (type) {
    case 'change':
      if (/d\.ts|\.tsx|\.ts/.test(id)) {
        // 如果是依赖文件改动
        return updateAllReasons(id);
      }
      if(/package\.json/.test(id)) {
        ctx.devProcess.handleUpdate(type, target);
        return;
      }
      const page = runtime.pages.find((page) => page.originPath == id);
      hotUpdatePageItem(page);
      break;
    case 'unlink':
    case 'add':
      if (sourceRegexp.test(target) && site) {
        const registerFindTests = module.exports.registerFindTests;
        const files = await repository.findTests(site);
        const newRegisterFindTests = registerFindTests.filter((m) => m.name != site.name);
        registerFindTests.length = 0;
        registerFindTests.push(...newRegisterFindTests);
        registerFindTests.push(...files);
        // 如果是改新增了源码文件
        generateFindTests(files.map((m) => m.file), site.name);
      } else {
        ctx.devProcess.handleUpdate(type, target);
      }
      break;
  }
}

module.exports = function (options, ctx) {
  return {
    name: 'page-register-plugin',
    beforeDevServer() {
      if (ctx.devProcess) {
        const pagesWatcher = chokidar.watch([
          '**/*.md',
          '.vuepress/components/**/*.vue',
          "**/*.d.ts",
          "**/*.tsx",
          "**/*.ts",
          "**/package.json"
        ], {
          cwd: sourceDir,
          ignored: ['.vuepress/**/*.md', 'node_modules'],
          ignoreInitial: true
        })
        pagesWatcher.on('add', target => handleUpdate(ctx, 'add', target))
        pagesWatcher.on('unlink', target => handleUpdate(ctx, 'unlink', target))
        pagesWatcher.on('change', target => handleUpdate(ctx, 'change', target))
      }
    },
    async additionalPages(updater) {
      const data = await processRepository(ctx);
      runtime.pages = data.pages;
      runtime.sites = data.sites;
      return runtime.pages;
    },
    extendMarkdown(md) {
      md.use(require('./markdown/link'));
    }
  }
}

module.exports.registerFindTests = [];