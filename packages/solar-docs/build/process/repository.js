
const path = require('path')
const fs = require('fs-extra');
const cp = require('child_process')
const { globby } = require('@vuepress/shared-utils')

const reposRoot = path.resolve('repos');

class GitRepository {

  constructor() {
    this.cache = {};
    this.sourceDir = path.resolve('repos');
    if (fs.existsSync(path.resolve('repositories.js'))) {
      this.repositories = this.repositories = require(path.resolve('repositories.js'));
    } else {
      this.repositories = [];
    }
  }

  cloneRepositories() {
    if (!fs.existsSync(this.sourceDir)) {
      fs.mkdirSync(this.sourceDir)
    }
    Promise.all(
      this.repositories.map((item) => this.clone(item.url, item.branch))
    )
  }

  clone(url, branch) {
    if (this.cache[url]) return;
    this.cache[url] = true;
    const auth2 = fs.readFileSync('.auth').toString('utf-8');
    url = url.replace(':', '/').replace('git@', 'https://oauth2:' + auth2 + '@')
    console.log('git clone  -b ' + branch + ' ' + url);
    cp.spawnSync('git', ['clone', '-b', branch, url, '--depth=1'], {
      cwd: reposRoot,
      stdio: [process.stdin, process.stdout, process.stderr]
    })
  }

  async eachRepositories(handler) {
    this.cloneRepositories();
    const repositories = this.repositories;
    for (let i = 0, k = repositories.length; i < k; i++) {
      const repo = repositories[i];
      await Promise.resolve(handler && handler(repo))
    }
  }

  matchBlackList(name, repo) {
    const blackList = repo.blackList || [];
    return !!blackList.find((exp) => {
      if (exp instanceof RegExp) {
        return exp.test(name);
      } else {
        return new RegExp(exp).test(name);
      }
    })
  }

  createRepository(repoMeta, dir) {
    const pkg = this.readRepositoryPackage(repoMeta.packagePath || '', dir) || {};
    const selfRepo = (repoMeta.workspaces || {})[pkg.name];
    const configIndex = path.join(dir, '.vuepress', 'repository.js');
    let userRepo = {};
    if (fs.existsSync(configIndex)) {
      const id = require.resolve(configIndex);
      delete require.cache[id];
      userRepo = require(id) || {};
    }
    const repo = {
      ...(pkg.docs || {}),
      ...repoMeta,
      ...selfRepo,
      version: pkg.version,
      description: pkg.description,
      author: pkg.authors,
      name: pkg.name || repoMeta.name,
      ...userRepo
    }
    return repo;
  }

  readRepositoryPackage(name, dir) {
    const packagePath = name ? path.join(dir, name) : path.join(dir, 'package.json');
    if (fs.existsSync(packagePath)) {
      return JSON.parse(fs.readFileSync(packagePath).toString('utf-8'));
    }
  }

  async findRepository(repoMeta) {
    const dir = repoMeta.dir || path.join(reposRoot, path.basename(repoMeta.url).replace('.git', ''), repoMeta.baseName || '');
    const repo = this.createRepository(repoMeta, dir);
    const avariableRepositories = [];
    const id = path.join(dir, 'package.json');
    const lerna = path.join(dir, 'lerna.json');
    const monorepos = { package: {}, lerna: {} };
    if (fs.existsSync(lerna)) {
      monorepos.lerna = require(lerna);
    }
    if (fs.existsSync(id)) {
      monorepos.package = require(id);
    }
    if (repo.type == 'demo') {
      avariableRepositories.push({ dir: path.join(dir, repo.base || ''), repo });
      return avariableRepositories;
    }
    const workspaces = monorepos.package.workspaces || monorepos.lerna.packages;
    if (!workspaces) {
      avariableRepositories.push({ dir, repo });
    } else {
      repoMeta.dir = dir;
      repoMeta.isWorkspaces = true;
      repo.isWorkspaces = true;
      // 如果是workspaces
      await this.findWorkspaces(avariableRepositories, dir, workspaces, repo);
    }
    return avariableRepositories;
  }

  async findRepositorySite(repo) {
    const repositories = await this.findRepository(repo);
    const sites = [];
    for (let i = 0, k = repositories.length; i < k; i++) {
      const item = repositories[i];
      const rootName = item.repo.name || path.basename(item.dir)
      const files = await this.findDocFiles(item.dir, item.repo, rootName);
      sites.push({
        name: rootName,
        repo: item.repo,
        pages: files.map((element) => {
          const name = element.page.replace(path.extname(element.page), '');
          const filePath = path.join(element.dir, element.origin);
          const src = rootName + '/' + element.origin;
          const itemRepo = item.repo;
          let demoPath = itemRepo.demoSourcePath ? itemRepo.demoSourcePath(name, filePath) : '';
          if (demoPath && !path.isAbsolute(demoPath)) {
            demoPath = path.join(item.dir, demoPath);
          }
          return {
            ...element,
            demoPath: demoPath,
            name: name,
            src: src,
            filePath: filePath,
            relative: rootName + '/' + element.page
          }
        }),
        sourceRoot: item.dir,
        makeAssets: () => repo.makeAssets && repo.makeAssets(item),
        sidebar: {
          name: '/' + rootName,
          items: this.readSidebar(item.dir, files, rootName)
        }
      })
    }
    return sites;
  }

  readSidebar(dir, files) {
    const sidebar = path.join(dir, '.vuepress/sidebar.js');
    if (fs.existsSync(sidebar)) {
      delete require.cache[require.resolve(sidebar)];
      return require(sidebar);
    }
    const parent = [];
    const items = files.map((fileInfo) => {
      return {
        title: '', //fileInfo.component,
        name: fileInfo.component,
        path: fileInfo.path,
        fileName: fileInfo.fileName,
        type: 'auto',
        children: []
      }
    })
    return items.filter((item) => {
      if (item.path.split('/').length <= 3) return true;
      const parentItem = parent.find((m) => item.path.indexOf(m.path) > -1);
      parent.push(item);
      if (parentItem) {
        parentItem.children = parentItem.children || [];
        parentItem.children.push(item);
        return false;
      }
      return true;
    })
  }

  normalizePath(url) {
    return url.replace('/.', '/').replace('index.md', '').replace(/(\/|^)README.md/i, '/').replace('.md', '');
  }

  normalizeName(name) {
    if (name == '.') {
      return 'Index'
    } else {
      const segments = name.split('-');
      return segments.map((item, i) => {
        return item[0].toUpperCase() + item.slice(1);
      }).join('')
    }
  }

  findWorkspaces(avariableDirs, dir, workspaces, repo) {
    workspaces = workspaces.map((n) => n.replace('*', "**/package.json"))
    return globby(workspaces, { cwd: dir }).then((files) => {
      files.forEach((name) => {
        const isPackage = /package\.json/i.test(name);
        name = path.dirname(name);
        if (!/node_modules/.test(name) && isPackage && !this.matchBlackList(name, repo)) {
          const repodir = path.join(dir, name);
          const newRepo = this.createRepository(repo, repodir);
          avariableDirs.push({ repo: newRepo, dir: repodir })
        }
      })
    })
  }

  findDocFiles(dir, repo, rootName) {
    console.log(repo.name, repo.patterns, dir);
    const patterns = repo.patterns || ['**/*.md', '**/*.vue'];
    return globby(patterns, { cwd: dir }).then((files) => {
      const docFiles = [];
      const fileInfos = [];
      files.forEach((name) => {
        if (!/node_modules/.test(name) && !this.matchBlackList(name, repo)) {
          docFiles.push(name)
        }
      })
      docFiles.forEach((name) => {
        const newName = name.replace(/\.\.\//g, '')
        let page = newName.replace(path.extname(newName), '.md');
        let component = path.basename(page);
        const key = component.toLocaleLowerCase()
        if (key == 'readme.md' || key == 'index.md') {
          component = path.basename(path.dirname(page))
        }
        fileInfos.push({
          component: this.normalizeName(component).replace('.md', ''),
          dir: dir,
          origin: name,
          fileName: path.basename(page).replace(path.extname(page), ''),
          page,
          path: this.normalizePath('/' + rootName + '/' + page),
        })
      })
      return fileInfos;
    })
  }

  async findTests(site) {
    const dir = site.sourceRoot;
    const patterns = site.repo.runnerPatterns || ['__tests__/**/*.tsx', '__tests__/**/*.ts'];
    return globby(patterns, { cwd: dir }).then((files) => {
      return files.map((file) => {
        const id = path.join(dir, file);
        return { index: site.repo.runnerIndex, file: id, dir: site.sourceRoot, name: site.name };
      })
    });
  }

  async makeTypes(dir) {
    const name = path.basename(dir);
    const patterns = ['**/*.d.ts'];
    if (!fs.existsSync(dir)) {
      return;
    }
    return globby(patterns, { cwd: dir }).then((files) => {
      files.forEach((file) => {
        if (!/node_modules/i.test(file)) {
          const from = path.join(dir, file);
          const dest = path.join(path.resolve('.vuepress/@types'), name, file);
          fs.ensureDirSync(path.dirname(dest));
          console.log('[stjkdocs]: make type:' + file);
          fs.copyFileSync(from, dest);
        }
      })
    });
  }
}

module.exports = GitRepository