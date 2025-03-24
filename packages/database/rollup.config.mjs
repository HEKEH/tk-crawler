import fs from 'node:fs';
import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

// 外部依赖，不会被打包
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const removeFile = filePath => ({
  name: 'remove-file',
  closeBundle() {
    const file = path.resolve(filePath);
    if (fs.existsSync(file)) {
      fs.rmSync(file, { recursive: true, force: true });
    }
  },
});

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
        declaration: true,
        declarationDir: './dist/types',
      }),
    ],
  },

  // DTS 打包配置
  {
    input: './dist/types/src/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external,
    plugins: [dts(), removeFile('./dist/types')],
  },
];
