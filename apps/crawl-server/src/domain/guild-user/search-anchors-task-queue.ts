import { ConcurrentLimitTaskQueue } from '@tk-crawler/shared';

export const searchAnchorsTaskQueue = new ConcurrentLimitTaskQueue(2);
