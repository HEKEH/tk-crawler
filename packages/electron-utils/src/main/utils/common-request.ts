import type {
  Logger,
  CommonRequestParams as SharedCommonRequestParams,
} from '@tk-crawler/shared';
import {
  NONCE_HEADER_KEY,
  SECURITY_HEADER_KEY,
  TIMESTAMP_HEADER_KEY,
} from '@tk-crawler/biz-shared';
import { generateNonce, hashRequest } from '@tk-crawler/secure';
import {
  RESPONSE_CODE,
  commonRequest as sharedCommonRequest,
} from '@tk-crawler/shared';

interface CommonRequestParams<RequestParams>
  extends Omit<SharedCommonRequestParams<RequestParams>, 'onBusinessError'> {
  logger: Logger;
  secure?: boolean;
  onTokenInvalid?: () => void;
}

export async function commonRequest<
  ResponseData extends { status_code: number; message?: string },
  RequestParams extends Record<string, any> = Record<string, any>,
>(params: CommonRequestParams<RequestParams>): Promise<ResponseData> {
  const { onTokenInvalid, logger, secure, headers, ...requestParams } = params;
  try {
    let _headers = headers;
    if (secure) {
      const timestamp = Date.now();
      const nonce = generateNonce();
      const secureString = await hashRequest({
        path: requestParams.path,
        params: requestParams.params,
        timestamp,
        nonce,
        method: requestParams.method.toLowerCase() as 'get' | 'post',
      });
      _headers = {
        ...headers,
        [SECURITY_HEADER_KEY]: secureString,
        [TIMESTAMP_HEADER_KEY]: timestamp.toString(),
        [NONCE_HEADER_KEY]: nonce,
      };
    }
    const data = await sharedCommonRequest<ResponseData>({
      ...requestParams,
      headers: _headers,
    });
    if (data.status_code !== RESPONSE_CODE.SUCCESS) {
      logger.error({
        message: data.message,
      });
      if (data.status_code === RESPONSE_CODE.TOKEN_INVALID) {
        onTokenInvalid?.();
      }
    }
    return data;
  } catch (e) {
    logger.error('[commonRequest] 请求失败', e);
    throw e;
  }
}
