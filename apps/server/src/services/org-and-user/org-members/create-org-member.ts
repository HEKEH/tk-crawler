import type { CreateOrgMemberRequest } from '@tk-crawler/biz-shared';
import assert from 'node:assert';
import { mysqlClient } from '@tk-crawler/database';
import { logger } from '../../../infra/logger';
import { BusinessError, hashPassword } from '../../../utils';
import { checkOrgMemberNameExist } from './check-org-member-name-exist';

export async function createOrgMember(
  data: CreateOrgMemberRequest,
): Promise<void> {
  const { password, ...rest } = data;
  rest.username = rest.username?.trim();
  assert(rest.username, 'username is required');
  assert(password, 'password is required');
  logger.info('[Create Org Member]', { data: { ...rest, password: '******' } });
  const username = rest.username;
  if (await checkOrgMemberNameExist(username)) {
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
