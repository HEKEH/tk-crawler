import type {
  CreateOrUpdateAnchorFrom87Request,
  CreateOrUpdateAnchorFrom87Response,
} from '@tk-crawler/biz-shared';

import config from '../../config';
import { commonRequest } from '../common-request';

export function createOrUpdateAnchorFrom87(
  params: CreateOrUpdateAnchorFrom87Request,
): Promise<CreateOrUpdateAnchorFrom87Response> {
  return commonRequest<CreateOrUpdateAnchorFrom87Response>({
    baseURL: config.ownServerUrl,
    method: 'post',
    path: '/follow-help/create-or-update-anchor',
    params,
  });
}
