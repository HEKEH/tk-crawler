/* eslint-disable no-console */
import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { loadPrismaScriptEnv } from './load-prisma-script-env';

function getAdditionalArgs(): string {
  const args = process.argv;

  // 找到脚本名在参数中的位置
  const scriptIndex = args.findIndex(
    arg => arg.endsWith('migrate.ts') || arg.endsWith('migrate.js'),
  );

  if (scriptIndex === -1) {
    console.warn('Warning: Could not determine script position in arguments');
    return process.argv.slice(2).join(' '); // 降级到简单方案
  }

  // 返回脚本名后的所有参数
  return args.slice(scriptIndex + 1).join(' ');
}

function main() {
  try {
    loadPrismaScriptEnv();
    const rootDir = path.resolve(__dirname, '../../');
    const schemaPath = path.join(rootDir, './shared/prisma/schema.prisma');

    // 使用更可靠的参数获取方法
    const additionalArgs = getAdditionalArgs();

    // 打印命令以便调试
    const command = `prisma migrate dev --schema ${schemaPath} ${additionalArgs}`;
    console.log('Executing command:', command);

    execSync(command, {
      stdio: 'inherit',
      cwd: rootDir,
    });

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
