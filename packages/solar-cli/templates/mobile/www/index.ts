/**
 * @name web应用程序服务端初始化
 * @description
 *      用於提供webpack打包已经热更新等。
 */
import open from 'open';
import webpack from 'webpack';
import { createResolverProxy } from 'solar-proxy';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { MiddlewareResourceResolver, Registry } from 'node-web-mvc';

const port = 9800;
// 创建一个webpack编译器
const compiler = webpack(require('../build/webpack'));

Registry.launch({
  port: port,
  onLaunch() {
    const url = 'http://localhost:' + port;
    open(url);
    console.log('--------------------------');
    console.log('===> 😊  Starting frontend ...');
    console.log('===>  Environment: ' + process.env.NODE_ENV || 'development');
    console.log('===>  Listening on port: ' + port);
    console.log('===>  Url: ' + url);
    console.log('--------------------------');
  },
  addInterceptors: (registry) => {
  },
  addResourceHandlers(registry) {
    registry
      .addResourceHandler('/**')
      .resourceChain(true)
      .addResolver(new MiddlewareResourceResolver(
        webpackDevMiddleware(compiler, { publicPath: compiler.options.output.publicPath as string }),
        webpackHotMiddleware(compiler),
        createResolverProxy()
      ));
  },
});