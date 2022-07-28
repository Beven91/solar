/**
 * @name 小程序应用程序服务端初始化
 * @description
 *      用於提供webpack打包已经热更新等。
 */
import webpack from 'webpack';
import { createResolverProxy } from 'solar-proxy';
import webpackDevMiddleware from 'webpack-dev-middleware';
import { MiddlewareResourceResolver, Registry } from 'node-web-mvc';

const port = 9806;
// 创建一个webpack编译器
const compiler = webpack(require('../build/webpack'));

Registry.launch({
  port: port,
  onLaunch() {
    console.log('--------------------------');
    console.log('===> 😊  Starting wxapp ...');
    console.log('===>  Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('===>  Listening on port: ' + port);
    console.log('--------------------------');
  },
  addInterceptors: (registry) => {
  },
  addResourceHandlers(registry) {
    const publicPath = compiler.options.output.publicPath as string;
    registry
      .addResourceHandler('/**')
      .resourceChain(true)
      .addResolver(new MiddlewareResourceResolver(
        webpackDevMiddleware(compiler, { writeToDisk: true, publicPath: publicPath }),
        createResolverProxy(),
      ));
  },
});
