import path from 'path';
import { HandlerInterceptorRegistry, MiddlewareResourceResolver, ResourceHandlerRegistry, WebMvcConfigurationSupport } from 'node-web-mvc';

const isProduction = process.env.NODE_ENV == 'production';

export default class WebAppConfigurer extends WebMvcConfigurationSupport {
  constructor() {
    super({
      port: 8080,
      resource: {
        gzipped: true,
      },
      cwd: path.resolve('src/api/$projectName$-api'),
      swagger: !isProduction,
      hot: isProduction ? null : {
        cwd: path.resolve('src/api/'),
      },
    });
  }

  onLaunch = () => {
    const port = this.port;
    const url = `http://localhost:${port}`;
    // open(url);
    console.log('--------------------------');
    console.log('===> 😊  Starting frontend ...');
    console.log(`===>  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===>  Listening on port: ${port}`);
    console.log(`===>  Url: ${url}`);
    console.log('--------------------------');
  }

  /**
   * 调试环境，启动webpack服务。
   * @param registry
   */
  private devWebpack(registry: ResourceHandlerRegistry) {
    const webpack = require('webpack');
    const compiler = webpack(require('../../../build/webpack'));
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const { createResolverProxy } = require('solar-proxy');

    registry.addResourceHandler('/resources/**').addResourceLocations(path.resolve('appdata'));

    registry
      .addResourceHandler('/**')
      .resourceChain(true)
      .addResolver(new MiddlewareResourceResolver(
        webpackDevMiddleware(compiler, { publicPath: compiler.options.output.publicPath as string }),
        webpackHotMiddleware(compiler),
        createResolverProxy({ api: 'x-mobile-proxy', makeMock: true })
      ));
  }

  public addResourceHandlers(registry: ResourceHandlerRegistry): void {
    if (!isProduction) {
      this.devWebpack(registry);
    }
  }

  public addInterceptors(registry: HandlerInterceptorRegistry): void {

  }
}