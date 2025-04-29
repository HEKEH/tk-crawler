import assert from 'node:assert';
import {
  ANCHORS_DOWNLOAD_SIZE_LIMIT,
  type GetAnchorListForDownloadRequest,
  type GetAnchorListForDownloadResponseData,
} from '@tk-crawler/biz-shared';
import { mysqlClient } from '@tk-crawler/database';
import globalConfig from '../../../config';
import { transformAnchorListFilterValues } from './filter';
import { transformAnchorListOrderBy } from './order-by';

export async function getAnchorListForDownload(
  request: GetAnchorListForDownloadRequest & { org_id: string },
): Promise<GetAnchorListForDownloadResponseData> {
  assert(globalConfig.enableDataDownload, '数据导出功能未开启');
  assert(request.org_id, '机构ID不能为空');

  const {
    filter,
    order_by,
    org_id,
    number = ANCHORS_DOWNLOAD_SIZE_LIMIT,
  } = request;
  assert(number <= ANCHORS_DOWNLOAD_SIZE_LIMIT, '导出数量不能超过最大限制');
  const where = transformAnchorListFilterValues(filter, org_id);
  const orderBy = transformAnchorListOrderBy(order_by);

  const anchorInviteChecks =
    await mysqlClient.prismaClient.anchorInviteCheck.findMany({
      where,
      orderBy,
      skip: 0,
      take: number,
      select: {
        anchor: {
          select: {
            user_id: true,
            display_id: true,
          },
        },
      },
    });

  const list: GetAnchorListForDownloadResponseData['list'] =
    anchorInviteChecks.map(item => {
      const { anchor } = item;
      return {
        user_id: anchor.user_id.toString(),
        display_id: anchor.display_id,
      };
    });

  const result = {
    list,
  };

  return result;
}
