import type { Compiler } from 'webpack';

interface WebpackPluginOptions {}

class WebpackPlugin {
  private name: string = 'WebpackPlugin';
  options: WebpackPluginOptions;

  constructor(options: WebpackPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap(
      'WebpackPluginName Plugin',
      (
        stats /* stats is passed as an argument when done hook is tapped.  */,
      ) => {
        console.log('Hello WebpackPluginName Plugin!', this.options);
      },
    );
  }
}

export = WebpackPlugin;
