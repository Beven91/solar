/**
 * @name Chrome扩展程序应用开发服务
 * @description
 *      使用express作为服务端程序，
 *      用於提供webpack打包已经热更新等。
 */
import open from 'open';
import webpack from 'webpack';
import { createResolverProxy } from 'solar-proxy';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { MiddlewareResourceResolver, Registry } from 'node-web-mvc';

const port = process.env.NODE_WEB_PORT = '9803';
// 创建一个webpack编译器
const compiler = webpack(require('../build/webpack'));

Registry.launch({
  port: port as any,
  onLaunch() {
    const url = 'http://localhost:' + port + '#welcome';
    open(url);
    console.log('--------------------------');
    console.log('===> 😊  Starting Chrome Extensions Developer Server ...');
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
        webpackDevMiddleware(compiler, { writeToDisk: true, publicPath: compiler.options.output.publicPath as string }),
        webpackHotMiddleware(compiler),
        createResolverProxy()
      ));
  },
});
