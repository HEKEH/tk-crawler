import type { Area, Region } from '@tk-crawler/biz-shared';
import { getAreaByRegion } from '@tk-crawler/biz-shared';
import { mysqlClient, Prisma } from '@tk-crawler/database';
import { logger } from '../../infra/logger';

export interface UpdateAnchorAreaData {
  user_id: bigint;
  area: Area | null;
  updated_at: Date;
}

const LIMIT = 1000;

export async function updateAnchorArea(region: Region) {
  try {
    const result = await mysqlClient.prismaClient.$transaction(async tx => {
      const anchors = await tx.anchor.findMany({
        where: {
          area: null,
          region,
        },
        select: {
          user_id: true,
          region: true,
          updated_at: true,
        },
        take: LIMIT,
      });
      logger.info('[UpdateAnchorArea]', `${anchors.length}条`);
      logger.info([anchors[0], '...']);
      if (anchors.length === 0) {
        return {
          count: 0,
        };
      }
      const area = getAreaByRegion(region);
      const res = await tx.$executeRaw`
        UPDATE Anchor
        SET area = ${area}
        WHERE user_id IN (${Prisma.join(anchors.map(a => a.user_id))})
      `;
      logger.info('[UpdateAnchorArea Result]', res);
      return {
        count: anchors.length,
      };
    });
    logger.info('[UpdateAnchorArea Result]', result);
    return result;
  } catch (error) {
    logger.error('[UpdateAnchorArea Error]', error);
    throw error;
  }
}

export async function restoreAnchorArea() {
  try {
    return await mysqlClient.prismaClient.$transaction(async tx => {
      const anchors = await tx.anchor.findMany({
        where: {
          area: 'void',
        },
        select: {
          user_id: true,
          updated_at: true,
        },
        take: LIMIT,
      });
      logger.info('[RestoreAnchorArea]', `${anchors.length}条`);
      logger.info([anchors[0], '...']);
      if (anchors.length === 0) {
        return {
          count: 0,
        };
      }
      const res = await Promise.all(
        anchors.map(anchor => {
          return tx.anchor.update({
            where: { user_id: anchor.user_id },
            data: {
              area: null,
              updated_at: anchor.updated_at,
            },
          });
        }),
      );
      logger.info('[RestoreAnchorArea Result]', [res[0], '...']);
      return {
        count: anchors.length,
      };
    });
  } catch (error) {
    logger.error('[RestoreAnchorArea Error]', error);
    throw error;
  }
}
