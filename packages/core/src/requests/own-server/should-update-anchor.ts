import type {
  ShouldUpdateAnchorRequest,
  ShouldUpdateAnchorResponse,
} from '@tk-crawler/shared';
import { getConfig } from '../../config';
import { commonGetRequest } from '../utils/common-request';
import { getUrl } from '../utils/get-url';

export async function shouldUpdateAnchor(
  data: ShouldUpdateAnchorRequest,
): Promise<boolean> {
  const url = getUrl({
    baseUrl: getConfig().ownServerUrl,
    path: '/anchor-pool/should-update-anchor',
    params: data as unknown as Record<string, string>,
  });
  const response = await commonGetRequest<ShouldUpdateAnchorResponse>({
    url,
  });
  return response.data === 1;
}
