
class MiniCssExtractHotPlugin {
  constructor(options) {
    this.options = options || { order: 12 };
  }

  apply(compiler) {
    if (compiler.options.mode == 'production') {
      return;
    }
    const { RuntimeGlobals, Template, RuntimeModule } = compiler.webpack;
    compiler.hooks.thisCompilation.tap('MiniCssExtractHotPlugin', compilation => {
      compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.ensureChunkHandlers).tap('MiniCssExtractHotPlugin', (chunk, set) => {
        compilation.addRuntimeModule(chunk, new CssLoadingRuntimeModule(this.options.order));
      });
    });

    class CssLoadingRuntimeModule extends RuntimeModule {
      constructor(order) {
        super('css forbidden miniCss', order);
      }

      generate() {
        return Template.asString([`${RuntimeGlobals.hmrDownloadUpdateHandlers}.miniCss = function(){ }`]);
      }
    }
  }
}

module.exports = MiniCssExtractHotPlugin;