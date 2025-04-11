import fs from 'node:fs';
import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const packageJSON = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

// 外部依赖，不会被打包
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
  // id.startsWith('@tk-crawler/'); // 正常 @tk-crawler 在packages 这个层面都不打包，在 apps 层面打包; (但database这里不行，因为它不会打包进最终产物，因此它引用的本项目的包，也需要打包)

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
    input: './dist/types/packages/database/src/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: externalFn,
    plugins: [dts(), removeFile('./dist/types')],
  },
];
