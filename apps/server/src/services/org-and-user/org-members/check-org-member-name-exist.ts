import { mysqlClient } from '@tk-crawler/database/mysql';

export async function checkOrgMemberNameExist(
  username: string,
): Promise<boolean> {
  const user = await mysqlClient.prismaClient.orgUser.findFirst({
    where: { username },
  });
  return Boolean(user);
}
