import { resolve } from 'node:path';
import process from 'node:process';
import { loadPrismaEnv } from '../../shared/prisma/load-prisma-env';

export function loadMysqlEnvironment() {
  const projectRootPath = resolve(process.cwd(), '../../');
  loadPrismaEnv(projectRootPath);
}
