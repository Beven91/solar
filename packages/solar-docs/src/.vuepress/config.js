const path = require('path');
const webpack = require('webpack');
const loadConfig = require('../../build/loadConfig')
const pkg = require('../../package.json');

const isRepositoryMode = __dirname.indexOf(path.resolve('')) < 0;

const base = '/docs/'

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: '文档中心',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: '一，惟初太始 道立于一 造分天地 化成万物。',

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],

  base: base,

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    logo: '/logo.svg',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
    ],
    sidebar: {
      '/docs/': [
        {
          title: '快速上手',
          path: '/docs/quick'
        },
        {
          title: '文档配置',
          path: '/docs/config'
        },
        {
          title: '懒人教程',
          path: '/docs/lazy-guide'
        },
        {
          title: '文档部署',
          path: '/docs/deploy'
        },
        {
          title: '内置组件',
          path: '/docs/components'
        },
        {
          title: '生成原理',
          path: '/docs/steps'
        },
      ]
    },
    repository: {
      'docs': {
        name: "docs",
        title: 'docs',
        version: pkg.version,
      }
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    require('../../build/plugins/page-register-plugin.js'),
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ],
  configureWebpack: (webpackConfig) => {
    const devServer = loadConfig.getDevServer();

    const resolveLoader = webpackConfig.resolveLoader = webpackConfig.resolveLoader || {};
    resolveLoader.modules = [
      path.resolve(__dirname, '../../node_modules')
    ]

    webpackConfig.resolve.modules.unshift('node_modules')

    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env.base': JSON.stringify(base),
        'process.env.version': JSON.stringify(Date.now()),
        'process.env.repoport': isRepositoryMode ? devServer.port : JSON.stringify(''),
      })
    )
  }
}
