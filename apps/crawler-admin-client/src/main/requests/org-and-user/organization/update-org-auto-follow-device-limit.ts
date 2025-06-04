import {
  SYSTEM_TOKEN_HEADER_KEY,
  type UpdateOrgAutoFollowDeviceLimitRequest,
  type UpdateOrgAutoFollowDeviceLimitResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../../config';

export function updateOrgAutoFollowDeviceLimit(
  params: UpdateOrgAutoFollowDeviceLimitRequest,
  token: string,
): Promise<UpdateOrgAutoFollowDeviceLimitResponse> {
  return commonRequest<UpdateOrgAutoFollowDeviceLimitResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    secure: true,
    path: '/admin/org-and-user/update-org-auto-follow-device-limit',
    params,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
