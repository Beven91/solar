/**
 * @name Chrome扩展程序应用打包配置文件
 */
const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ChromeMainifestPlugin = require('chrome-manifest-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// 是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';
// 发布目标目录
const releaseDir = path.resolve('dist');
const domain = 'http://localhost:' + process.env.NODE_WEB_PORT;
const publicPath = domain + '/';
const remotePath = '';
const hmr = encodeURIComponent(publicPath + '__webpack_hmr');

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
    app: [
      isProduction ? null : 'webpack-hot-middleware/client?path=' + hmr,
      './src/$projectName$/index.tsx',
    ].filter(function(v) {
      return v;
    }),
  },
  output: {
    path: releaseDir,
    filename: '[name].js',
    chunkFilename: '[name].js',
    assetModuleFilename: './assets/[hash].[ext]',
    publicPath: isProduction ? remotePath : publicPath,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: 'all',
          name: 'common',
          // 仅将node_modules中的代码独立打包成一份common.js
          // 并且不包含common的css
          // 为什么仅包含node_modules ?  https://webpack.js.org/guides/caching/
          test: /[\\/]node_modules[\\/].+\.(js|jsx)$/,
        },
      },
    },
  },
  externals: {
    chrome: 'global.chrome',
  },
  plugins: [
    ...(isProduction ? proPlugins : devPlugins),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx'],
    }),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('build/template/index.html'),
    }),
    new webpack.DefinePlugin({
      'process.env.RUNTIME': JSON.stringify('pc'),
    }),
    new ChromeMainifestPlugin({
      manifestPath: 'manifest.json',
      domain: domain,
    }),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
  ],
  module: {
    rules: [
      {
        // jsx 以及js
        test: /\.(ts|tsx|js|jsx)$/,
        include: [
          /solar-core/,
          /solar-pc/,
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
        test: /\.(css|scss)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: { implementation: require('sass') },
          },
          // 隔离插件css对content内容的影响
          require.resolve('./loaders/transfer-scoped-css-loader.js'),
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: { implementation: require('sass') },
          },
          // 隔离插件css对content内容的影响
          require.resolve('./loaders/transfer-scoped-css-loader.js'),
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
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1 * 1024,
          },
        },
      },
    ],
    noParse: function(content) {
      return /whatwg-fetch/.test(content);
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
