import { resolve } from 'node:path';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import { loadPrismaEnv } from '../../shared/prisma/load-prisma-env';

export async function runSeed() {
  const projectRootPath = resolve(__dirname, '../../../../');
  loadPrismaEnv(projectRootPath);
  const prisma = new PrismaClient();
  try {
    await prisma.organization.upsert({
      where: {
        id: 1,
      },
      update: {}, // 如果存在则不更新任何内容
      create: {
        id: 1,
        name: '默认机构',
        status: 1, // 设置适当的状态值
      },
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
