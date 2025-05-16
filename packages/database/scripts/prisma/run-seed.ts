import { resolve } from 'node:path';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import { SystemUserRole } from '@tk-crawler/biz-shared';
import { hashPassword } from '@tk-crawler/server-shared';
import { loadPrismaEnv } from '../../shared/prisma/load-prisma-env';

export async function runSeed() {
  const projectRootPath = resolve(__dirname, '../../../../');
  loadPrismaEnv(projectRootPath);
  const prisma = new PrismaClient();
  const systemAdminUsername = process.env.SYSTEM_ADMIN_USERNAME;
  const systemAdminPassword = process.env.SYSTEM_ADMIN_PASSWORD;
  if (!systemAdminUsername || !systemAdminPassword) {
    throw new Error(
      'SYSTEM_ADMIN_USERNAME or SYSTEM_ADMIN_PASSWORD is not set',
    );
  }
  try {
    await Promise.all([
      prisma.organization.upsert({
        where: {
          id: 1,
        },
        update: {}, // 如果存在则不更新任何内容
        create: {
          id: 1,
          name: '默认机构',
          status: 1, // 设置适当的状态值
        },
      }),
      prisma.systemAdminUser.upsert({
        where: {
          username: systemAdminUsername,
        },
        update: {},
        create: {
          username: systemAdminUsername,
          password: await hashPassword(systemAdminPassword),
          role_id: SystemUserRole.ADMIN,
        },
      }),
    ]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
