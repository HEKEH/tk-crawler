import type { AcceptedPlugin } from 'postcss';
import type { PluginOption } from 'vite';
// import tailwindcss from '@tailwindcss/vite';
import tailwindcss from '@tailwindcss/postcss';
import { svgVueComponentPlugin } from '@tk-crawler/plugins';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import autoPrefix from 'autoprefixer';
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

export function getCommonPostcssConfig(): {
  plugins: AcceptedPlugin[];
} {
  return {
    plugins: [
      tailwindcss(),
      autoPrefix({
        overrideBrowserslist: [
          'last 2 versions',
          'ios >= 10', // 降低 iOS 版本要求
          'safari >= 10', // 降低 Safari 版本要求
          'chrome >= 50', // 添加 Chrome 支持
          'firefox >= 50', // 添加 Firefox 支持
          'edge >= 14', // 添加 Edge 支持
          'not dead',
          'not ie 11', // 明确不支持 IE11
        ],
        flexbox: 'no-2009',
        grid: 'autoplace',
        // 添加更多 autoprefixer 选项
        cascade: true, // 保持 CSS 属性的顺序
        add: true, // 添加前缀
        remove: false, // 不移除过时的前缀
        supports: true, // 添加 @supports 规则
      }),
    ],
  };
}
