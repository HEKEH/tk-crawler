import fs from 'node:fs';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

// 外部依赖，不会被打包
const externalPkgs = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
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
        file: 'dist/index.js',
        format: 'cjs',
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
      },
    ],
    external: externalFn,
    plugins: [
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
        declaration: false,
      }),
      terser({
        compress: {
          dead_code: true,
          drop_console: false, // 设置为 true 可以移除 console.* 调用
          drop_debugger: true,
          pure_funcs: [], // 可以指定被视为副作用的函数
        },
        format: {
          comments: false, // 移除注释
        },
        mangle: true, // 混淆变量名
      }),
    ],
  },
];
