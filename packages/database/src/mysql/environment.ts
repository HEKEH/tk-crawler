import { join } from 'node:path';
import process from 'node:process';
import { config } from 'dotenv';
import { loadPrismaEnv } from '../../shared/prisma/load-prisma-env';

export function loadMysqlEnvironment() {
  config(
    process.env.NODE_ENV === 'production'
      ? { path: join(__dirname, '../../.env.production') }
      : { path: join(__dirname, '../../.env.development') },
  );
  loadPrismaEnv();
}
