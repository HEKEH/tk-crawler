import type { MessageCenter } from './message-center';
import { CrawlerMessage, RequestErrorType } from '../types';

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

export function tiktokRequestErrorHandler<T>(
  requestPromise: Promise<T>,
  messageCenter: MessageCenter,
) {
  return requestPromise.catch(error => {
    messageCenter.emit(
      CrawlerMessage.REQUEST_ERROR,
      getRequestErrorType(error),
    );
    throw error;
  });
}
