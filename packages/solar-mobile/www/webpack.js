/**
 * 名称：Webpack打包客户端
 * 描述：用于进行客户端代码打包
 */

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');

// Webpack 插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 当前webpack打包context
const context = path.resolve('');

module.exports = {
  devtool: 'source-map',
  name: 'solar-mobile',
  context: context,
  mode: 'development',
  stats: {
    children: false, chunks: false, assets: false, modules: false,
  },
  entry: {
    app: [
      'webpack-hot-middleware/client?path=./__webpack_hmr&timeout=20000&reload=true',
      './__tests__/app.tsx',
    ],
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({ filename: 'app.css', allChunks: true }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [
          /components/,
          /__tests__/,
        ],
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        include: [
          /src/,
          /__tests__/,
          /react-navigation/,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['module:metro-react-native-babel-preset'],
              plugins: [
                ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                [
                  'refer-import',
                  {
                    modules: [
                      { 'libraryName': 'solar-core', 'style': false, 'libraryDirectory': 'src' },
                      { 'libraryName': 'antd-mobile', 'style': 'css' },
                    ],
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.(svg)$/i,
        use: 'web-svg-sprite-loader',
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
            loader: 'sass-loader',
            options: { implementation: require('sass') },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                autoprefixer({
                  browsers: ['iOS >= 8', 'Android >= 4'],
                }),
                pxtorem({ minPixelValue: 1.1, rootValue: 37.5, propWhiteList: [] }),
              ],
            },
          },
        ],
      },
      {
        // url类型模块资源访问
        test: /\.(png|jpg|jpeg|gif|webp|bmp|ico|jpeg|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[hash].[ext]',
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.web.js', '.js', '.ts', '.tsx'],
  },
};
