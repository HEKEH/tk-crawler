import type {
  ShouldUpdateAnchorRequest,
  ShouldUpdateAnchorResponse,
} from '@tk-crawler/biz-shared';
import { getUrl } from '@tk-crawler/shared';
import { getConfig } from '../../config';
import { commonPostRequest } from '../utils/common-request';

/** 判断主播是否需要更新，同时把当前需要更新的主播记录在redis缓存中，防止重复更新导致资源浪费 */
export function shouldUpdateAnchors(
  data: ShouldUpdateAnchorRequest,
): Promise<ShouldUpdateAnchorResponse> {
  const url = getUrl({
    baseUrl: getConfig().ownServerUrl,
    path: '/anchor-pool/should-update-anchor',
  });
  return commonPostRequest<ShouldUpdateAnchorResponse>({
    url,
    body: data,
  });
}
