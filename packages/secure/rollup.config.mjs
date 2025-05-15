import fs from 'node:fs';
import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import obfuscator from 'rollup-plugin-obfuscator';

const packageJSON = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const externalPkgs = [
  ...Object.keys(packageJSON.dependencies || {}),
  ...Object.keys(packageJSON.peerDependencies || {}),
];

function externalFn(id) {
  const isExternal = externalPkgs.some(
    pkg => id === pkg || id.startsWith(`${pkg}/`),
  );
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
  // JavaScript 打包配置 (ES5)
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
      obfuscator({
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 1,
          stringArray: true,
          stringArrayEncoding: ['base64', 'rc4'],
          stringArrayThreshold: 1,
          splitStrings: true,
          splitStringsChunkLength: 3,
          transformObjectKeys: true,
          renameGlobals: true, // 注意兼容性
          selfDefending: true,
          disableConsoleOutput: false,
          numbersToExpressions: true,
          simplify: false,
          // 你可以根据需要调整
        },
      }),
    ],
  },
  // DTS 打包配置
  {
    input: './dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: externalFn,
    plugins: [dts(), removeFile('./dist/types')],
  },
];
