import type { CommonRequestParams as SharedCommonRequestParams } from '@tk-crawler/shared';
import {
  RESPONSE_CODE,
  commonRequest as sharedCommonRequest,
} from '@tk-crawler/shared';
import { ElNotification } from 'element-plus';
import { Subject } from 'rxjs';

interface CommonRequestParams<RequestParams>
  extends Omit<SharedCommonRequestParams<RequestParams>, 'onBusinessError'> {
  hideErrorNotify?: boolean;
  onTokenInvalid?: () => void;
}

export const TokenInvalidSubject = new Subject<void>();

export async function commonRequest<
  ResponseData extends { status_code: number; message?: string },
  RequestParams extends Record<string, any> = Record<string, any>,
>({
  onTokenInvalid,
  hideErrorNotify,
  ...requestParams
}: CommonRequestParams<RequestParams>): Promise<ResponseData> {
  const data = await sharedCommonRequest<ResponseData>(requestParams);
  if (data.status_code !== RESPONSE_CODE.SUCCESS) {
    if (!hideErrorNotify) {
      ElNotification.error({
        message: data.message,
      });
    }
    if (data.status_code === RESPONSE_CODE.TOKEN_INVALID) {
      onTokenInvalid?.();
      TokenInvalidSubject.next();
    }
  }
  return data;
}
