import type { Compiler } from 'webpack';

type WebpackPluginOptions = {};

class WebpackPlugin {
  options: WebpackPluginOptions;

  constructor(options: WebpackPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap(
      'WebpackPluginName Plugin',
      (
        _stats /* stats is passed as an argument when done hook is tapped.  */,
      ) => {
        console.log('Hello WebpackPluginName Plugin!', this.options);
      },
    );
  }
}

export = WebpackPlugin;
