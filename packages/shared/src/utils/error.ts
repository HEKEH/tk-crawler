import type { MessageCenter } from './message-center';
import { CrawlerMessage } from '../types';

export function isTiktokRequestEconnresetOrTimeout(error: any) {
  return error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET';
}

export function tiktokRequestErrorHandler<T>(
  requestPromise: Promise<T>,
  messageCenter: MessageCenter,
) {
  return requestPromise.catch(error => {
    if (isTiktokRequestEconnresetOrTimeout(error)) {
      messageCenter.emit(CrawlerMessage.TIKTOK_REQUEST_ECONNRESET_OR_TIMEOUT);
    }
    throw error;
  });
}
