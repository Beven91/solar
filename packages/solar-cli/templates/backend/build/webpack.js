/**
 * @name WebpackConfig
 * @description 打包配置
 */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');
const WWWPlugin = require('./plugins/WWWPlugin');
const MiniCssExtractHotPlugin = require('mini-css-extract-hot-plugin');
const pkg = require('../package.json');

// 是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';
// 发布目标目录
const releaseDir = path.resolve('dist/src/web');

// 开发环境plugins
const devPlugins = [
  new MiniCssExtractHotPlugin(),
  new ReactRefreshWebpackPlugin({ overlay: false }),
  new webpack.HotModuleReplacementPlugin(),
];

// 生产环境plugins
const proPlugins = [
  new WWWPlugin({
    target: path.resolve('dist/'),
  }),
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
    index: [
      isProduction ? null : 'webpack-hot-middleware/client',
      'core-js/stable',
      './src/web/$projectName$/index.tsx',
    ].filter((v) => v),
  },
  output: {
    path: releaseDir,
    assetModuleFilename: './assets/[hash].[ext]',
    filename: isProduction ? '[name]-[chunkhash].js' : '[name].js',
    chunkFilename: isProduction ? '[name].[chunkhash:8].js' : '[name].js',
    publicPath: '',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: 'async',
          name: 'common',
          // 仅将node_modules中的代码独立打包成一份common.js
          // 并且不包含common的css
          // 为什么仅包含node_modules ?  https://webpack.js.org/guides/caching/
          test: /(\/|\\)node_modules(\/|\\)(?!@ant-design)/,
        },
      },
    },
  },
  plugins: [
    ...(isProduction ? proPlugins : devPlugins),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx'],
    }),
    // new CopyPlugin({
    //   patterns: [
    //     { from: path.resolve('node_modules/react/umd/react.development.js'), to: 'react.development.js' },
    //     { from: path.resolve('node_modules/react/umd/react.production.min.js'), to: 'react.production.js' },
    //     { from: path.resolve('node_modules/react-dom/umd/react-dom.development.js'), to: 'react-dom.development.js' },
    //     { from: path.resolve('node_modules/react-dom/umd/react-dom.production.min.js'), to: 'react-dom.production.js' },
    //     { from: path.resolve('node_modules/antd/dist/antd.min.js'), to: 'antd.min.js' },
    //   ],
    // }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(pkg.version),
      'process.env.RUNTIME': JSON.stringify('pc'),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      suffix: isProduction ? '.production' : '.development',
      template: path.resolve('build/template/index.html'),
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new MiniCssExtractPlugin({ filename: isProduction ? '[name]-[chunkhash].css' : '[name].css' }),
  ],
  module: {
    rules: [
      {
        // jsx 以及js
        test: /\.(ts|tsx|js|jsx)$/,
        include: [
          path.resolve('src/web'),
          /solar-core/,
          /solar-pc/,
          /antd/,
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
                '@babel/preset-react',
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
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader', // compiles Less to CSS
            options: {
              lessOptions: { // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
                javascriptEnabled: true,
              },
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
  // externals: {
  //   'react': 'window.React',
  //   'react-dom': 'window.ReactDOM',
  //   'antd': 'window.antd',
  // },
};
