import { ANCHOR_CHECK_OUTDATE_DAYS } from '@tk-crawler/biz-shared';

export const ANCHOR_CHECK_OUTDATE_TIME =
  ANCHOR_CHECK_OUTDATE_DAYS * 1000 * 60 * 60 * 24; // 7天之内如果检测过，那么暂时不检测
export const ANCHORS_CHECK_NUMBER = 30;
