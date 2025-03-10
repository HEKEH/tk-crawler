import type { CreateOrgMemberRequest } from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError, hashPassword } from '../../../utils';
import { checkOrgMemberExist } from './check-org-member-exist';

export async function createOrgMember(
  data: CreateOrgMemberRequest,
): Promise<void> {
  const { password, ...rest } = data;
  logger.info('[Create Org Member]', { data: { ...rest, password: '******' } });
  const username = rest.username;
  if (await checkOrgMemberExist(username)) {
    throw new BusinessError('登录名已存在');
  }
  const hashedPassword = await hashPassword(password);
  await mysqlClient.prismaClient.orgUser.create({
    data: {
      ...rest,
      password: hashedPassword,
      org_id: BigInt(data.org_id),
    },
  });
}
