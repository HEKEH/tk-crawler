import type {
  DeleteOrgRequest,
  DeleteOrgResponse,
} from '@tk-crawler/biz-shared';
import { commonRequest } from '../../../shared';
import config from '../../config';

export function deleteOrg(
  params: DeleteOrgRequest,
): Promise<DeleteOrgResponse> {
  return commonRequest<DeleteOrgResponse>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/org-and-user/delete-org',
    params,
  });
}
