import type {
  DeleteAutoFollowMobileDeviceRequest,
  DeleteAutoFollowMobileDeviceResponse,
  GetAutoFollowMobileDeviceListResponse,
  GetMobileDeviceListRequest,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import {
  OwnServerUrl,
  Post,
  SystemDeleteAutoFollowMobileDevice,
  SystemGetAutoFollowMobileDeviceList,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getAutoFollowMobileDeviceList(
  params: GetMobileDeviceListRequest & { org_id: string },
  token: string,
) {
  return commonRequest<GetAutoFollowMobileDeviceListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemGetAutoFollowMobileDeviceList,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function deleteAutoFollowMobileDevice(
  params: DeleteAutoFollowMobileDeviceRequest,
  token: string,
) {
  return commonRequest<DeleteAutoFollowMobileDeviceResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemDeleteAutoFollowMobileDevice,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
