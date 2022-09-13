import path from 'path';
import { HandlerInterceptorRegistry, ResourceHandlerRegistry, WebMvcConfigurationSupport } from 'node-web-mvc';
import runWebpack from './webpack'

const isDevelopment = process.env.NODE_ENV == 'development';

export default class WebAppConfigurer extends WebMvcConfigurationSupport {
  constructor() {
    super({
      port: 8080,
      resource: {
        gzipped: true,
      },
      cwd: path.resolve('src/api/$projectName$-api'),
      swagger: isDevelopment,
      hot: isDevelopment && {
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

  public addResourceHandlers(registry: ResourceHandlerRegistry): void {
    if (isDevelopment) {
      runWebpack(registry);
    }
  }

  public addInterceptors(registry: HandlerInterceptorRegistry): void {

  }
}