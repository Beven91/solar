const path = require('path');
const express = require('express');
const webpack = require('webpack');
const open = require('open');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const compiler = webpack(require('./webpack'));
const port = 18006;
const app = express();

// 托管webpack
// 添加webpack打包服务中间件到app中
app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: compiler.options.output.publicPath,
}));
// 添加webpack热部署中间件到app中
app.use(webpackHotMiddleware(compiler));
// 路由配置
app.use(express.static(path.resolve('www/views/')));
// 启动服务
app.listen(port, function() {
  console.log('--------------------------');
  console.log('===> 😊  Starting Solar Mobile UI ...');
  console.log('===>  Environment: ' + process.env.NODE_ENV || 'development');
  console.log('===>  Listening on port: ' + port);
  console.log('===>  Url: http://localhost:' + port);
  console.log('--------------------------');
  open(`http://localhost:${port}`);
})
;
