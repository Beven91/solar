/**
 * @name 小程序应用打包配置文件
 */
const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WxappModulePlugin = require('webpack-wxapp-module-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// 是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';
// 发布目标目录
const releaseDir = path.resolve('dist');

// 开发环境plugins
const devPlugins = [
  // new webpack.HotModuleReplacementPlugin(),
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
  devtool: isProduction ? '' : 'source-map',
  name: '$projectName$',
  mode: isProduction ? 'production' : 'development',
  stats: 'errors-only',
  context: path.resolve('packages/$projectName$'),
  entry: {
    app: './app.ts',
  },
  cache: {
    type: 'filesystem',
  },
  output: {
    path: releaseDir,
    filename: '[name]',
    chunkFilename: '[name]',
    assetModuleFilename: '[path][hash].[ext]',
    libraryTarget: 'commonjs2',
    globalObject: 'this',
    publicPath: '',
  },
  plugins: [
    ...(isProduction ? proPlugins : devPlugins),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx'],
    }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      window: 'global',
    }),
    new WxappModulePlugin('npm_modules', ['.scss']),
  ],
  module: {
    rules: [
      {
        // jsx 以及js
        test: /\.(ts|js|jsx)$/,
        include: [
          /solar-core/,
          /packages/,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              comments: true,
              babelrc: false,
              configFile: false,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    'useBuiltIns': 'usage',
                    'modules': 'commonjs',
                    'corejs': require('core-js/package.json').version,
                  },
                ],
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                ['import', { 'libraryName': 'solar-core', 'style': false, 'libraryDirectory': 'src' }, 'solar-core'],
                ['import', { 'libraryName': '$service$', 'style': false, 'libraryDirectory': 'src', 'camel2DashComponentName': false }, '$service$'],
                ['import', { 'libraryName': 'solar-pc', 'style': false, 'libraryDirectory': 'src' }, 'solar-pc'],
                ['import', { 'libraryName': '@ant-design/icons', 'libraryDirectory': '', 'style': false, 'camel2DashComponentName': false }, '@ant-design/icons'],
                ['import', { 'libraryName': 'antd', 'style': false }, 'antd'],
                isProduction ? false : 'react-refresh/babel',
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        // 图片类型模块资源访问
        test: /\.(png|jpg|jpeg|gif|webp|bmp|ico|jpeg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1 * 1024,
          },
        },
      },
      {
        // svg类型模块资源访问
        test: /\.(svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name: '[path][hash].[ext]',
              limit: 2048,
            },
          }, {
            loader: 'svgo-loader',
            options: {
              plugins: [
                { removeTitle: true },
                { convertColors: { shorthex: false } },
                { convertPathData: false },
              ],
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].wxss',
              esModule: false,
            },
          },
          {
            loader: 'px2rpx-loader',
            // 设计稿，推荐：750 模式  这里设计成1px = 1rpx
            options: {
              baseDpr: 1,
              rpxUnit: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: { implementation: require('sass') },
          },
        ],
      },
      {
        test: /\.wxs$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].wxml',
              esModule: false,
            },
          },
          'webpack-wxapp-module-plugin/wxs-loader',
        ],
      },
      // 使用wxml-loader处理.wxml文件，主要用于搜索引用的图片等资源
      {
        test: /\.wxml$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].wxml',
              esModule: false,
            },
          },
          'webpack-wxapp-module-plugin/wxml-loader',
          'webpack-wxapp-module-plugin/layout-loader',
        ],
      },
    ],
  },
  resolve: {
    alias: {
      'whatwg-fetch': 'solar-core/src/network/fetch.wx.ts',
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
};
