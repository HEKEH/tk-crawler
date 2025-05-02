import fs from 'node:fs';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const packageJSON = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const externalPkgs = [
  ...Object.keys(packageJSON.dependencies || {}),
  ...Object.keys(packageJSON.peerDependencies || {}),
];

// 使用函数形式的 external 配置，更精确地控制
function externalFn(id) {
  // 检查是否在依赖列表中
  const isExternal = externalPkgs.some(
    pkg => id === pkg || id.startsWith(`${pkg}/`),
  );

  if (isExternal) {
    console.log(`Marking as external: ${id}`);
  }

  return isExternal;
}

export default [
  // JavaScript 打包配置 (CJS 和 ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist-raw/index.js',
        format: 'cjs',
      },
      // {
      //   file: 'dist-raw/index.mjs',
      //   format: 'es',
      // },
    ],
    external: externalFn,
    plugins: [
      commonjs(),
      nodeResolve({
        resolveOnly: moduleId => {
          const shouldResolve = !externalFn(moduleId);
          return shouldResolve;
        },
      }),
    ],
  },
];
