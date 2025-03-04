import type {
  UpdateAnchorRequest,
  UpdateAnchorResponse,
} from '@tk-crawler/biz-shared';
import { getConfig } from '../../config';
import { commonPostRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';

export async function updateAnchor(
  data: UpdateAnchorRequest,
): Promise<UpdateAnchorResponse> {
  const url = getUrl({
    baseUrl: getConfig().ownServerUrl,
    path: '/anchor-pool/update-anchor',
  });
  const response = await commonPostRequest<UpdateAnchorResponse>({
    url,
    body: data,
  });
  return response;
}
