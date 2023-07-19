import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readFileSync } from 'node:fs';

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

function resolve(str: string) {
  return path.resolve(__dirname, str);
}

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)).toString(),
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    typescript({
      outDir: 'dist',
      target: 'es5',
      rootDir: resolve('src'),
      declaration: true,
      declarationDir: resolve('dist'),
    }),
    commonjs(),
    nodeResolve(),
    terser(),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve('src/index.tsx'),
      name: 'index',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies || {})].filter(Boolean),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'react-dom',
        },
      },
    },
  },
});
