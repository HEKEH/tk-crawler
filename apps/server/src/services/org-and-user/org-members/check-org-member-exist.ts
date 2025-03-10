import { mysqlClient } from '@tk-crawler/database/mysql';

export async function checkOrgMemberExist(username: string): Promise<boolean> {
  const user = await mysqlClient.prismaClient.orgUser.findFirst({
    where: { username },
  });
  return Boolean(user);
}
