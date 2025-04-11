import fs from 'node:fs';
import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

// 改进的外部依赖配置
const externalPkgs = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// 使用函数形式的 external 配置，更精确地控制
function externalFn(id) {
  // 检查是否在依赖列表中
  const isExternal =
    externalPkgs.some(pkg => id === pkg || id.startsWith(`${pkg}/`)) ||
    id.startsWith('@tk-crawler/'); // 所有的 @tk-crawler 在packages 这个层面都不打包，在 apps 层面打包

  if (isExternal) {
    console.log(`Marking as external: ${id}`);
  }

  return isExternal;
}

function removeFile(filePath) {
  return {
    name: 'remove-file',
    closeBundle() {
      const file = path.resolve(filePath);
      if (fs.existsSync(file)) {
        fs.rmSync(file, { recursive: true, force: true });
      }
    },
  };
}

// // 添加调试插件
// function debugPlugin() {
//   return {
//     name: 'debug-plugin',
//     resolveId(source, importer) {
//       if (source.includes('tk-crack')) {
//         console.log(`Resolving: ${source} from ${importer}`);
//       }
//       return null;
//     },
//   };
// }

export default [
  // JavaScript 打包配置 (CJS 和 ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        preserveModules: false,
        exports: 'named',
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        preserveModules: false,
        exports: 'named',
      },
    ],
    external: externalFn,
    plugins: [
      // debugPlugin(),
      json(),
      commonjs(),
      nodeResolve({
        resolveOnly: moduleId => {
          const shouldResolve = !externalFn(moduleId);
          return shouldResolve;
        },
      }),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: './dist/types',
      }),
    ],
  },

  // DTS 打包配置
  {
    input: './dist/types/packages/tk-requests/src/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: externalFn,
    plugins: [dts(), removeFile('./dist/types')],
  },
];
