import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { loadPrismaEnv } from '../../shared/prisma/load-prisma-env';

function main() {
  try {
    loadPrismaEnv();
    const rootDir = path.resolve(__dirname, '../../');
    // 构建 schema 文件的路径
    const schemaPath = path.join(rootDir, './shared/prisma/schema.prisma');

    // 执行 prisma migrate 命令
    execSync(`prisma migrate dev --schema ${schemaPath}`, {
      stdio: 'inherit',
      cwd: rootDir,
    });

    // eslint-disable-next-line no-console
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
