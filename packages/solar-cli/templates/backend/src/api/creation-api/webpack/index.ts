import { MiddlewareResourceResolver, ResourceHandlerRegistry } from 'node-web-mvc';

const runtime = {
  middleware: null as MiddlewareResourceResolver,
};

function createDevMiddleware() {
  if (runtime.middleware) return runtime.middleware;
  const webpack = require('webpack');
  const compiler = webpack(require('../../../../build/webpack'));
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const { createResolverProxy } = require('solar-proxy');
  const middleware = new MiddlewareResourceResolver(
    webpackDevMiddleware(compiler, { publicPath: compiler.options.output.publicPath as string }),
    webpackHotMiddleware(compiler),
    createResolverProxy({ api: 'x-mobile-proxy', makeMock: true })
  );
  runtime.middleware = middleware;
  return middleware;
}

export default function runWebpack(registry: ResourceHandlerRegistry) {
  registry
    .addResourceHandler('/**')
    .resourceChain(true)
    .addResolver(createDevMiddleware());
}