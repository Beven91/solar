/**
 * @module VendorBuilder
 * @description 用于构建二方库demo代码
 */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const DevLogPlugin = require('@vuepress/core/lib/node/webpack/DevLogPlugin');
const PageRegisterPlugin = require('./plugins/page-register-plugin');
const WebpackBar = require('webpackbar');
const loadConfig = require('./loadConfig');
const generateFindTests = require('./process/template');
const vuepressConfig = require('../src/.vuepress/config')

function resolveMain(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);
    const id = resolve(path.join(dir, pkg.main || 'index'))
    return fs.existsSync(id) ? id : resolve(path.join(dir, 'src/index'))
  }
  return resolve(dir);
}

function resolve(id) {
  const extensions = ['.js', '.tsx', '.vue', '.ts']
  const ext = extensions.find((ext) => fs.existsSync(id + ext));
  return ext ? id + ext : null;
}

module.exports = function (options) {
  options = options || {};
  const sites = options.sites;
  const findTests = options.findTests || [];
  const { sourceRoot, name } = loadConfig.getRepositoryInfo();
  const isProduction = options.dev !== true;
  const publicPath = '/vendors/'
  const config = loadConfig();
  const devServer = loadConfig.getDevServer({ publicPath })
  const hot = 'http://localhost:' + devServer.port + publicPath;
  const transformInclude = options.transformInclude || [];
  const alias = options.extend.alias;

  console.log('sourceRoot....', sourceRoot)

  PageRegisterPlugin.registerFindTests = findTests;

  // 开发环境plugins
  const devPlugins = [
    new DevLogPlugin({
      port: devServer.port,
      displayHost: 'localhost',
      publicPath: publicPath + 'index.js',
      clearScreen: false,
    }),
    new ReactRefreshWebpackPlugin({ overlay: false }),
    new webpack.HotModuleReplacementPlugin(),
  ];

  // 生产环境plugins
  const proPlugins = [
  ];

  const entry = {};

  sites.forEach((site) => {
    const files = [
      resolveMain(site.sourceRoot),
      generateFindTests(findTests.filter((m) => m.name == site.name).map((m) => m.file), site.name)
    ].filter((v) => Boolean(v));
    if (files.length > 0) {
      const prefix = (isProduction && sourceRoot == site.sourceRoot) ? '' : site.name + '/';
      entry[prefix + 'index'] = files;
    }
  })

  if (Object.keys(entry).length < 1) {
    return;
  }

  const webpackConfig = {
    devtool: isProduction ? false : 'source-map',
    name: name,
    mode: 'development',
    stats: devServer.stats,
    context: sourceRoot,
    devServer: devServer,
    entry: entry,
    output: {
      // library: {
      //   name: '',
      //   type: 'umb',
      //   umdNamedDefine: true
      // },
      library: name,
      libraryTarget: 'umd',
      path: path.join(sourceRoot, '.vuepress/public/'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: isProduction ? vuepressConfig.base + 'vendors/' + (options.useDir) : hot,
    },
    plugins: [
      ...(isProduction ? proPlugins : devPlugins),
      new WebpackBar({
        name: 'Repository',
        color: '#41b883',
        compiledIn: false
      }),
      new webpack.DefinePlugin({}),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
      new MiniCssExtractPlugin({ filename: '[name].css' }),
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/i,
          include: (file) => {
            const isMatch = transformInclude.find((reg) => reg.test(file));
            return isMatch || !/node_modules/.test(file)
          },
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                comments: true,
                configFile: false,
                root: path.join(__dirname, '..'),
                presets: [
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      'targets': {
                        'chrome': '67',
                        'safari': '11.1',
                      },
                      "modules": "commonjs",
                      'corejs': require('core-js/package.json').version,
                    },
                  ],
                  require.resolve('@babel/preset-react'),
                  require.resolve('@babel/preset-typescript'),
                ],
                plugins: [
                  [require.resolve('@babel/plugin-proposal-decorators'), { 'legacy': true }],
                  [
                    require.resolve('babel-plugin-refer-import'),
                    {
                      modules: config.importModules || [],
                    },
                  ],
                  isProduction ? false : path.join(__dirname, '../node_modules/react-refresh/babel'),
                ].filter(Boolean),
              },
            },
            {
              loader: require.resolve('./loaders/vendor-loader/index'),
              options: {
                sourceRoot: sourceRoot,
                include: findTests,
              }
            }
          ],
        },
        {
          test: /\.(css|scss)$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer({}),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: { implementation: require('sass') },
            },
          ],
        },
        {
          // url类型模块资源访问
          test: new RegExp(`\\.(${[
            'psd', // Image formats
            'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'jpeg', // Image formats
            'm4v', 'mov', 'mp4', 'mpeg', 'mpg', 'webm', // Video formats
            'aac', 'aiff', 'caf', 'm4a', 'mp3', 'wav', // Audio formats
            'pdf', // Document formats
            'woff', 'woff2', 'woff', 'woff2', 'eot', 'ttf', // icon font
            'svg',
          ].join('|')})$`),
          loader: 'file-loader',
          options: {
            name: 'assets/[name]-[hash].[ext]',
          },
        },
      ],
    },
    externals: {
    },
    resolveLoader: {
      modules: [
        path.join(__dirname, '../node_modules'),
        path.resolve('node_modules'),
        path.join(__dirname, './loaders')
      ]
    },
    resolve: {
      alias: {
        '@babel': path.join(__dirname, '..', 'node_modules', '@babel'),
        ...(alias || {})
      },
      extensions: ['.ts', '.tsx', '.js'],
    },
  }

  if (typeof config.configureWebpack == 'function') {
    config.configureWebpack(webpackConfig);
  }

  return webpack(webpackConfig)
}