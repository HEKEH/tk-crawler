import { mysqlClient } from '@tk-crawler/database/mysql';

export async function checkOrgNameExist(orgName: string): Promise<boolean> {
  const org = await mysqlClient.prismaClient.organization.findFirst({
    where: { name: orgName },
  });
  return Boolean(org);
}
