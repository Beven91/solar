#!/usr/bin/env node
const path = require('path');
const { dev } = require('@vuepress/core');
const webpack = require('../build/webpack');
const Server = require('webpack-dev-server');
const colors = require('webpack-dev-server/lib/utils/colors');
const loadConfig = require('../build/loadConfig');
const createLogger = require('webpack-dev-server/lib/utils/createLogger');
const Repository = require('../build/process/repository');

const argv = process.argv;
const log = createLogger({});

async function runDev() {
  const meta = loadConfig.getRepositoryInfo();
  dev({
    sourceDir: path.join(__dirname, '../src'),
  });
  if (meta.repo.type == 'demo' || !meta.installed) {
    return;
  }

  const data = await getRepositorySites();
  const sites = data.sites;

  if (sites.length < 1) return;
  try {
    const compiler = webpack({ dev: true, sites: sites, findTests: data.findTests });
    if (compiler) {
      const server = new Server(compiler, compiler.options.devServer);
      server.listen(compiler.options.devServer.port);
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      log.error(colors.error(true, err.message));
      process.exit(1);
    }
    throw err;
  }
}

async function getRepositorySites() {
  const repository = new Repository();
  const sites = await repository.findRepositorySite({ dir: path.resolve('') });
  const findTests = [];
  for (let i = 0, k = sites.length; i < k; i++) {
    const site = sites[i];
    const files = await repository.findTests(site);
    findTests.push(...files);
  }
  return {
    sites: sites.filter((site) => !!site.repo.devServer),
    findTests: findTests,
  };
}

async function buildVendor() {
  const data = await getRepositorySites();
  const sites = data.sites;
  if (sites.length < 1) return;
  const compiler = webpack({ sites: sites, findTests: data.findTests });
  compiler.run((err, results) => {
    if (err) {
      process.exit(1);
    } else if (results.hasErrors()) {
      process.exit(1);
    } else {
      // log.info(colors.info(true, results.toString()));
    }
  });
}

async function buildTypes() {
  const name = argv[3];
  const repository = new Repository();
  if (name) {
    const dir = path.resolve('node_modules', name);
    await repository.makeTypes(dir);
  }
}

switch (argv[2]) {
  case 'build':
    buildVendor();
    break;
  case 'types':
    buildTypes();
    break;
  default:
    runDev();
    break;
}