/**
 * @name WebpackConfig
 * @description 后台系统打包配置
 */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const WebpackExternalsMatchPlugin = require('webpack-externals-match-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// 是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';
// 发布目标目录
const releaseDir = path.resolve('dist');

// 开发环境plugins
const devPlugins = [
  new ReactRefreshWebpackPlugin({ overlay: false }),
  new webpack.HotModuleReplacementPlugin(),
];

// 生产环境plugins
const proPlugins = [
  new CleanWebpackPlugin(),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
  }),
];

module.exports = {
  devtool: 'source-map',
  name: '$projectName$',
  mode: isProduction ? 'production' : 'development',
  stats: 'errors-only',
  context: path.resolve(''),
  cache: {
    type: 'filesystem',
  },
  entry: {
    'app': [
      isProduction ? null : 'webpack-hot-middleware/client',
      './src/$projectName$/index.tsx',
    ].filter((v) => v),
  },
  output: {
    path: releaseDir,
    filename: '[name].js',
    assetModuleFilename: './assets/[hash].[ext]',
    chunkFilename: isProduction ? '[name].[chunkhash:8].js' : '[name].js',
    publicPath: isProduction ? '' : '/$projectName$/',
  },
  plugins: [
    ...(isProduction ? proPlugins : devPlugins),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx'],
    }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.RUNTIME': JSON.stringify('pc'),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: false,
      template: path.resolve('build/template/index.html'),
    }),
    new MiniCssExtractPlugin({ filename: isProduction ? '[name]-[chunkhash].css' : '[name].css' }),
    new WebpackExternalsMatchPlugin({
      // 引用主框架的React
      'react': 'window.mainAppHost.react',
      // 引用主框架的antd
      'antd': 'window.mainAppHost.antd',
      // 引用主框架的react-dom
      'react-dom': 'window.mainAppHost.reactDOM',
      // 引用主框架的moment
      'moment': 'window.mainAppHost.moment',
      // 引用主框架的antdIcons
      '@ant-design/icons': 'window.mainAppHost.antdIcons',
      // 引用主框架的network
      'solar-core/src/network': 'window.mainAppHost.network',
      // 引用主框架的system
      'solar-core/src/system': 'window.mainAppHost.systemRegistration',
      // 引用主框架的config
      'solar-main-configs': 'window.mainAppHost.config',
      // 引用bf的dawnCoreconfig
      'solar-core/src/config': 'window.mainAppHost.coreConfig',
      // 引用bf的pc-provider
      'solar-pc/src/abstract-config-provider': 'window.mainAppHost.uiConfigProvider',
      'react-refresh/runtime': 'window.mainAppHost.reactRefresh',
    }),
  ],
  module: {
    rules: [
      {
        // jsx 以及js
        test: /\.(ts|tsx|js|jsx)$/,
        include: [
          path.resolve('src'),
          /solar-core/,
          /solar-pc/,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              comments: true,
              presets: ['module:metro-react-native-babel-preset'],
              plugins: [
                ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                'transform-react-remove-prop-types',
                [
                  'refer-import',
                  {
                    modules: [
                      { 'libraryName': 'solar-core', 'style': false, 'libraryDirectory': 'src' },
                      { 'libraryName': '$service$', 'style': false, 'libraryDirectory': 'src', 'camel2DashComponentName': false },
                      { 'libraryName': 'solar-pc', 'style': false, 'libraryDirectory': 'src' },
                      { 'libraryName': '@ant-design/icons', 'libraryDirectory': '', 'style': false, 'camel2DashComponentName': false },
                    ],
                  },
                ],
                isProduction ? false : 'react-refresh/babel',
              ].filter(Boolean),
            },
          },
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
              postcssOptions: {
                plugins: [
                  autoprefixer({}),
                ],
              },
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
          'pdf', 'avif', // Document formats
          'woff', 'woff2', 'woff', 'woff2', 'eot', 'ttf', // icon font
          'svg',
        ].join('|')})$`),
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1 * 1024,
          },
        },
      },
    ],
    noParse(content) {
      return /whatwg-fetch/.test(content);
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
