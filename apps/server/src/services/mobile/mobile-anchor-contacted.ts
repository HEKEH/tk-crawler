import type { AnchorContactedRequest } from '@tk-crawler/biz-shared';
import { logger } from '../../infra/logger';
import { BusinessError } from '../../utils';
import { anchorContacted } from '../task';

export async function mobileAnchorContacted(
  data: AnchorContactedRequest & {
    device_id: string;
    org_id: string;
    org_member_id: string | null;
    token_device_id: string | undefined;
  },
): Promise<void> {
  logger.info('[Mobile Anchor Contacted]', { data });
  if (data.token_device_id !== data.device_id) {
    throw new BusinessError('设备不匹配');
  }
  return anchorContacted(data);
}
