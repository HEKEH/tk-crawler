import type {
  UpdateOrgRequest,
  UpdateOrgResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../shared';
import config from '../../config';

export function updateOrg(
  params: UpdateOrgRequest,
): Promise<UpdateOrgResponse> {
  return commonRequest<UpdateOrgResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/org-and-user/update-org',
    params,
  });
}
