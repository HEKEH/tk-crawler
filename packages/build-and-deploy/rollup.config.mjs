import fs from 'node:fs';
import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { sync } from 'glob';

// import dts from 'rollup-plugin-dts';

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

// function removeFile(filePath) {
//   return {
//     name: 'remove-file',
//     closeBundle() {
//       const file = path.resolve(filePath);
//       if (fs.existsSync(file)) {
//         fs.rmSync(file, { recursive: true, force: true });
//       }
//     },
//   };
// }

// Get all .mts files in the src directory
const sourceFiles = sync('src/**/*.mts');

// Create a config for each source file
const sourceConfigs = sourceFiles.map(inputFile => {
  const relativePath = path.relative('src', inputFile);
  const outputPath = path.join('dist', relativePath);

  return {
    input: inputFile,
    output: [
      {
        file: outputPath.replace('.mts', '.js'),
        format: 'cjs',
      },
      {
        file: outputPath.replace('.mts', '.mjs'),
        format: 'es',
      },
    ],
    external: externalFn,
    plugins: [
      json(),
      commonjs(),
      nodeResolve({
        resolveOnly: moduleId => !externalFn(moduleId),
      }),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: './dist/types',
      }),
    ],
  };
});

// DTS config for type definitions
// const dtsConfig = {
//   input: './dist/types/**/*.d.mts',
//   output: {
//     dir: 'dist/types',
//     format: 'es',
//   },
//   external: externalFn,
//   plugins: [dts(), removeFile('./dist/types')],
// };

export default [...sourceConfigs];
