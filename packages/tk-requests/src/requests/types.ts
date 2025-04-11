import type { Region } from '@tk-crawler/biz-shared';

export type WithRegion<T extends object> = T & { region: Region[] | 'all' };
