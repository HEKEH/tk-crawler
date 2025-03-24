import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'plugins',
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: false,
  clean: false,
});
