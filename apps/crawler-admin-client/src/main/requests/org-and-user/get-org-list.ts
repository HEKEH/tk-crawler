import type {
  GetOrgListRequest,
  GetOrgListResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../shared';
import config from '../../config';

export function getOrgList(
  params: GetOrgListRequest,
): Promise<GetOrgListResponse> {
  return commonRequest<GetOrgListResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/org-and-user/get-org-list',
    params,
  });
}
