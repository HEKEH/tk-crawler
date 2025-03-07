import type { CreateOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { hashPassword } from '../../../utils';

export async function createOrgMember(
  data: CreateOrgMemberRequest,
): Promise<void> {
  const { password, ...rest } = data;
  logger.info('[Create Org Member]', { data: { ...rest, password: '******' } });
  const hashedPassword = await hashPassword(password);
  await mysqlClient.prismaClient.orgUser.create({
    data: {
      ...rest,
      password: hashedPassword,
      org_id: BigInt(data.org_id),
    },
  });
}
