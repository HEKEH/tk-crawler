import type { CommonRequestParams as SharedCommonRequestParams } from '@tk-crawler/shared';
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
import { ElNotification } from 'element-plus';
import { Subject } from 'rxjs';

interface CommonRequestParams<RequestParams>
  extends Omit<SharedCommonRequestParams<RequestParams>, 'onBusinessError'> {
  hideErrorNotify?: boolean;
  secure?: boolean;
  onTokenInvalid?: () => void;
}

export const TokenInvalidSubject = new Subject<void>();

export async function commonRequest<
  ResponseData extends { status_code: number; message?: string },
  RequestParams extends Record<string, any> = Record<string, any>,
>({
  onTokenInvalid,
  hideErrorNotify,
  secure,
  headers,
  ...requestParams
}: CommonRequestParams<RequestParams>): Promise<ResponseData> {
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
      if (!hideErrorNotify) {
        ElNotification.error({
          title: '请求失败',
          message: data.message,
        });
      }
      if (data.status_code === RESPONSE_CODE.TOKEN_INVALID) {
        onTokenInvalid?.();
        TokenInvalidSubject.next();
      }
    }
    return data;
  } catch (error) {
    if (!hideErrorNotify) {
      ElNotification.error({
        title: '请求失败',
        message: (error as any)?.message,
      });
    }
    throw error;
  }
}
