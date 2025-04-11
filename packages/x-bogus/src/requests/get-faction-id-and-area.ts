import type { Area } from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { startup } from './startup';

export async function getFactionIdAndArea(
  cookie: string,
  logger: Logger,
): Promise<{ factionId: string; area: Area } | null> {
  const startupResponse = await startup(cookie, logger);
  if (startupResponse?.user?.unionID) {
    return {
      factionId: startupResponse.user.unionID,
      area: startupResponse.union.region as Area,
    };
  }
  return null;
}
