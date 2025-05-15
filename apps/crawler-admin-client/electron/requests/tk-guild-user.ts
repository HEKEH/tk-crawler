import type {
  StartTKLiveAdminAccountRequest,
  StartTKLiveAdminAccountResponse,
} from '@tk-crawler/biz-shared';
import { SYSTEM_TOKEN_HEADER_KEY } from '@tk-crawler/biz-shared';

import { commonRequest } from '@tk-crawler/electron-utils/main';

import {
  OwnServerUrl,
  Post,
  SystemStartTKGuildUserAccount,
} from '@tk-crawler/secure';
import { RESPONSE_CODE } from '@tk-crawler/shared';
import { getFactionIdAndArea } from '@tk-crawler/tk-requests';
import config from '../config';
import { logger } from '../infra';

// Start TK Guild User
export async function startTKGuildUserAccount(
  params: Omit<StartTKLiveAdminAccountRequest, 'faction_id' | 'area'>,
  token: string,
) {
  const resp = await getFactionIdAndArea(params.cookie, logger);
  if (!resp) {
    return {
      status_code: RESPONSE_CODE.SERVER_ERROR,
      message: '获取用户信息失败，可能是网络问题，请稍后重试',
    };
  }
  logger.info(
    `[startTKGuildUserAccount] getFactionIdAndArea: ${resp.factionId} ${resp.area}`,
  );
  return commonRequest<StartTKLiveAdminAccountResponse>({
    baseURL: config[OwnServerUrl],
    method: Post,
    path: SystemStartTKGuildUserAccount,
    params: {
      ...params,
      faction_id: Number(resp.factionId),
      area: resp.area,
    },
    secure: true,
    headers: {
      [SYSTEM_TOKEN_HEADER_KEY]: token,
    },
    logger,
  });
}
