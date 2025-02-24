import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { getPrismaEnv } from './get-prisma-env';

async function main() {
  try {
    await getPrismaEnv();
    const rootDir = path.resolve(__dirname, '../../');
    // 构建 schema 文件的路径
    const schemaPath = path.join(rootDir, 'src/mysql/prisma/schema.prisma');

    // 执行 prisma migrate 命令
    execSync(`prisma migrate dev --schema ${schemaPath}`, {
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
