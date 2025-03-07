import type {
  CreateOrgRequest,
  CreateOrgResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../../shared';
import config from '../../../config';

export function createOrg(
  params: CreateOrgRequest,
): Promise<CreateOrgResponse> {
  return commonRequest<CreateOrgResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/admin/org-and-user/create-org',
    params,
  });
}
