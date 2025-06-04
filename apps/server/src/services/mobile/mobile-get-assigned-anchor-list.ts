import type {
  GetAnchorListFilter,
  MobileGetAssignedAnchorListRequest,
  MobileGetAssignedAnchorListResponse,
} from '@tk-crawler/biz-shared';
import type { Logger } from '@tk-crawler/shared';
import { BusinessError } from '../../utils';
import { getAnchorList } from '../anchor/get-anchor-list';

export async function mobileGetAssignedAnchorList(
  request: MobileGetAssignedAnchorListRequest & {
    org_id: string;
    org_member_id: string;
    token_device_id: string | undefined;
  },
  logger: Logger,
): Promise<MobileGetAssignedAnchorListResponse['data']> {
  logger.info('[Mobile Get Assigned Anchor List]', request);

  const {
    page_num,
    page_size,
    filter: _filter,
    org_id,
    org_member_id,
    token_device_id,
  } = request;

  if (!token_device_id) {
    throw new BusinessError('鉴权失败');
  }
  if (!request.device_id) {
    throw new BusinessError('设备ID不能为空');
  }
  if (token_device_id !== request.device_id) {
    throw new BusinessError('设备不匹配');
  }

  const filter: GetAnchorListFilter = {
    ..._filter,
    assign_to: org_member_id,
    contacted_by: 'not_contacted',
  };

  const result = await getAnchorList(
    {
      page_num,
      page_size,
      filter,
      order_by: {
        checked_at: 'desc',
        // crawled_at: 'desc',
      },
      org_id,
    },
    logger,
  );

  return result;
}
