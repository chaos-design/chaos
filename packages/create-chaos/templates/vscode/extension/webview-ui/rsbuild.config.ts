import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact(),
  ],
  html: {
    title: 'Create',
  },
  output: {
    sourceMap: {
      js: false,
    },
    distPath: {
      js: 'js',
      css: 'css',
    },
    filename: {
      js: '[name].js',
      css: '[name].css',
    }
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  tools: {
  }
});
