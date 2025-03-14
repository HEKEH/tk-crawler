import type { CommonRequestParams as SharedCommonRequestParams } from '@tk-crawler/shared';
import {
  RESPONSE_CODE,
  commonRequest as sharedCommonRequest,
} from '@tk-crawler/shared';
import { logger } from '../infra/logger';

interface CommonRequestParams<RequestParams>
  extends Omit<SharedCommonRequestParams<RequestParams>, 'onBusinessError'> {
  onTokenInvalid?: () => void;
}

export async function commonRequest<
  ResponseData extends { status_code: number; message?: string },
  RequestParams extends Record<string, any> = Record<string, any>,
>({
  onTokenInvalid,
  ...requestParams
}: CommonRequestParams<RequestParams>): Promise<ResponseData> {
  const data = await sharedCommonRequest<ResponseData>(requestParams);
  if (data.status_code !== RESPONSE_CODE.SUCCESS) {
    logger.error({
      message: data.message,
    });
    if (data.status_code === RESPONSE_CODE.TOKEN_INVALID) {
      onTokenInvalid?.();
    }
  }
  return data;
}
