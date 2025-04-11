import type {
  ShouldUpdateAnchorRequest,
  ShouldUpdateAnchorResponse,
} from '@tk-crawler/biz-shared';
import { getConfig } from '../../config';
import { commonRequest } from '../utils/common-request';

/** 判断主播是否需要更新，同时把当前需要更新的主播记录在redis缓存中，防止重复更新导致资源浪费 */
export function shouldUpdateAnchors(
  data: ShouldUpdateAnchorRequest,
): Promise<ShouldUpdateAnchorResponse> {
  return commonRequest<ShouldUpdateAnchorResponse>({
    baseURL: getConfig().ownServerUrl,
    method: 'post',
    path: '/anchor-pool/should-update-anchor',
    params: data,
  });
}
