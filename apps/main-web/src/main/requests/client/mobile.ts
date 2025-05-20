import type {
  GetMobileDeviceListRequest,
  GetMobileDeviceListResponse,
} from '@tk-crawler/biz-shared';

import { CLIENT_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import {
  ClientGetMobileDeviceList,
  OwnServerUrl,
  Post,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getMobileDeviceList(
  params: GetMobileDeviceListRequest,
  token: string,
) {
  return commonRequest<GetMobileDeviceListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: ClientGetMobileDeviceList,
    params,
    headers: {
      [CLIENT_TOKEN_HEADER_KEY]: token,
    },
  });
}
