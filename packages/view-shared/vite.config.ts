import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: [
        'src/components/virtualized-table/**/*.ts',
        'src/components/virtualized-table/**/*.vue',
      ],
      outDir: 'dist/types',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/virtualized-table/index.ts'),
      name: 'VirtualizedTable',
      fileName: format => `virtualized-table.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'element-plus', 'vxe-table', '@vueuse/core'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          'vxe-table': 'VxeTable',
          '@vueuse/core': 'VueUse',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
});
