/**
 * @name 移动端H5应用打包配置文件
 */
import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

// 是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';
// 发布目标目录
const releaseDir = path.resolve('dist');

// 开发环境plugins
const devPlugins = [
  new ReactRefreshWebpackPlugin(),
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
      isProduction ? null : 'webpack-hot-middleware/client',
      'core-js/stable',
      './packages/$projectName$/index.tsx',
    ].filter(function(v) {
      return v;
    }),
  },
  output: {
    path: releaseDir,
    filename: isProduction ? '[name]-[chunkhash].js' : '[name].js',
    chunkFilename: isProduction ? '[name]-[chunkhash].js' : '[name].js',
    assetModuleFilename: './assets/[hash].[ext]',
    publicPath: '',
    environment: {
      // The environment supports arrow functions ('() => { ... }').
      arrowFunction: false,
      // The environment supports BigInt as literal (123n).
      bigIntLiteral: false,
      // The environment supports const and let for variable declarations.
      const: false,
      // The environment supports destructuring ('{ a, b } = obj').
      destructuring: false,
      // The environment supports an async import() function to import EcmaScript modules.
      dynamicImport: false,
      // The environment supports 'for of' iteration ('for (const x of array) { ... }').
      forOf: false,
      // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
      module: false,
    },
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
    new MiniCssExtractPlugin({ filename: isProduction ? '[name]-[chunkhash].css' : '[name].css' }),
  ],
  module: {
    rules: [
      {
        // jsx 以及js
        test: /\.(ts|tsx|js)$/,
        include: [
          /solar-core/,
          /solar-mobile/,
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
        test: /\.(svg)$/i,
        loader: 'web-svg-sprite-loader',
        include: [
          path.resolve('node_modules/antd-mobile'),
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
                  autoprefixer({
                    // browsers: ['iOS >= 8', 'Android >= 4'],
                  }),
                  pxtorem({ minPixelValue: 1.1, rootValue: 37.5, propWhiteList: [] }),
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
