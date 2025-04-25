import type { MessageCenter } from '@tk-crawler/shared';
import { RequestErrorType, TKRequestMessage } from '../types';

export function isTiktokRequestEconnreset(error: any) {
  return error?.code === 'ECONNRESET';
}

export function isTiktokRequestTimeout(error: any) {
  return error?.code === 'ETIMEDOUT';
}

export function getRequestErrorType(error: any) {
  if (isTiktokRequestEconnreset(error)) {
    return RequestErrorType.TIKTOK_REQUEST_ECONNRESET;
  }
  if (isTiktokRequestTimeout(error)) {
    return RequestErrorType.TIKTOK_REQUEST_TIMEOUT;
  }
  return RequestErrorType.NORMAL_REQUEST_ERROR;
}

export function tiktokRequestErrorHandler<
  T extends {
    status_code?: number;
    message?: string;
  },
>(requestPromise: Promise<T>, messageCenter: MessageCenter) {
  return requestPromise
    .then(result => {
      if ('status_code' in result && result.status_code !== 0) {
        messageCenter.emit(
          TKRequestMessage.REQUEST_ERROR,
          RequestErrorType.NORMAL_REQUEST_ERROR,
        );
      }
      return result;
    })
    .catch(error => {
      messageCenter.emit(
        TKRequestMessage.REQUEST_ERROR,
        getRequestErrorType(error),
      );
      throw error;
    });
}
