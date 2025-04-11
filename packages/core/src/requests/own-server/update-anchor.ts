import type {
  UpdateAnchorRequest,
  UpdateAnchorResponse,
} from '@tk-crawler/biz-shared';
import { getConfig } from '../../config';
import { commonRequest } from '../utils/common-request';

export async function updateAnchor(
  data: UpdateAnchorRequest,
): Promise<UpdateAnchorResponse> {
  const response = await commonRequest<UpdateAnchorResponse>({
    baseURL: getConfig().ownServerUrl,
    method: 'post',
    path: '/anchor-pool/update-anchor',
    params: data,
  });
  return response;
}
