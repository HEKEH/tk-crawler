import type { AcceptedPlugin } from 'postcss';
import postcssOKLabFunction from '@csstools/postcss-oklab-function';
import tailwindcss from '@tailwindcss/postcss';
import autoPrefix from 'autoprefixer';
import postcssNesting from 'postcss-nesting';

export function getCommonPostcssConfig(): {
  plugins: AcceptedPlugin[];
} {
  return {
    plugins: [
      tailwindcss(),
      postcssNesting(),
      postcssOKLabFunction(),
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
        // grid: 'autoplace',
        // 添加更多 autoprefixer 选项
        cascade: true, // 保持 CSS 属性的顺序
        add: true, // 添加前缀
        remove: false, // 不移除过时的前缀
        supports: true, // 添加 @supports 规则
      }),
    ],
  };
}
