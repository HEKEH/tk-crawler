import type { PluginOption } from 'vite';
// import tailwindcss from '@tailwindcss/vite';
import { svgVueComponentPlugin } from '@tk-crawler/plugins';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import';

const ViteVxeLazyImportPlugin = lazyImport({
  resolvers: [
    VxeResolver({
      libraryName: 'vxe-table',
    }),
  ],
});

export function getCommonVitePlugins(_: {
  packageJSON: Record<string, any>;
}): PluginOption[] {
  return [
    vue(),
    vueJsx(),
    svgVueComponentPlugin(),
    // tailwindcss(),
    // cssInjectedByJsPlugin({
    //   styleId: `${packageJSON.name}-style`,
    //   relativeCSSInjection: true, // for multiple format
    // }),
    ViteVxeLazyImportPlugin,
  ];
}
