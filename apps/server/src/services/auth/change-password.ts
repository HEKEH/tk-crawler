import type {
  OrgMemberChangePasswordRequest,
  OrgMemberItem,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import { simpleDecrypt } from '@tk-crawler/shared';
import config from '../../config';
import { BusinessError, hashPassword, verifyPassword } from '../../utils';

export async function changeOrgUserPassword(
  data: OrgMemberChangePasswordRequest,
  user: OrgMemberItem,
): Promise<void> {
  const old_password = simpleDecrypt(
    data.old_password,
    config.simplePasswordKey,
  );
  const new_password = simpleDecrypt(
    data.new_password,
    config.simplePasswordKey,
  );
  if (!(await verifyPassword(old_password, user.password))) {
    throw new BusinessError('当前密码输入错误, 请重新输入');
  }
  const hashedPassword = await hashPassword(new_password);
  await mysqlClient.prismaClient.orgUser.update({
    where: {
      id: BigInt(user.id),
    },
    data: {
      password: hashedPassword,
    },
  });
}
