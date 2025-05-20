import type {
  DeleteMobileDeviceRequest,
  DeleteMobileDeviceResponse,
  GetMobileDeviceListRequest,
  GetMobileDeviceListResponse,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';
import {
  OwnServerUrl,
  Post,
  SystemDeleteMobileDevice,
  SystemGetMobileDeviceList,
} from '@tk-crawler/secure';
import { commonRequest } from '@tk-crawler/view-shared';
import config from '../../config';

export function getMobileDeviceList(
  params: GetMobileDeviceListRequest & { org_id: string },
  token: string,
) {
  return commonRequest<GetMobileDeviceListResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemGetMobileDeviceList,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}

export function deleteMobileDevice(
  params: DeleteMobileDeviceRequest,
  token: string,
) {
  return commonRequest<DeleteMobileDeviceResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemDeleteMobileDevice,
    params,
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
  });
}
