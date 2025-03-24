import { readFileSync } from 'node:fs';
import path from 'node:path';
import { compileTemplate } from '@vue/compiler-sfc';
import { optimize } from 'svgo';
// import removeColor from './svgo-remove-color';

export function svgVueComponentPlugin() {
  return {
    name: 'vite-plugin-svg-vue-component',
    transform(code: string, id: string) {
      if (!id.endsWith('.svg')) {
        return null;
      }

      const svg = readFileSync(id, 'utf8');
      const { data } = optimize(svg, {
        plugins: [
          'removeDoctype',
          'removeXMLProcInst',
          'removeComments',
          'removeMetadata',
          'removeEditorsNSData',
          'cleanupAttrs',
          'removeEmptyAttrs',
          // removeColor,
        ],
      });

      const { code: templateCode } = compileTemplate({
        id,
        source: data,
        transformAssetUrls: false,
        filename: id,
      });

      const fileName = path.basename(id, '.svg');
      const componentName = fileName.replace(/[^a-z0-9]/gi, '');

      const componentCode = `
        ${templateCode}
        export default {
          name: '${componentName}Icon',
          render: render,
        }
      `;

      return {
        code: componentCode,
        map: null,
      };
    },
  };
}
