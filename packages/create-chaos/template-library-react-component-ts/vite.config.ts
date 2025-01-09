/// <reference types="vitest" />
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';

function resolve(str: string) {
  return path.resolve(__dirname, str);
}

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)).toString()
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    outDir: 'lib',
    minify: false,
    lib: {
      entry: resolve('src/index.ts'),
      name: 'index',
      formats: ['es', 'cjs'],
      fileName: (format: string) => `index.${format}.js`,
    },
    // https://rollupjs.org/configuration-options/#watch
    // watch: {
    // },
    rollupOptions: {
      external: [
        'react/jsx-runtime',
        ...Object.keys(pkg.peerDependencies || {}),
      ].filter(Boolean),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'react-dom',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest-setup.ts',
    coverage: {
      all: false,
      enabled: true,
    },
  },
});
