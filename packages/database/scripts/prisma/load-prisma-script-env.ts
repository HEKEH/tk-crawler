import path from 'node:path';
import process from 'node:process';
import { loadPrismaEnv } from '../../shared/prisma/load-prisma-env';

export function loadPrismaScriptEnv() {
  try {
    const projectRootPath = path.resolve(__dirname, '../../../../');
    loadPrismaEnv(projectRootPath);
  } catch (error) {
    console.error('Load prisma script env failed:', error);
    process.exit(1);
  }
}
