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
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

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
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
      }),
      json(),
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
